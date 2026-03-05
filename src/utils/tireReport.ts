import { jsPDF } from "jspdf";

export const generateTireDiscardReport = async (data: {
  codigo: string;
  medida: string;
  vehicle_plate: string;
  km_rodado: number;
  tread_depth_mm?: number | null;
  motivo: string;
  assinatura_base64?: string;
  photos_base64?: string[];
  fmea?: {
    failure_mode?: string;
    causes?: string;
    effects?: string;
    severity?: number;
    occurrence?: number;
    detection?: number;
    actions?: string;
  };
}) => {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text("Laudo de Descarte de Pneu", 105, 20, { align: "center" });
  doc.setFontSize(12);
  let y = 40;
  doc.text(`Pneu: ${data.codigo} • Medida: ${data.medida}`, 20, y); y += 7;
  doc.text(`Veículo: ${data.vehicle_plate}`, 20, y); y += 7;
  doc.text(`KM Rodado: ${data.km_rodado.toLocaleString()} km`, 20, y); y += 7;
  if (data.tread_depth_mm != null) { doc.text(`Sulco Atual: ${data.tread_depth_mm} mm`, 20, y); y += 7; }
  doc.text(`Motivo: ${data.motivo}`, 20, y); y += 10;
  if (data.fmea) {
    doc.setFontSize(13);
    doc.text("Análise Causa-Efeito (FMEA)", 20, y); y += 8;
    doc.setFontSize(12);
    if (data.fmea.failure_mode) { doc.text(`Modo de Falha: ${data.fmea.failure_mode}`, 20, y); y += 7; }
    if (data.fmea.causes) { doc.text(`Causas: ${data.fmea.causes}`, 20, y, { maxWidth: 170 }); y += 10; }
    if (data.fmea.effects) { doc.text(`Efeitos: ${data.fmea.effects}`, 20, y, { maxWidth: 170 }); y += 10; }
    const s = data.fmea.severity ?? null;
    const o = data.fmea.occurrence ?? null;
    const d = data.fmea.detection ?? null;
    if (s != null || o != null || d != null) {
      const rpn = (s ?? 0) * (o ?? 0) * (d ?? 0);
      doc.text(`Severidade: ${s ?? "-"} • Ocorrência: ${o ?? "-"} • Detecção: ${d ?? "-"} • RPN: ${rpn}`, 20, y); y += 7;
    }
    if (data.fmea.actions) { doc.text(`Ações recomendadas: ${data.fmea.actions}`, 20, y, { maxWidth: 170 }); y += 12; }
  }
  doc.text("Conclusão: O pneu é considerado inservível para uso na frota e deverá ser descartado conforme normas ambientais.", 20, y, { maxWidth: 170 }); y += 12;
  if (data.photos_base64 && data.photos_base64.length > 0) {
    doc.setFontSize(13);
    doc.text("Evidências Fotográficas", 20, y); y += 6;
    const imgs = data.photos_base64;
    let x = 20;
    let rowCount = 0;
    for (let i = 0; i < imgs.length; i++) {
      const base = imgs[i] || "";
      const fmt = base.includes("image/png") ? "PNG" : "JPEG";
      doc.addImage(base, fmt as any, x, y, 50, 38);
      x += 60;
      if ((i + 1) % 3 === 0) { x = 20; y += 42; rowCount++; }
      if (rowCount >= 3) break;
    }
    y += 42;
  }
  if (data.assinatura_base64) {
    doc.addImage(data.assinatura_base64, "PNG", 20, y, 60, 20); y += 25;
  }
  doc.text("______________________________", 20, y); y += 5;
  doc.text("Responsável pela Frota", 20, y);
  return doc.output("blob");
};

export const generateTireRecapReport = async (data: {
  codigo: string;
  medida: string;
  vehicle_plate?: string;
  recap_shop: string;
  valor_recape: number;
  assinatura_base64?: string;
}) => {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text("Laudo de Recapagem de Pneu", 105, 20, { align: "center" });
  doc.setFontSize(12);
  let y = 40;
  doc.text(`Pneu: ${data.codigo} • Medida: ${data.medida}`, 20, y); y += 7;
  if (data.vehicle_plate) { doc.text(`Veículo: ${data.vehicle_plate}`, 20, y); y += 7; }
  doc.text(`Renovadora: ${data.recap_shop}`, 20, y); y += 7;
  doc.text(`Valor Recapagem: R$ ${data.valor_recape.toFixed(2)}`, 20, y); y += 15;
  doc.text("Conclusão: O pneu foi enviado para recapagem, seguindo os padrões técnicos e de segurança.", 20, y, { maxWidth: 170 }); y += 20;
  if (data.assinatura_base64) {
    doc.addImage(data.assinatura_base64, "PNG", 20, y, 60, 20); y += 25;
  }
  doc.text("______________________________", 20, y); y += 5;
  doc.text("Responsável pela Frota", 20, y);
  return doc.output("blob");
};
