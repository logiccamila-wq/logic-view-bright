export type ModuleCategory =
  | "operacoes"
  | "financeiro"
  | "comercial"
  | "manutencao"
  | "pessoas"
  | "logistica"
  | "analiticos"
  | "integracoes";

export interface ModuleDef {
  slug: string;
  name: string;
  category: ModuleCategory;
  description: string;
  icon?: string;
  route?: string;
  enabled?: boolean;
}

