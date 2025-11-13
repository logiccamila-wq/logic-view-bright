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
import { Loader2 } from "lucide-react";

const movementSchema = z.object({
  item_id: z.string().min(1, "Item é obrigatório"),
  movement_type: z.enum(["entrada", "saida", "ajuste", "transferencia"]),
  quantity: z.string().min(1, "Quantidade é obrigatória"),
  reason: z.string().min(1, "Motivo é obrigatório"),
  reference_document: z.string().optional(),
  notes: z.string().optional(),
});

type MovementFormValues = z.infer<typeof movementSchema>;

interface MovementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: any | null;
  inventory: any[];
  onSuccess: () => void;
}

export function MovementDialog({ open, onOpenChange, item, inventory, onSuccess }: MovementDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<MovementFormValues>({
    resolver: zodResolver(movementSchema),
    defaultValues: {
      item_id: "",
      movement_type: "entrada",
      quantity: "1",
      reason: "",
      reference_document: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (item) {
      form.setValue('item_id', item.id);
    }
  }, [item, open]);

  const onSubmit = async (values: MovementFormValues) => {
    setIsLoading(true);
    try {
      const quantity = parseInt(values.quantity, 10);
      
      if (quantity <= 0) {
        toast.error('Quantidade deve ser maior que zero');
        return;
      }

      const selectedItem = inventory.find(i => i.id === values.item_id);
      if (!selectedItem) {
        toast.error('Item não encontrado');
        return;
      }

      let newQuantity = selectedItem.quantity;
      
      switch (values.movement_type) {
        case 'entrada':
          newQuantity += quantity;
          break;
        case 'saida':
          newQuantity -= quantity;
          if (newQuantity < 0) {
            toast.error('Quantidade insuficiente em estoque');
            return;
          }
          break;
        case 'ajuste':
          newQuantity = quantity;
          break;
      }

      // Registrar movimentação
      const { error: movError } = await supabase
        .from('inventory_movements')
        .insert({
          item_id: values.item_id,
          movement_type: values.movement_type,
          quantity: quantity,
          reason: values.reason,
          reference_document: values.reference_document || null,
          notes: values.notes || null,
          responsible_user_id: (await supabase.auth.getUser()).data.user?.id,
        });

      if (movError) throw movError;

      // Atualizar quantidade em estoque
      const { error: updateError } = await supabase
        .from('workshop_inventory')
        .update({ 
          quantity: newQuantity,
          last_restocked: values.movement_type === 'entrada' ? new Date().toISOString() : selectedItem.last_restocked
        })
        .eq('id', values.item_id);

      if (updateError) throw updateError;

      toast.success('Movimentação registrada com sucesso');
      onSuccess();
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error('Erro ao registrar movimentação:', error);
      toast.error('Erro ao registrar movimentação');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Nova Movimentação</DialogTitle>
          <DialogDescription>
            Registre entrada, saída ou ajuste de estoque
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="item_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value}
                    disabled={!!item}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o item" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {inventory.map(inv => (
                        <SelectItem key={inv.id} value={inv.id}>
                          {inv.part_name} ({inv.part_code}) - Estoque: {inv.quantity}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="movement_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Movimentação</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="entrada">Entrada</SelectItem>
                      <SelectItem value="saida">Saída</SelectItem>
                      <SelectItem value="ajuste">Ajuste</SelectItem>
                      <SelectItem value="transferencia">Transferência</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantidade</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motivo</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: Compra, Uso em OS #123, Inventário" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reference_document"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Documento de Referência (opcional)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="NF, OS, etc." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações (opcional)</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={2} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Registrar
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
