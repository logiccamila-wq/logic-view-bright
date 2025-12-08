import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const requestSchema = z.object({
  item_id: z.string().min(1, "Selecione um item"),
  quantity: z.string().min(1, "Quantidade é obrigatória"),
  reason: z.string().min(1, "Motivo é obrigatório"),
  warehouse_type: z.string().default("workshop"),
});

type RequestFormValues = z.infer<typeof requestSchema>;

interface InventoryItemLite {
  id: string;
  part_name: string;
  part_code: string;
  warehouse_type: string | null;
}

interface RequestItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  preselectedItem?: any;
}

export function RequestItemDialog({ open, onOpenChange, onSuccess, preselectedItem }: RequestItemDialogProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [items, setItems] = useState<InventoryItemLite[]>([]);

  const form = useForm<RequestFormValues>({
    resolver: zodResolver(requestSchema) as any,
    defaultValues: {
      item_id: preselectedItem?.id || "",
      quantity: "1",
      reason: "",
      warehouse_type: "workshop",
    },
  });

  useEffect(() => {
    if (open) {
      loadItems();
      if (preselectedItem) {
        form.setValue('item_id', preselectedItem.id);
        form.setValue('warehouse_type', preselectedItem.warehouse_type || 'workshop');
      }
    }
  }, [open, preselectedItem]);

  const loadItems = async () => {
    const { data } = await supabase
      .from('workshop_inventory' as any)
      .select('id, part_name, part_code, warehouse_type')
      .order('part_name');
    setItems((data as any) || []);
  };

  const onSubmit = async (values: RequestFormValues) => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('inventory_requests' as any)
        .insert({
          item_id: values.item_id,
          quantity: parseInt(values.quantity, 10),
          reason: values.reason,
          requester_id: user.id,
          warehouse_type: values.warehouse_type, // This should ideally match the item's type
          status: 'pending'
        });

      if (error) throw error;
      toast.success('Solicitação enviada com sucesso');
      onSuccess();
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error('Erro ao enviar solicitação:', error);
      toast.error('Erro ao enviar solicitação');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter items based on selected warehouse type if needed, 
  // or just show all and let user pick.
  // For now, simplistic approach.

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nova Solicitação de Material</DialogTitle>
          <DialogDescription>
            Solicite materiais do estoque. Um gestor precisará aprovar.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-4">
            <FormField
              control={form.control as any}
              name="item_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!preselectedItem}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um item" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {items.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.part_name} ({item.part_code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control as any}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantidade</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control as any}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motivo / Justificativa</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Para manutenção do veículo X..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Enviando..." : "Enviar Solicitação"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
