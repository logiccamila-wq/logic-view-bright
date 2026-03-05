import { supabase } from "@/integrations/supabase/client";
import type { FolhaPagamento } from "@/types/financeiro";

export async function listFolhaPagamento(competencia?: string) {
  let query = supabase
    .from("folha_pagamento")
    .select("*, employees(*)")
    .order("competencia", { ascending: false });

  if (competencia) {
    query = query.eq("competencia", competencia);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
}

export async function createFolhaPagamento(folha: Omit<FolhaPagamento, "id" | "created_at">) {
  const { data, error } = await supabase
    .from("folha_pagamento")
    .insert([folha])
    .select()
    .single();

  if (error) throw error;
  return data as FolhaPagamento;
}

export async function updateFolhaPagamento(id: string, folha: Partial<FolhaPagamento>) {
  const { data, error } = await supabase
    .from("folha_pagamento")
    .update(folha)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as FolhaPagamento;
}

export async function deleteFolhaPagamento(id: string) {
  const { error } = await supabase
    .from("folha_pagamento")
    .delete()
    .eq("id", id);

  if (error) throw error;
}
