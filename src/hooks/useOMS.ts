import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface OmsOrder {
  id: string;
  order_number: string;
  customer_name: string;
  customer_document: string;
  order_date: string;
  delivery_date: string;
  origin: string;
  destination: string;
  priority: string;
  items_description: string;
  total_value: number;
  status: string;
  payment_status: string;
  notes: string;
  created_at: string;
}

export interface OmsOrderItem {
  id: string;
  order_id: string;
  product_name: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export function useOmsOrders() {
  return useQuery({
    queryKey: ["oms_orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("oms_orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as OmsOrder[];
    },
  });
}

export function useOmsOrderItems(orderId?: string) {
  return useQuery({
    queryKey: ["oms_order_items", orderId],
    enabled: !!orderId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("oms_order_items")
        .select("*")
        .eq("order_id", orderId!);
      if (error) throw error;
      return (data || []) as OmsOrderItem[];
    },
  });
}

export function useOmsMutations() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createOrder = useMutation({
    mutationFn: async (order: Partial<OmsOrder>) => {
      const { data, error } = await supabase
        .from("oms_orders")
        .insert(order)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["oms_orders"] });
      toast({ title: "Pedido criado com sucesso" });
    },
    onError: (e: Error) => toast({ title: "Erro ao criar pedido", description: e.message, variant: "destructive" }),
  });

  const updateOrder = useMutation({
    mutationFn: async ({ id, ...values }: Partial<OmsOrder> & { id: string }) => {
      const { data, error } = await supabase
        .from("oms_orders")
        .update({ ...values, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["oms_orders"] });
      toast({ title: "Pedido atualizado" });
    },
    onError: (e: Error) => toast({ title: "Erro ao atualizar", description: e.message, variant: "destructive" }),
  });

  const deleteOrder = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("oms_orders").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["oms_orders"] });
      toast({ title: "Pedido removido" });
    },
    onError: (e: Error) => toast({ title: "Erro ao remover", description: e.message, variant: "destructive" }),
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("oms_orders")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["oms_orders"] });
      toast({ title: "Status atualizado" });
    },
    onError: (e: Error) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  return { createOrder, updateOrder, deleteOrder, updateStatus };
}
