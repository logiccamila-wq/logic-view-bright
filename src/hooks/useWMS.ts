import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface WmsProduct {
  id: string;
  code: string;
  name: string;
  category: string;
  unit: string;
  quantity: number;
  minimum_stock: number;
  unit_price: number;
  location: string;
  zone: string;
  status: string;
  barcode: string;
  created_at: string;
}

export interface WmsMovement {
  id: string;
  product_id: string;
  type: string;
  quantity: number;
  origin: string;
  destination: string;
  reason: string;
  created_at: string;
}

export interface WmsZone {
  id: string;
  name: string;
  capacity_m3: number;
  occupation_pct: number;
  type: string;
}

export function useWmsProducts() {
  return useQuery({
    queryKey: ["wms_products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wms_products")
        .select("*")
        .order("name", { ascending: true });
      if (error) throw error;
      return (data || []) as WmsProduct[];
    },
  });
}

export function useWmsMovements() {
  return useQuery({
    queryKey: ["wms_movements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wms_movements")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data || []) as WmsMovement[];
    },
  });
}

export function useWmsZones() {
  return useQuery({
    queryKey: ["wms_zones"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wms_zones")
        .select("*")
        .order("name", { ascending: true });
      if (error) throw error;
      return (data || []) as WmsZone[];
    },
  });
}

export function useWmsMutations() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createProduct = useMutation({
    mutationFn: async (product: Partial<WmsProduct>) => {
      const { data, error } = await supabase
        .from("wms_products")
        .insert(product)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wms_products"] });
      toast({ title: "Produto cadastrado com sucesso" });
    },
    onError: (e: Error) => toast({ title: "Erro ao cadastrar", description: e.message, variant: "destructive" }),
  });

  const updateProduct = useMutation({
    mutationFn: async ({ id, ...values }: Partial<WmsProduct> & { id: string }) => {
      const { data, error } = await supabase
        .from("wms_products")
        .update({ ...values, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wms_products"] });
      toast({ title: "Produto atualizado" });
    },
    onError: (e: Error) => toast({ title: "Erro ao atualizar", description: e.message, variant: "destructive" }),
  });

  const deleteProduct = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("wms_products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wms_products"] });
      toast({ title: "Produto removido" });
    },
    onError: (e: Error) => toast({ title: "Erro ao remover", description: e.message, variant: "destructive" }),
  });

  const createMovement = useMutation({
    mutationFn: async (mov: Partial<WmsMovement>) => {
      const { data, error } = await supabase
        .from("wms_movements")
        .insert(mov)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wms_movements"] });
      queryClient.invalidateQueries({ queryKey: ["wms_products"] });
      toast({ title: "Movimentação registrada" });
    },
    onError: (e: Error) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  return { createProduct, updateProduct, deleteProduct, createMovement };
}
