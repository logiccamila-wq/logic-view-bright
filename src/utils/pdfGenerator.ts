import { jsPDF } from "jspdf";

interface WeeklyReportData {
  driver_name: string;
  ano: number;
  semana: number;
  data_inicio: string;
  data_fim: string;
  total_horas_trabalhadas: number;
  total_horas_direcao: number;
  total_horas_extras: number;
  total_horas_espera: number;
  total_violacoes: number;
  dados_detalhados?: any;
  signature_data?: string;
}

export const generateWeeklyReportPDF = async (data: WeeklyReportData): Promise<Blob> => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.text("EJG Evolução em Transporte Ltda.", 105, 20, { align: "center" });
  
  doc.setFontSize(16);
  doc.text("Relatório Semanal de Jornada de Trabalho", 105, 30, { align: "center" });
  
  // Driver info
  doc.setFontSize(12);
  doc.text(`Motorista: ${data.driver_name}`, 20, 45);
  doc.text(`Período: Semana ${data.semana}/${data.ano}`, 20, 52);
  doc.text(
    `De ${new Date(data.data_inicio).toLocaleDateString("pt-BR")} até ${new Date(data.data_fim).toLocaleDateString("pt-BR")}`,
    20,
    59
  );

  // Compliance section
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Conformidade com Lei nº 13.103/2015", 20, 75);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  
  // Hours worked
  let yPos = 85;
  doc.text(`Total de Horas Trabalhadas: ${(data.total_horas_trabalhadas / 60).toFixed(2)}h`, 20, yPos);
  yPos += 7;
  doc.text(`Tempo de Direção: ${(data.total_horas_direcao / 60).toFixed(2)}h`, 20, yPos);
  yPos += 7;
  doc.text(`Horas Extras: ${(data.total_horas_extras / 60).toFixed(2)}h`, 20, yPos);
  yPos += 7;
  doc.text(`Tempo de Espera: ${(data.total_horas_espera / 60).toFixed(2)}h`, 20, yPos);
  yPos += 7;
  doc.text(`Violações Registradas: ${data.total_violacoes}`, 20, yPos);

  // Legal limits
  yPos += 15;
  doc.setFont("helvetica", "bold");
  doc.text("Limites Legais (Lei 13.103/2015):", 20, yPos);
  doc.setFont("helvetica", "normal");
  
  yPos += 7;
  doc.text("• Jornada diária: 8 horas (podendo chegar a 12h com horas extras)", 25, yPos);
  yPos += 7;
  doc.text("• Tempo máximo de direção contínua: 5h30 (carga) / 4h (passageiros)", 25, yPos);
  yPos += 7;
  doc.text("• Intervalo interjornada mínimo: 11 horas", 25, yPos);

  // Observations
  if (data.dados_detalhados?.observacoes) {
    yPos += 15;
    doc.setFont("helvetica", "bold");
    doc.text("Observações:", 20, yPos);
    doc.setFont("helvetica", "normal");
    yPos += 7;
    const observations = doc.splitTextToSize(data.dados_detalhados.observacoes, 170);
    doc.text(observations, 20, yPos);
    yPos += observations.length * 7;
  }

  // Signature
  yPos += 20;
  if (data.signature_data) {
    doc.addImage(data.signature_data, "PNG", 20, yPos, 60, 20);
    yPos += 25;
    doc.text("_".repeat(40), 20, yPos);
    yPos += 5;
    doc.text(`Assinatura Digital - ${data.driver_name}`, 20, yPos);
    yPos += 5;
    doc.text(`Data: ${new Date().toLocaleString("pt-BR")}`, 20, yPos);
  } else {
    doc.text("_".repeat(40), 20, yPos);
    yPos += 5;
    doc.text(`Assinatura do Motorista - ${data.driver_name}`, 20, yPos);
    yPos += 10;
    doc.text("_".repeat(40), 120, yPos - 10);
    yPos += 5;
    doc.text("Assinatura do Gestor", 120, yPos - 10);
  }

  // Footer
  doc.setFontSize(8);
  doc.text(
    "Este documento foi gerado eletronicamente e possui validade legal conforme legislação vigente.",
    105,
    280,
    { align: "center" }
  );

  return doc.output("blob");
};

