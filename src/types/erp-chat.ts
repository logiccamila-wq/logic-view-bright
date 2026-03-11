/** Structured JSON response model for ERP AI chat */

export interface ERPKpiWidget {
  type: "kpi";
  title: string;
  value: string;
  change?: string;
  positive?: boolean;
}

export interface ERPInsightWidget {
  type: "insight";
  title: string;
  content: string;
}

export interface ERPTableWidget {
  type: "table";
  title: string;
  columns: string[];
  rows: (string | number)[][];
}

export interface ERPChartDataPoint {
  label: string;
  value: number;
}

export interface ERPChartWidget {
  type: "chart";
  title: string;
  chartType: "bar" | "line" | "pie";
  data: ERPChartDataPoint[];
}

export type ERPWidget =
  | ERPKpiWidget
  | ERPInsightWidget
  | ERPTableWidget
  | ERPChartWidget;

/** Structured response from the AI backend */
export interface ERPChatResponse {
  message: string;
  widgets?: ERPWidget[];
  suggested_actions?: string[];
}

/** Chat message with optional parsed widgets */
export interface ERPChatMessage {
  role: "user" | "assistant";
  content: string;
  widgets?: ERPWidget[];
  suggested_actions?: string[];
  timestamp: number;
}

/** Slider context sent alongside each chat request */
export interface ERPSliderContext {
  optimization: number;
  risk: number;
}

/** System prompt identity constants */
export const ERP_SYSTEM_PROMPT = `Você é o assistente de IA do ERP LogicFlow — um sistema de gestão integrada para operações logísticas.

IDENTIDADE:
- Responda com tom profissional, futurista, técnico e objetivo.
- Use linguagem compatível com uma interface high-tech dark mode.
- Termos sugeridos: "renderizando análise", "processando shaders de dados", "parâmetros sincronizados", "simulação concluída".

FORMATO DE RESPOSTA:
- Sempre que possível, responda em JSON estruturado com esta estrutura:
{
  "message": "texto principal",
  "widgets": [
    { "type": "kpi", "title": "...", "value": "..." },
    { "type": "insight", "title": "...", "content": "..." },
    { "type": "table", "title": "...", "columns": [], "rows": [] },
    { "type": "chart", "title": "...", "chartType": "bar", "data": [{ "label": "...", "value": 0 }] }
  ],
  "suggested_actions": ["...", "..."]
}

INTERATIVIDADE:
- Considere os parâmetros optimization e risk recebidos do frontend.
- Faça recomendações ajustáveis por sliders.

CONTEXTO ERP:
- Priorize respostas sobre: faturamento, estoque, margem, fluxo de caixa, previsão, risco operacional, clientes, compras e vendas.

TOM:
- Ultra-rápido, claro, executivo, sem exageros literários, foco em ação e análise.`;
