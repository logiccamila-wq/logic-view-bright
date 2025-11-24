import { supabase } from "@/integrations/supabase/client";
import type { CentroCusto } from "@/types/financeiro";

export async function listCentrosCusto() {
  const { data, error } = await supabase
    .from("centros_custo")
    .select("*")
    .order("codigo");

  if (error) throw error;
  return data as CentroCusto[];
}

export async function createCentroCusto(centro: Omit<CentroCusto, "id" | "created_at" | "updated_at">) {
  const { data, error } = await supabase
    .from("centros_custo")
    .insert([centro])
    .select()
    .single();

  if (error) throw error;
  return data as CentroCusto;
}

export async function updateCentroCusto(id: string, centro: Partial<CentroCusto>) {
  const { data, error } = await supabase
    .from("centros_custo")
    .update(centro)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as CentroCusto;
}

export async function deleteCentroCusto(id: string) {
  const { error } = await supabase
    .from("centros_custo")
    .delete()
    .eq("id", id);

  if (error) throw error;
}
