import { supabase } from "@/integrations/supabase/client";
import type { LancamentoFinanceiro } from "@/types/financeiro";

export async function listLancamentos(filters?: {
  dataInicio?: string;
  dataFim?: string;
  tipo?: string;
  planoContasId?: string;
  centroCustoId?: string;
}) {
  let query = supabase
    .from("lancamentos_financeiros")
    .select("*, plano_contas(*), centros_custo(*)")
    .order("data", { ascending: false });

  if (filters?.dataInicio) {
    query = query.gte("data", filters.dataInicio);
  }
  if (filters?.dataFim) {
    query = query.lte("data", filters.dataFim);
  }
  if (filters?.tipo) {
    query = query.eq("tipo", filters.tipo);
  }
  if (filters?.planoContasId) {
    query = query.eq("plano_contas_id", filters.planoContasId);
  }
  if (filters?.centroCustoId) {
    query = query.eq("centro_custo_id", filters.centroCustoId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
}

export async function createLancamento(lancamento: Omit<LancamentoFinanceiro, "id" | "created_at">) {
  const { data, error } = await supabase
    .from("lancamentos_financeiros")
    .insert([{
      ...lancamento,
      plano_contas_id: lancamento.plano_contas_id || null,
      centro_custo_id: lancamento.centro_custo_id || null,
      vehicle_placa: lancamento.vehicle_placa || null,
    }])
    .select()
    .single();

  if (error) throw error;
  return data as LancamentoFinanceiro;
}

export async function updateLancamento(id: string, lancamento: Partial<LancamentoFinanceiro>) {
  const { data, error } = await supabase
    .from("lancamentos_financeiros")
    .update(lancamento)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as LancamentoFinanceiro;
}

export async function deleteLancamento(id: string) {
  const { error } = await supabase
    .from("lancamentos_financeiros")
    .delete()
    .eq("id", id);

  if (error) throw error;
}
