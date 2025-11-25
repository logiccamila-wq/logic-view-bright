import { supabase } from "@/integrations/supabase/client";
import type { PlanoContas } from "@/types/financeiro";

export async function listPlanoContas() {
  const { data, error } = await supabase
    .from("plano_contas")
    .select("*, centros_custo(*)")
    .order("codigo");

  if (error) throw error;
  return data;
}

export async function createPlanoContas(conta: Omit<PlanoContas, "id" | "created_at" | "updated_at">) {
  const { data, error } = await supabase
    .from("plano_contas")
    .insert([{
      ...conta,
      centro_custo_id: conta.centro_custo_id || null,
      classe: conta.classe || null,
      descricao: conta.descricao || null,
    }])
    .select()
    .single();

  if (error) throw error;
  return data as PlanoContas;
}

export async function updatePlanoContas(id: string, conta: Partial<PlanoContas>) {
  const { data, error } = await supabase
    .from("plano_contas")
    .update(conta)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as PlanoContas;
}

export async function deletePlanoContas(id: string) {
  const { error } = await supabase
    .from("plano_contas")
    .delete()
    .eq("id", id);

  if (error) throw error;
}
