/**
 * Seed EJG Evolução em Transporte - Cliente Piloto
 * 
 * Cadastra: empresa, gestores, motoristas (login CPF/CPF), 
 * veículos (cavalos + carretas), plano de manutenção,
 * service orders, viagens, abastecimentos e alertas.
 * 
 * Uso: node scripts/seed-ejg-piloto.cjs
 * Requer: VITE_API_BASE_URL ou API_BASE_URL definido (default: https://ambitious-ground-0c8824f0f.1.azurestaticapps.net)
 */

const BASE_URL = process.env.API_BASE_URL || process.env.VITE_API_BASE_URL || "https://ambitious-ground-0c8824f0f.1.azurestaticapps.net";
const API = `${BASE_URL}/api/runtime`;

let adminToken = null;

async function apiCall(path, body, token) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  
  const res = await fetch(`${API}/${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  
  const data = await res.json().catch(() => ({}));
  if (!res.ok && res.status >= 400) {
    console.error(`  ❌ ${path}:`, res.status, JSON.stringify(data).slice(0, 200));
  }
  return { status: res.status, data };
}

async function signup(email, password, fullName, role) {
  const res = await apiCall("auth/signup", { email, password, fullName, role });
  if (res.status === 200 || res.status === 201) {
    console.log(`  ✅ Usuário: ${email} (${role})`);
    return res.data;
  } else if (res.status === 409 || (res.data?.error?.message || "").includes("already")) {
    console.log(`  ⏭️  Já existe: ${email}`);
    return null;
  }
  return null;
}

async function login(email, password) {
  const res = await apiCall("auth/signin", { email, password });
  if (res.data?.data?.session?.access_token) {
    return res.data.data.session.access_token;
  }
  if (res.data?.access_token) return res.data.access_token;
  console.error("  ❌ Login falhou:", email);
  return null;
}

async function query(table, filters = [], select = "*") {
  return apiCall("query", { table, select, filters }, adminToken);
}

async function mutate(action, table, values, filters = []) {
  return apiCall("mutate", { action, table, values, filters, returning: "*" }, adminToken);
}

async function upsert(table, values, onConflict) {
  return apiCall("mutate", { action: "upsert", table, values, onConflict, returning: "*" }, adminToken);
}

// ============================================================
// DADOS DA EJG - Extraídos da planilha e EMPRESA_EJG.md
// ============================================================

const EMPRESA = {
  cnpj: "44.185.912/0001-50",
  razao_social: "EJG Evolução em Transporte Ltda.",
  nome_fantasia: "EJG Transporte",
  cidade: "Jaboatão dos Guararapes",
  uf: "PE",
  receita_mensal: 503000,
  margem_bruta: 0.24,
};

// Gestores (login por email, senha padrão)
const GESTORES = [
  { email: "enio.gomes@ejgtransporte.com.br", nome: "Enio Gomes", role: "admin", cargo: "Diretor Operacional", cpf: "00000000001" },
  { email: "jailson.barros@ejgtransporte.com.br", nome: "Jailson Barros", role: "finance", cargo: "Diretor Administrativo/Financeiro", cpf: "00000000002" },
  { email: "edjane.barros@ejgtransporte.com.br", nome: "Edjane Pereira de Barros", role: "admin", cargo: "Gerente Geral", cpf: "00000000003" },
];

// Motoristas da planilha (login CPF/CPF)
const MOTORISTAS = [
  { frota: 2, nome: "Ednaldo", placa_vinculada: "RCP3F7", cpf: "11111111101", cnh: "PE001234567", cnh_cat: "E", telefone: "81999990001" },
  { frota: 3, nome: "Messias", placa_vinculada: "PES6F45", cpf: "11111111102", cnh: "PE001234568", cnh_cat: "E", telefone: "81999990002" },
  { frota: 4, nome: "Messias", placa_vinculada: "PES6F45", cpf: "11111111102", cnh: "PE001234568", cnh_cat: "E", telefone: "81999990002" }, // mesmo motorista
  { frota: 5, nome: "Hamilton", placa_vinculada: "QQN8J78", cpf: "11111111103", cnh: "PE001234569", cnh_cat: "E", telefone: "81999990003" },
  { frota: 6, nome: "José Antonio", placa_vinculada: "SNO6F99", cpf: "11111111104", cnh: "PE001234570", cnh_cat: "E", telefone: "81999990004" },
  { frota: 7, nome: "Márcio", placa_vinculada: "QIZ3E10", cpf: "11111111105", cnh: "PE001234571", cnh_cat: "E", telefone: "81999990005" },
  { frota: 8, nome: "Rivanio", placa_vinculada: "SOC0G05", cpf: "11111111106", cnh: "PE001234572", cnh_cat: "E", telefone: "81999990006" },
  { frota: 9, nome: "Ruan", placa_vinculada: "EGI4871", cpf: "11111111107", cnh: "PE001234573", cnh_cat: "E", telefone: "81999990007" },
  { frota: 10, nome: "Camila", placa_vinculada: "", cpf: "11111111108", cnh: "PE001234574", cnh_cat: "D", telefone: "81999990008" },
];

// Deduplica motoristas pelo CPF
const MOTORISTAS_UNICOS = [];
const cpfSet = new Set();
for (const m of MOTORISTAS) {
  if (!cpfSet.has(m.cpf)) {
    cpfSet.add(m.cpf);
    MOTORISTAS_UNICOS.push(m);
  }
}

// Veículos - Cavalos Mecânicos (da planilha Preventivas)
const CAVALOS = [
  { placa: "RCP3F7", modelo: "Cavalo Mecânico", marca: "Scania", ano: 2020, tipo: "cavalo", status: "ativo", km: 527874, frota: 2 },
  { placa: "PES6F45", modelo: "Cavalo Mecânico", marca: "Volvo", ano: 2019, tipo: "cavalo", status: "ativo", km: 1214697, frota: 3 },
  { placa: "QQN8J78", modelo: "Cavalo Mecânico", marca: "Mercedes-Benz", ano: 2018, tipo: "cavalo", status: "ativo", km: 702972, frota: 5 },
  { placa: "SNO6F99", modelo: "Cavalo Mecânico", marca: "Volvo", ano: 2021, tipo: "cavalo", status: "ativo", km: 255087, frota: 6 },
  { placa: "QIZ3E10", modelo: "Cavalo Mecânico", marca: "DAF", ano: 2022, tipo: "cavalo", status: "ativo", km: 657500, frota: 7 },
  { placa: "SOC0G05", modelo: "Cavalo Mecânico", marca: "Scania", ano: 2017, tipo: "cavalo", status: "ativo", km: 204735, frota: 8 },
  { placa: "EGI4871", modelo: "Cavalo Mecânico", marca: "Mercedes-Benz", ano: 2016, tipo: "cavalo", status: "ativo", km: 57098, frota: 9 },
  { placa: "PEL8J12", modelo: "Cavalo Mecânico (RESERVA)", marca: "Volvo", ano: 2018, tipo: "cavalo", status: "reserva", km: 603340, frota: 0 },
];

// Veículos - Carretas (da planilha Preventivas)
const CARRETAS = [
  { placa: "KLU1I80", modelo: "Carreta Tanque", marca: "Randon", ano: 2020, tipo: "carreta", status: "ativo", km: 0, frota: 0 },
  { placa: "QHM8J69", modelo: "Carreta Tanque", marca: "Randon", ano: 2019, tipo: "carreta", status: "ativo", km: 0, frota: 0 },
  { placa: "KJV2E27", modelo: "Carreta Tanque", marca: "Randon", ano: 2021, tipo: "carreta", status: "ativo", km: 0, frota: 0 },
  { placa: "BWY5G42", modelo: "Carreta Tanque", marca: "Randon", ano: 2022, tipo: "carreta", status: "ativo", km: 0, frota: 0 },
  { placa: "FLS2F62", modelo: "Carreta Tanque", marca: "Randon", ano: 2018, tipo: "carreta", status: "ativo", km: 0, frota: 0 },
];

const TODOS_VEICULOS = [...CAVALOS, ...CARRETAS];

// Plano de Manutenção Realizado - Cavalos (da planilha)
const MANUTENCOES_CAVALOS = [
  { placa: "RCP3F7", motorista: "Ednaldo", descricao: "TROCA ÓLEO MOTOR + FILTROS LÍQUIDOS + FILTRO DE AR", data: "2025-05-12", km_realizado: 502173, km_proxima: 572173, km_atual: 527874, km_prox_troca: 44299 },
  { placa: "PES6F45", motorista: "Messias", descricao: "TROCA ÓLEO MOTOR + FILTRO LÍQUIDO + AR SECO", data: "2025-04-14", km_realizado: 1156842, km_proxima: 1226842, km_atual: 1214697, km_prox_troca: 12145 },
  { placa: "PES6F45", motorista: "Messias", descricao: "VER TROCA ÓLEO DIFERENCIA NAS NOTAS DE GUILHERME", data: "2025-04-14", km_realizado: 1156842, km_proxima: 1276842, km_atual: 1214697, km_prox_troca: 62145 },
  { placa: "QQN8J78", motorista: "Hamilton", descricao: "TROCA DE ÓLEO DA CAIXA + DIFERENCIAL", data: "2024-12-23", km_realizado: 584049, km_proxima: 704049, km_atual: 702972, km_prox_troca: 1077, obs: "URGENTE" },
  { placa: "QQN8J78", motorista: "Hamilton", descricao: "TROCA DE ÓLEO MOTOR + FILTROS + FILTRO DA PU", data: "2025-09-11", km_realizado: 702972, km_proxima: 772972, km_atual: 710867, km_prox_troca: 62105 },
  { placa: "SNO6F99", motorista: "José Antonio", descricao: "TROCA DE ÓLEO MOTOR + FILTROS + FILTRO DA PU, AR SECO", data: "2025-10-25", km_realizado: 220350, km_proxima: 290350, km_atual: 267127, km_prox_troca: 23223 },
  { placa: "SNO6F99", motorista: "José Antonio", descricao: "MANUTENÇÃO REVISÃO TROCA ÓLEO CAIXA DE MARCHA", data: "2025-05-13", km_realizado: 154786, km_proxima: 274786, km_atual: 255087, km_prox_troca: 19699 },
  { placa: "SNO6F99", motorista: "José Antonio", descricao: "TROCA ÓLEO DIFERENCIAL", data: "2025-02-19", km_realizado: 128177, km_proxima: 248177, km_atual: 255087, km_prox_troca: -6910, obs: "VENCIDO - TROCAR URGENTE" },
  { placa: "QIZ3E10", motorista: "Márcio", descricao: "TROCA DE ÓLEO E FILTROS", data: "2025-06-23", km_realizado: 597742, km_proxima: 667742, km_atual: 657500, km_prox_troca: 10242, obs: "TROCOU OS FILTROS DIA (18/10/25)" },
  { placa: "SOC0G05", motorista: "Rivanio", descricao: "REVISÃO 150.000 KM DAF PI", data: "2025-12-03", km_realizado: 191536, km_proxima: 221536, km_atual: 204735, km_prox_troca: 16801, obs: "REALIZAR REVISÃO DE 01 ANO" },
  { placa: "EGI4871", motorista: "Ruan", descricao: "TROCA TACÓGRAFO ORIGINAL DO CAMINHÃO (21/07/25)", data: "2025-07-21", km_realizado: 1, km_proxima: 57098, km_atual: 22249, km_prox_troca: 34849 },
  { placa: "PEL8J12", motorista: "RESERVA", descricao: "TROCA ÓLEO MOTOR + FILTRO LÍQUIDO + AR SECO (MANUTENÇÃO GERAL)", data: "2025-06-16", km_realizado: 598951, km_proxima: 663951, km_atual: 603340, km_prox_troca: 60611 },
];

// Plano de Manutenção Realizado - Carretas (da planilha)
const MANUTENCOES_CARRETAS = [
  { placa: "KLU1I80", descricao: "PREVENTIVA 60 DIAS", data_realizacao: "2024-03-10", proxima_manut: "2024-12-02", data_previsao: "2024-11-27", obs: "" },
  { placa: "QHM8J69", descricao: "PREVENTIVA 60 DIAS", data_realizacao: "2024-01-10", proxima_manut: "2024-11-30", data_previsao: "2024-11-25", obs: "INÍCIO DE OPERAÇÃO 01/10/24" },
  { placa: "KJV2E27", descricao: "PREVENTIVA 60 DIAS", data_realizacao: "2025-12-20", proxima_manut: "2026-02-18", data_previsao: "2026-02-13", obs: "REFORMADA 30/10/25" },
  { placa: "BWY5G42", descricao: "PREVENTIVA 60 DIAS", data_realizacao: "2026-01-09", proxima_manut: "2026-03-10", data_previsao: "2026-03-05", obs: "REFORMADA 27/01/26" },
  { placa: "FLS2F62", descricao: "PREVENTIVA 60 DIAS", data_realizacao: "2024-07-10", proxima_manut: "2024-12-06", data_previsao: "2024-12-01", obs: "" },
];

// Plano de Manutenção Preventiva por fabricante (intervalos padrão)
const PLANOS_PREVENTIVA = [
  { item: "Troca óleo motor + filtros", tipo: "cavalo", intervalo_km: 70000, tolerancia: 5000 },
  { item: "Troca filtro de ar", tipo: "cavalo", intervalo_km: 70000, tolerancia: 5000 },
  { item: "Troca filtro de combustível", tipo: "cavalo", intervalo_km: 70000, tolerancia: 5000 },
  { item: "Troca óleo da caixa de câmbio", tipo: "cavalo", intervalo_km: 120000, tolerancia: 10000 },
  { item: "Troca óleo diferencial", tipo: "cavalo", intervalo_km: 120000, tolerancia: 10000 },
  { item: "Revisão sistema de freios", tipo: "cavalo", intervalo_km: 80000, tolerancia: 5000 },
  { item: "Revisão suspensão", tipo: "cavalo", intervalo_km: 100000, tolerancia: 10000 },
  { item: "Troca correia alternador", tipo: "cavalo", intervalo_km: 150000, tolerancia: 10000 },
  { item: "Revisão turbo", tipo: "cavalo", intervalo_km: 200000, tolerancia: 15000 },
  { item: "Calibragem de bicos injetores", tipo: "cavalo", intervalo_km: 200000, tolerancia: 10000 },
  { item: "Troca líquido arrefecimento", tipo: "cavalo", intervalo_km: 120000, tolerancia: 10000 },
  { item: "Revisão elétrica geral", tipo: "cavalo", intervalo_km: 100000, tolerancia: 10000 },
  { item: "Alinhamento e balanceamento", tipo: "cavalo", intervalo_km: 50000, tolerancia: 5000 },
  { item: "Verificação tacógrafo", tipo: "cavalo", intervalo_km: 50000, tolerancia: 5000 },
  { item: "Preventiva 60 dias", tipo: "carreta", intervalo_km: 0, tolerancia: 0, intervalo_dias: 60 },
  { item: "Revisão freios carreta", tipo: "carreta", intervalo_km: 60000, tolerancia: 5000 },
  { item: "Inspeção tanque", tipo: "carreta", intervalo_km: 0, tolerancia: 0, intervalo_dias: 180 },
  { item: "Teste hidrostático", tipo: "carreta", intervalo_km: 0, tolerancia: 0, intervalo_dias: 365 },
];

// Viagens recentes simuladas
const VIAGENS = [
  { motorista: "Ednaldo", placa: "RCP3F7", origem: "Suape/PE", destino: "Camaçari/BA", status: "concluida", km: 850 },
  { motorista: "Messias", placa: "PES6F45", origem: "Suape/PE", destino: "São Paulo/SP", status: "em_andamento", km: 2700 },
  { motorista: "Hamilton", placa: "QQN8J78", origem: "Paulista/PE", destino: "Salvador/BA", status: "em_andamento", km: 830 },
  { motorista: "José Antonio", placa: "SNO6F99", origem: "Recife/PE", destino: "Fortaleza/CE", status: "concluida", km: 800 },
  { motorista: "Márcio", placa: "QIZ3E10", origem: "Suape/PE", destino: "Aracaju/SE", status: "concluida", km: 520 },
  { motorista: "Rivanio", placa: "SOC0G05", origem: "Jaboatão/PE", destino: "Maceió/AL", status: "em_andamento", km: 260 },
  { motorista: "Ruan", placa: "EGI4871", origem: "Cabo/PE", destino: "João Pessoa/PB", status: "concluida", km: 120 },
];

// Abastecimentos simulados (custo médio por km) 
const ABASTECIMENTOS = [
  { placa: "RCP3F7", km: 525000, litros: 450, valor: 2700, data_offset_days: -5 },
  { placa: "PES6F45", km: 1210000, litros: 520, valor: 3120, data_offset_days: -3 },
  { placa: "QQN8J78", km: 701000, litros: 380, valor: 2280, data_offset_days: -7 },
  { placa: "SNO6F99", km: 253000, litros: 420, valor: 2520, data_offset_days: -4 },
  { placa: "QIZ3E10", km: 655000, litros: 350, valor: 2100, data_offset_days: -6 },
  { placa: "SOC0G05", km: 203000, litros: 300, valor: 1800, data_offset_days: -2 },
  { placa: "EGI4871", km: 55000, litros: 180, valor: 1080, data_offset_days: -8 },
  { placa: "RCP3F7", km: 520000, litros: 460, valor: 2760, data_offset_days: -15 },
  { placa: "PES6F45", km: 1200000, litros: 500, valor: 3000, data_offset_days: -12 },
  { placa: "QQN8J78", km: 698000, litros: 400, valor: 2400, data_offset_days: -14 },
];

// Alertas de manutenção automáticos
const ALERTAS_MANUTENCAO = [
  {
    alert_name: "Óleo Motor - KM Crítico",
    alert_type: "cost_threshold",
    cost_threshold: 5000,
    period_days: 30,
    email_enabled: true,
    email_recipients: ["enio.gomes@ejgtransporte.com.br", "edjane.barros@ejgtransporte.com.br"],
    whatsapp_enabled: true,
    whatsapp_numbers: ["+5581999990001"],
    is_active: true,
  },
  {
    alert_name: "Manutenção Preventiva Vencida",
    alert_type: "vehicle_specific",
    email_enabled: true,
    email_recipients: ["edjane.barros@ejgtransporte.com.br"],
    is_active: true,
  },
  {
    alert_name: "Custo Manutenção Acima Média",
    alert_type: "trend_increase",
    trend_percentage: 20,
    trend_period_months: 3,
    email_enabled: true,
    email_recipients: ["jailson.barros@ejgtransporte.com.br"],
    is_active: true,
  },
];

// ============================================================
// EXECUÇÃO
// ============================================================

async function main() {
  console.log("🏢 SEED EJG TRANSPORTE - CLIENTE PILOTO");
  console.log(`📡 API: ${API}`);
  console.log("=".repeat(60));

  // 1. Login como admin
  console.log("\n🔑 1. Autenticando como admin...");
  adminToken = await login("admin", "admin123");
  if (!adminToken) {
    console.error("❌ Não foi possível autenticar. Verifique se o backend está rodando.");
    process.exit(1);
  }
  console.log("  ✅ Admin autenticado!");

  // 2. Cadastrar gestores
  console.log("\n👔 2. Cadastrando gestores EJG...");
  for (const g of GESTORES) {
    await signup(g.email, "Ejg@2026", g.nome, g.role);
    // Atualizar profile com dados adicionais
    await mutate("update", "profiles", 
      { cpf: g.cpf, cidade: "Jaboatão dos Guararapes", tipo_vinculo: "CLT" },
      [{ op: "eq", column: "email", value: g.email }]
    );
  }

  // 3. Cadastrar motoristas (login = CPF, senha = CPF)
  console.log("\n🚛 3. Cadastrando motoristas...");
  const motoristaIds = {};
  for (const m of MOTORISTAS_UNICOS) {
    // Email baseado no CPF para login
    const email = `${m.cpf}@ejgtransporte.com.br`;
    const result = await signup(email, m.cpf, m.nome, "driver");
    
    // Buscar o ID do usuário
    const userQuery = await query("app_users", [{ op: "eq", column: "email", value: email }], "id");
    const userId = userQuery.data?.data?.[0]?.id;
    motoristaIds[m.nome] = userId;

    if (userId) {
      // Atualizar profile
      await mutate("update", "profiles",
        { cpf: m.cpf, telefone: m.telefone, cidade: "Jaboatão dos Guararapes", tipo_vinculo: "CLT" },
        [{ op: "eq", column: "id", value: userId }]
      );
      // Inserir/atualizar driver
      await upsert("drivers", 
        { id: userId, cnh: m.cnh, cnh_category: m.cnh_cat, cnh_validity: "2027-12-31", status: "ativo" },
        ["id"]
      );
    }
  }

  // 4. Cadastrar veículos
  console.log("\n🚗 4. Cadastrando veículos...");
  for (const v of TODOS_VEICULOS) {
    await upsert("vehicles",
      { placa: v.placa, modelo: v.modelo, marca: v.marca, ano: v.ano, tipo: v.tipo, status: v.status },
      ["placa"]
    );
    // Se a tabela tiver coluna km, atualizar
    if (v.km > 0) {
      await mutate("update", "vehicles", { km: v.km }, [{ op: "eq", column: "placa", value: v.placa }]).catch(() => null);
    }
  }

  // 5. Cadastrar plano de manutenção preventiva
  console.log("\n🔧 5. Cadastrando plano de manutenção...");
  for (const p of PLANOS_PREVENTIVA) {
    await upsert("maintenance_plans",
      { plan_item: p.item, vehicle_type: p.tipo, interval_km: p.intervalo_km || 0, tolerance_km: p.tolerancia || 0, is_active: true },
      ["plan_item", "vehicle_type"]
    ).catch(async () => {
      // Se upsert falhar (sem constraint unique), tenta insert
      await mutate("insert", "maintenance_plans",
        { plan_item: p.item, vehicle_type: p.tipo, interval_km: p.intervalo_km || 0, tolerance_km: p.tolerancia || 0, is_active: true }
      );
    });
  }

  // 6. Registrar manutenções realizadas como service orders
  console.log("\n📋 6. Registrando manutenções realizadas...");
  for (const m of MANUTENCOES_CAVALOS) {
    const priority = (m.km_prox_troca || 99999) < 5000 ? "alta" : (m.km_prox_troca || 99999) < 15000 ? "media" : "baixa";
    await mutate("insert", "service_orders", {
      vehicle_plate: m.placa,
      status: "concluida",
      description: m.descricao,
      odometer: m.km_realizado,
      vehicle_model: CAVALOS.find(c => c.placa === m.placa)?.modelo || "Cavalo Mecânico",
      completed_at: new Date(m.data).toISOString(),
      created_at: new Date(m.data).toISOString(),
    });
  }

  // Service orders para carretas
  for (const m of MANUTENCOES_CARRETAS) {
    await mutate("insert", "service_orders", {
      vehicle_plate: m.placa,
      status: "concluida",
      description: m.descricao,
      vehicle_model: "Carreta Tanque",
      completed_at: new Date(m.data_realizacao).toISOString(),
      created_at: new Date(m.data_realizacao).toISOString(),
    });
  }

  // 7. Criar viagens
  console.log("\n🗺️  7. Cadastrando viagens...");
  for (const v of VIAGENS) {
    const driverId = motoristaIds[v.motorista] || null;
    const now = new Date();
    const departure = new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000);
    const arrival = new Date(departure.getTime() + (v.km / 60) * 60 * 60 * 1000); // ~60km/h média

    await mutate("insert", "trips", {
      driver_id: driverId,
      driver_name: v.motorista,
      vehicle_plate: v.placa,
      origin: v.origem,
      destination: v.destino,
      status: v.status,
      estimated_departure: departure.toISOString(),
      estimated_arrival: arrival.toISOString(),
    });
  }

  // 8. Registrar abastecimentos
  console.log("\n⛽ 8. Registrando abastecimentos...");
  for (const a of ABASTECIMENTOS) {
    const dataAbast = new Date(Date.now() + a.data_offset_days * 24 * 60 * 60 * 1000);
    await mutate("insert", "refuelings", {
      vehicle_plate: a.placa,
      km: a.km,
      liters: a.litros,
      total_value: a.valor,
      created_at: dataAbast.toISOString(),
    });
  }

  // 9. Criar alertas de manutenção
  console.log("\n🔔 9. Configurando alertas...");
  for (const a of ALERTAS_MANUTENCAO) {
    await mutate("insert", "maintenance_cost_alerts", a);
  }

  // 10. Criar alertas de manutenção vencida/próxima
  console.log("\n⚠️  10. Gerando alertas de manutenção baseados no plano...");
  const alertasVencidos = MANUTENCOES_CAVALOS.filter(m => (m.km_prox_troca || 99999) < 5000);
  for (const m of alertasVencidos) {
    const nivel = m.km_prox_troca < 0 ? "error" : "warning";
    const mensagem = m.km_prox_troca < 0 
      ? `🚨 MANUTENÇÃO VENCIDA: ${m.descricao} no veículo ${m.placa} (${Math.abs(m.km_prox_troca)}km além do previsto)`
      : `⚠️ MANUTENÇÃO PRÓXIMA: ${m.descricao} no veículo ${m.placa} (faltam ${m.km_prox_troca}km)`;
    
    // Notificar gestores
    for (const g of GESTORES) {
      const userQ = await query("app_users", [{ op: "eq", column: "email", value: g.email }], "id");
      const uid = userQ.data?.data?.[0]?.id;
      if (uid) {
        await mutate("insert", "notifications", {
          user_id: uid,
          title: m.km_prox_troca < 0 ? "Manutenção Vencida" : "Manutenção Próxima",
          message: mensagem,
          type: nivel,
          module: "fleet",
          read: false,
        });
      }
    }
  }

  // 11. Tracking GPS simulado
  console.log("\n📍 11. Posições GPS atuais...");
  const posicoes = [
    { placa: "RCP3F7", lat: -8.2840, lng: -35.0219, speed: 75, status: "em_transito" },
    { placa: "PES6F45", lat: -12.9714, lng: -38.5124, speed: 82, status: "em_transito" },
    { placa: "QQN8J78", lat: -9.6498, lng: -35.7089, speed: 60, status: "em_transito" },
    { placa: "SNO6F99", lat: -8.0476, lng: -34.8770, speed: 0, status: "parado" },
    { placa: "QIZ3E10", lat: -10.9111, lng: -37.0717, speed: 0, status: "parado" },
    { placa: "SOC0G05", lat: -9.6658, lng: -35.7353, speed: 68, status: "em_transito" },
    { placa: "EGI4871", lat: -7.1195, lng: -34.8450, speed: 0, status: "parado" },
  ];
  for (const p of posicoes) {
    await mutate("insert", "vehicle_tracking", {
      vehicle_plate: p.placa,
      latitude: p.lat,
      longitude: p.lng,
      speed: p.speed,
      heading: Math.floor(Math.random() * 360),
      status: p.status,
    });
  }

  console.log("\n" + "=".repeat(60));
  console.log("✅ SEED EJG TRANSPORTE COMPLETO!");
  console.log("=".repeat(60));
  console.log("\n📌 Logins criados:");
  console.log("  Gestores:");
  for (const g of GESTORES) {
    console.log(`    ${g.nome}: ${g.email} / Ejg@2026`);
  }
  console.log("  Motoristas (login CPF / senha CPF):");
  for (const m of MOTORISTAS_UNICOS) {
    console.log(`    ${m.nome}: ${m.cpf}@ejgtransporte.com.br / ${m.cpf}`);
  }
  console.log(`\n🚛 Veículos: ${TODOS_VEICULOS.length} (${CAVALOS.length} cavalos + ${CARRETAS.length} carretas)`);
  console.log(`🔧 Manutenções: ${MANUTENCOES_CAVALOS.length + MANUTENCOES_CARRETAS.length} registradas`);
  console.log(`📋 Planos preventivos: ${PLANOS_PREVENTIVA.length} itens`);
  console.log(`🗺️  Viagens: ${VIAGENS.length}`);
  console.log(`⛽ Abastecimentos: ${ABASTECIMENTOS.length}`);
  console.log(`🔔 Alertas: ${ALERTAS_MANUTENCAO.length} configurados`);
  console.log(`⚠️  Manutenções urgentes: ${alertasVencidos.length}`);
  
  console.log("\n🚀 App Motorista: https://ambitious-ground-0c8824f0f.1.azurestaticapps.net/app-motorista");
  console.log("🌐 Sistema: https://ambitious-ground-0c8824f0f.1.azurestaticapps.net");
  console.log("🌐 Domínio: https://www.xyzlogicflow.com.br");
}

main().catch(err => {
  console.error("❌ Erro fatal:", err.message);
  process.exit(1);
});
