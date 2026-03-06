import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ScmSupplier {
  id: string;
  code: string;
  name: string;
  cnpj: string;
  category: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  lead_time_days: number;
  reliability_pct: number;
  orders_month: number;
  status: string;
  created_at: string;
}

export interface ScmPurchaseOrder {
  id: string;
  po_number: string;
  supplier_id: string;
  supplier_name: string;
  item_description: string;
  quantity: number;
  unit_price: number;
  total_value: number;
  delivery_date: string;
  status: string;
  notes: string;
  created_at: string;
}

export function useScmSuppliers() {
  return useQuery({
    queryKey: ["scm_suppliers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("scm_suppliers")
        .select("*")
        .order("name", { ascending: true });
      if (error) throw error;
      return (data || []) as ScmSupplier[];
    },
  });
}

export function useScmPurchaseOrders() {
  return useQuery({
    queryKey: ["scm_purchase_orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("scm_purchase_orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as ScmPurchaseOrder[];
    },
  });
}

export function useScmMutations() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createSupplier = useMutation({
    mutationFn: async (supplier: Partial<ScmSupplier>) => {
      const { data, error } = await supabase
        .from("scm_suppliers")
        .insert(supplier)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scm_suppliers"] });
      toast({ title: "Fornecedor cadastrado com sucesso" });
    },
    onError: (e: Error) => toast({ title: "Erro ao cadastrar", description: e.message, variant: "destructive" }),
  });

  const updateSupplier = useMutation({
    mutationFn: async ({ id, ...values }: Partial<ScmSupplier> & { id: string }) => {
      const { data, error } = await supabase
        .from("scm_suppliers")
        .update({ ...values, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scm_suppliers"] });
      toast({ title: "Fornecedor atualizado" });
    },
    onError: (e: Error) => toast({ title: "Erro ao atualizar", description: e.message, variant: "destructive" }),
  });

  const deleteSupplier = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("scm_suppliers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scm_suppliers"] });
      toast({ title: "Fornecedor removido" });
    },
    onError: (e: Error) => toast({ title: "Erro ao remover", description: e.message, variant: "destructive" }),
  });

  const createPurchaseOrder = useMutation({
    mutationFn: async (po: Partial<ScmPurchaseOrder>) => {
      const { data, error } = await supabase
        .from("scm_purchase_orders")
        .insert(po)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scm_purchase_orders"] });
      toast({ title: "Ordem de compra criada" });
    },
    onError: (e: Error) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const updatePurchaseOrder = useMutation({
    mutationFn: async ({ id, ...values }: Partial<ScmPurchaseOrder> & { id: string }) => {
      const { data, error } = await supabase
        .from("scm_purchase_orders")
        .update({ ...values, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scm_purchase_orders"] });
      toast({ title: "Ordem atualizada" });
    },
    onError: (e: Error) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const deletePurchaseOrder = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("scm_purchase_orders").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scm_purchase_orders"] });
      toast({ title: "Ordem removida" });
    },
    onError: (e: Error) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  return { createSupplier, updateSupplier, deleteSupplier, createPurchaseOrder, updatePurchaseOrder, deletePurchaseOrder };
}
