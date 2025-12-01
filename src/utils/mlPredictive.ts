/**
 * ML Preditiva - Funções de Machine Learning para análise e previsão
 * Implementa algoritmos de análise preditiva para manutenção, custos e rotas
 */

interface TPMSReading {
  pressure_psi: number;
  temperature_celsius: number | null;
  tread_depth_mm: number | null;
  alert_level: string;
  created_at: string;
  vehicle_plate: string;
  tire_position: string;
}

interface ServiceOrder {
  status: string;
  created_at: string;
  completed_at: string | null;
  vehicle_plate: string;
  odometer: number;
  labor_hours: number | null;
}

interface Refueling {
  km: number;
  liters: number;
  total_value: number;
  cost_per_km: number | null;
  timestamp: string;
  vehicle_plate: string;
}

/**
 * Análise de tendência de TPMS para prever falhas de pneus
 * Retorna score de risco (0-100) baseado em pressão, temperatura e histórico
 */
export function predictTireFailureRisk(readings: TPMSReading[]): {
  riskScore: number;
  predictedFailureDays: number | null;
  recommendations: string[];
} {
  if (readings.length < 3) {
    return {
      riskScore: 0,
      predictedFailureDays: null,
      recommendations: ["Dados insuficientes para análise preditiva. Necessário mínimo de 3 leituras."]
    };
  }

  // Ordenar por data
  const sorted = [...readings].sort((a, b) => 
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  // Calcular tendências
  const pressures = sorted.map(r => r.pressure_psi);
  const avgPressure = pressures.reduce((a, b) => a + b, 0) / pressures.length;
  const pressureTrend = pressures[pressures.length - 1] - pressures[0];
  
  let riskScore = 0;
  const recommendations: string[] = [];

  // Análise de pressão crítica (< 28 PSI ou > 35 PSI)
  const lastPressure = pressures[pressures.length - 1];
  if (lastPressure < 28) {
    riskScore += 35;
    recommendations.push("⚠️ CRÍTICO: Pressão abaixo do recomendado. Risco de estouro.");
  } else if (lastPressure > 35) {
    riskScore += 25;
    recommendations.push("⚠️ ALERTA: Pressão acima do ideal. Desgaste irregular.");
  }

  // Tendência de perda de pressão
  if (pressureTrend < -2) {
    riskScore += 30;
    recommendations.push("📉 Perda progressiva de pressão detectada. Possível furo lento.");
  }

  // Análise de temperatura (se disponível)
  const temps = sorted
    .map(r => r.temperature_celsius)
    .filter(t => t !== null) as number[];
  
  if (temps.length > 0) {
    const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length;
    if (avgTemp > 75) {
      riskScore += 20;
      recommendations.push("🔥 Temperatura elevada. Risco de falha por superaquecimento.");
    }
  }

  // Análise de profundidade do pneu
  const treads = sorted
    .map(r => r.tread_depth_mm)
    .filter(t => t !== null) as number[];
  
  if (treads.length > 0 && treads[treads.length - 1] < 3) {
    riskScore += 25;
    recommendations.push("🔴 Profundidade crítica. Substituição urgente recomendada.");
  }

  // Prever dias até falha baseado em tendências
  let predictedDays: number | null = null;
  if (pressureTrend < -0.5 && sorted.length >= 5) {
    // Regressão linear simples para estimar quando pressão atingirá nível crítico
    const daysPerReading = 7; // Assumindo leituras semanais
    const daysToFailure = ((lastPressure - 25) / Math.abs(pressureTrend)) * daysPerReading;
    predictedDays = Math.max(0, Math.round(daysToFailure));
    
    if (predictedDays < 14) {
      recommendations.push(`⏰ Falha prevista em ${predictedDays} dias. Agendar manutenção imediata.`);
    }
  }

  if (recommendations.length === 0) {
    recommendations.push("✅ Pneu em boas condições. Manter monitoramento regular.");
  }

  return {
    riskScore: Math.min(100, riskScore),
    predictedFailureDays: predictedDays,
    recommendations
  };
}

export function xgboostLikeClassification(features: Array<{ value: number; weight?: number }>): { score: number; label: 'low' | 'medium' | 'high' } {
  const base = 0.5;
  const sum = features.reduce((s, f) => s + (f.value * (f.weight ?? 1)), base);
  const score = 1 / (1 + Math.exp(-sum));
  const label = score > 0.7 ? 'high' : score > 0.5 ? 'medium' : 'low';
  return { score, label };
}

export function lstmLikeForecast(series: number[], horizon: number): number[] {
  const out: number[] = [];
  let last = series[series.length - 1] ?? 0;
  const avg = series.slice(-10).reduce((s,v)=>s+v,0)/Math.max(1,Math.min(10,series.length));
  for (let i=0;i<horizon;i++) {
    last = 0.6*last + 0.4*avg;
    out.push(last);
  }
  return out;
}

export function prescriptiveActions(predictions: { failureRisk?: number; costTrend?: 'increasing'|'decreasing'|'stable' }): string[] {
  const recs: string[] = [];
  if ((predictions.failureRisk ?? 0) > 0.7) recs.push('Agendar inspeção imediata e rodízio recomendado');
  if (predictions.costTrend === 'increasing') recs.push('Revisar calibragem e rotas; avaliar recapagem');
  if (predictions.costTrend === 'stable') recs.push('Manter plano e monitorar KPIs semanalmente');
  return recs;
}

/**
 * Prever próxima manutenção baseado em histórico de ordens de serviço
 */
export function predictNextMaintenance(serviceOrders: ServiceOrder[], currentOdometer: number): {
  predictedKm: number;
  predictedDays: number;
  confidence: number;
  maintenanceType: string;
} {
  if (serviceOrders.length < 2) {
    return {
      predictedKm: currentOdometer + 10000,
      predictedDays: 90,
      confidence: 0.3,
      maintenanceType: "Manutenção preventiva padrão"
    };
  }

  // Calcular intervalos médios entre manutenções
  const completed = serviceOrders
    .filter(so => so.completed_at)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  const intervals: number[] = [];
  for (let i = 1; i < completed.length; i++) {
    const kmDiff = Math.abs(completed[i].odometer - completed[i - 1].odometer);
    if (kmDiff > 0) intervals.push(kmDiff);
  }

  const avgInterval = intervals.length > 0 
    ? intervals.reduce((a, b) => a + b, 0) / intervals.length 
    : 10000;

  const lastOdometer = completed[completed.length - 1]?.odometer || currentOdometer;
  const predictedKm = lastOdometer + avgInterval;

  // Estimar dias baseado em km médio por dia (assumindo 200km/dia)
  const kmRemaining = predictedKm - currentOdometer;
  const predictedDays = Math.round(kmRemaining / 200);

  // Calcular confiança baseado na quantidade de dados
  const confidence = Math.min(0.95, 0.4 + (completed.length * 0.1));

  // Determinar tipo de manutenção baseado em intervalo
  let maintenanceType = "Manutenção preventiva";
  if (avgInterval < 5000) {
    maintenanceType = "Revisão de alta frequência";
  } else if (avgInterval > 15000) {
    maintenanceType = "Manutenção maior programada";
  }

  return {
    predictedKm: Math.round(predictedKm),
    predictedDays,
    confidence,
    maintenanceType
  };
}

/**
 * Otimizar custos de combustível usando análise de padrões
 */
export function optimizeFuelCosts(refuelings: Refueling[]): {
  avgCostPerKm: number;
  trend: "increasing" | "decreasing" | "stable";
  inefficientVehicles: Array<{ plate: string; excessCost: number }>;
  recommendations: string[];
} {
  if (refuelings.length < 5) {
    return {
      avgCostPerKm: 0,
      trend: "stable",
      inefficientVehicles: [],
      recommendations: ["Dados insuficientes para análise. Necessário mínimo de 5 abastecimentos."]
    };
  }

  // Calcular custo médio por KM
  const validRefuelings = refuelings.filter(r => r.cost_per_km && r.cost_per_km > 0);
  const avgCostPerKm = validRefuelings.reduce((sum, r) => sum + (r.cost_per_km || 0), 0) / validRefuelings.length;

  // Detectar tendência (últimos 30% vs primeiros 30%)
  const sortedByDate = [...validRefuelings].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  
  const sampleSize = Math.floor(sortedByDate.length * 0.3);
  const recentCosts = sortedByDate.slice(-sampleSize).map(r => r.cost_per_km || 0);
  const oldCosts = sortedByDate.slice(0, sampleSize).map(r => r.cost_per_km || 0);
  
  const avgRecent = recentCosts.reduce((a, b) => a + b, 0) / recentCosts.length;
  const avgOld = oldCosts.reduce((a, b) => a + b, 0) / oldCosts.length;
  
  const trendThreshold = 0.05; // 5%
  let trend: "increasing" | "decreasing" | "stable" = "stable";
  if (avgRecent > avgOld * (1 + trendThreshold)) {
    trend = "increasing";
  } else if (avgRecent < avgOld * (1 - trendThreshold)) {
    trend = "decreasing";
  }

  // Identificar veículos ineficientes (>15% acima da média)
  const vehicleCosts = new Map<string, number[]>();
  validRefuelings.forEach(r => {
    if (!vehicleCosts.has(r.vehicle_plate)) {
      vehicleCosts.set(r.vehicle_plate, []);
    }
    vehicleCosts.get(r.vehicle_plate)!.push(r.cost_per_km || 0);
  });

  const inefficientVehicles: Array<{ plate: string; excessCost: number }> = [];
  vehicleCosts.forEach((costs, plate) => {
    const vehicleAvg = costs.reduce((a, b) => a + b, 0) / costs.length;
    if (vehicleAvg > avgCostPerKm * 1.15) {
      inefficientVehicles.push({
        plate,
        excessCost: +(vehicleAvg - avgCostPerKm).toFixed(2)
      });
    }
  });

  // Gerar recomendações
  const recommendations: string[] = [];
  
  if (trend === "increasing") {
    recommendations.push("📈 Custo/km em alta. Investigar rotas, estilo de condução e pressão de pneus.");
  } else if (trend === "decreasing") {
    recommendations.push("✅ Custo/km em queda. Manter práticas atuais.");
  }

  if (inefficientVehicles.length > 0) {
    recommendations.push(
      `⚠️ ${inefficientVehicles.length} veículo(s) com consumo acima da média. Priorizar revisão.`
    );
    inefficientVehicles.slice(0, 3).forEach(v => {
      recommendations.push(`   • ${v.plate}: +R$ ${v.excessCost.toFixed(2)}/km`);
    });
  } else {
    recommendations.push("✅ Todos os veículos com eficiência dentro da normalidade.");
  }

  if (avgCostPerKm > 1.5) {
    recommendations.push("💡 Custo/km elevado. Considerar treinamento de condução econômica.");
  }

  return {
    avgCostPerKm: +avgCostPerKm.toFixed(2),
    trend,
    inefficientVehicles,
    recommendations
  };
}

/**
 * Calcular score de saúde da frota (0-100)
 */
export function calculateFleetHealthScore(data: {
  tpmsAlerts: number;
  pendingServiceOrders: number;
  totalVehicles: number;
  avgCostPerKm: number;
  recentBreakdowns: number;
}): {
  score: number;
  status: "excellent" | "good" | "fair" | "poor" | "critical";
  factors: Array<{ name: string; impact: number; description: string }>;
} {
  let score = 100;
  const factors: Array<{ name: string; impact: number; description: string }> = [];

  // Penalidade por alertas TPMS (até -25 pontos)
  if (data.tpmsAlerts > 0) {
    const tpmsPenalty = Math.min(25, data.tpmsAlerts * 5);
    score -= tpmsPenalty;
    factors.push({
      name: "Alertas TPMS",
      impact: -tpmsPenalty,
      description: `${data.tpmsAlerts} alerta(s) de pneu detectado(s)`
    });
  }

  // Penalidade por ordens pendentes (até -20 pontos)
  if (data.pendingServiceOrders > 0) {
    const soPenalty = Math.min(20, data.pendingServiceOrders * 4);
    score -= soPenalty;
    factors.push({
      name: "Ordens Pendentes",
      impact: -soPenalty,
      description: `${data.pendingServiceOrders} ordem(ns) de serviço pendente(s)`
    });
  }

  // Penalidade por custo elevado (até -20 pontos)
  if (data.avgCostPerKm > 1.2) {
    const costPenalty = Math.min(20, (data.avgCostPerKm - 1.2) * 20);
    score -= costPenalty;
    factors.push({
      name: "Custo Elevado",
      impact: -costPenalty,
      description: `Custo/km: R$ ${data.avgCostPerKm.toFixed(2)} (acima do ideal)`
    });
  }

  // Penalidade por quebras recentes (até -30 pontos)
  if (data.recentBreakdowns > 0) {
    const breakdownPenalty = Math.min(30, data.recentBreakdowns * 10);
    score -= breakdownPenalty;
    factors.push({
      name: "Quebras Recentes",
      impact: -breakdownPenalty,
      description: `${data.recentBreakdowns} quebra(s) nos últimos 30 dias`
    });
  }

  score = Math.max(0, Math.min(100, score));

  let status: "excellent" | "good" | "fair" | "poor" | "critical";
  if (score >= 90) status = "excellent";
  else if (score >= 75) status = "good";
  else if (score >= 60) status = "fair";
  else if (score >= 40) status = "poor";
  else status = "critical";

  return { score: Math.round(score), status, factors };
}