interface PayrollData {
  driver_name: string;
  mes: number;
  ano: number;
  salario_base: number;
  horas_normais: number;
  horas_extras: number;
  horas_espera: number;
  valor_horas_normais: number;
  valor_horas_extras: number;
  valor_horas_espera: number;
  total_valor_ctes: number;
  total_combustivel: number;
  base_calculo_gratificacao: number;
  valor_gratificacao: number;
  total_bruto: number;
  total_liquido: number;
  signature_data?: string;
}

export const generatePayrollPDF = async (data: PayrollData): Promise<Blob> => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.text("EJG Evolução em Transporte Ltda.", 105, 20, { align: "center" });
  
  doc.setFontSize(16);
  doc.text("Demonstrativo de Pagamento", 105, 30, { align: "center" });
  
  // Employee info
  doc.setFontSize(12);
  doc.text(`Funcionário: ${data.driver_name}`, 20, 45);
  doc.text(`Período: ${String(data.mes).padStart(2, "0")}/${data.ano}`, 20, 52);

  // Hours worked
  let yPos = 70;
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Horas Trabalhadas", 20, yPos);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  yPos += 10;
  doc.text(`Horas Normais: ${data.horas_normais.toFixed(2)}h`, 20, yPos);
  doc.text(`R$ ${data.valor_horas_normais.toFixed(2)}`, 150, yPos);
  
  yPos += 7;
  doc.text(`Horas Extras: ${data.horas_extras.toFixed(2)}h`, 20, yPos);
  doc.text(`R$ ${data.valor_horas_extras.toFixed(2)}`, 150, yPos);
  
  yPos += 7;
  doc.text(`Horas Espera: ${data.horas_espera.toFixed(2)}h`, 20, yPos);
  doc.text(`R$ ${data.valor_horas_espera.toFixed(2)}`, 150, yPos);

  // Gratification
  yPos += 15;
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Gratificação", 20, yPos);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  yPos += 10;
  doc.text(`Valor Total CTe's: R$ ${data.total_valor_ctes.toFixed(2)}`, 20, yPos);
  
  yPos += 7;
  doc.text(`Desconto 17%: R$ ${(data.total_valor_ctes * 0.17).toFixed(2)}`, 20, yPos);
  
  yPos += 7;
  doc.text(`Combustível: R$ ${data.total_combustivel.toFixed(2)}`, 20, yPos);
  
  yPos += 7;
  doc.text(`Base de Cálculo: R$ ${data.base_calculo_gratificacao.toFixed(2)}`, 20, yPos);
  
  yPos += 7;
  doc.setFont("helvetica", "bold");
  doc.text(`Gratificação (3%): R$ ${data.valor_gratificacao.toFixed(2)}`, 20, yPos);

  // Totals
  yPos += 15;
  doc.setFontSize(12);
  doc.text(`Salário Base: R$ ${data.salario_base.toFixed(2)}`, 20, yPos);
  
  yPos += 7;
  doc.text(`Total Bruto: R$ ${data.total_bruto.toFixed(2)}`, 20, yPos);
  
  yPos += 10;
  doc.setFontSize(14);
  doc.text(`TOTAL LÍQUIDO: R$ ${data.total_liquido.toFixed(2)}`, 20, yPos);

  // Signature
  yPos += 25;
  if (data.signature_data) {
    doc.addImage(data.signature_data, "PNG", 20, yPos, 60, 20);
    yPos += 25;
    doc.text("_".repeat(40), 20, yPos);
    yPos += 5;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Assinatura Digital - ${data.driver_name}`, 20, yPos);
    yPos += 5;
    doc.text(`Data: ${new Date().toLocaleString("pt-BR")}`, 20, yPos);
  }

  // Footer
  doc.setFontSize(8);
  doc.text(
    "Este documento possui validade legal e foi gerado eletronicamente.",
    105,
    280,
    { align: "center" }
  );

  return doc.output("blob");
};