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

const itemSchema = z.object({
  part_code: z.string().min(1, "Código é obrigatório"),
  part_name: z.string().min(1, "Nome é obrigatório"),
  category: z.string().min(1, "Categoria é obrigatória"),
  subcategory: z.string().optional(),
  quantity: z.string().min(1),
  minimum_stock: z.string().min(1),
  critical_stock: z.string().min(1),
  unit_price: z.string().optional(),
  supplier: z.string().optional(),
  location: z.string().optional(),
  barcode: z.string().optional(),
  notes: z.string().optional(),
});

type ItemFormValues = z.infer<typeof itemSchema>;

interface InventoryItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: any | null;
  onSuccess: () => void;
}

const categories = [
  'Peças Mecânicas',
  'Pneus e Rodas',
  'Filtros',
  'Fluidos',
  'Elétrica',
  'Lavajato - Químicos',
  'Lavajato - Consumíveis',
  'Ferramentas',
];

export function InventoryItemDialog({ open, onOpenChange, item, onSuccess }: InventoryItemDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      part_code: "",
      part_name: "",
      category: "",
      subcategory: "",
      quantity: "0",
      minimum_stock: "5",
      critical_stock: "2",
      unit_price: "",
      supplier: "",
      location: "",
      barcode: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (item) {
      form.reset({
        part_code: item.part_code || "",
        part_name: item.part_name || "",
        category: item.category || "",
        subcategory: item.subcategory || "",
        quantity: String(item.quantity || 0),
        minimum_stock: String(item.minimum_stock || 5),
        critical_stock: String(item.critical_stock || 2),
        unit_price: item.unit_price ? String(item.unit_price) : "",
        supplier: item.supplier || "",
        location: item.location || "",
        barcode: item.barcode || "",
        notes: item.notes || "",
      });
    } else {
      form.reset();
    }
  }, [item, open]);

  const onSubmit = async (values: ItemFormValues) => {
    setIsLoading(true);
    try {
      const data = {
        part_code: values.part_code,
        part_name: values.part_name,
        category: values.category,
        subcategory: values.subcategory || null,
        quantity: parseInt(values.quantity, 10),
        minimum_stock: parseInt(values.minimum_stock, 10),
        critical_stock: parseInt(values.critical_stock, 10),
        unit_price: values.unit_price ? parseFloat(values.unit_price) : null,
        supplier: values.supplier || null,
        location: values.location || null,
        barcode: values.barcode || null,
        notes: values.notes || null,
      };

      if (item) {
        const { error } = await supabase
          .from('workshop_inventory')
          .update(data)
          .eq('id', item.id);

        if (error) throw error;
        toast.success('Item atualizado com sucesso');
      } else {
        const { error } = await supabase
          .from('workshop_inventory')
          .insert(data);

        if (error) throw error;
        toast.success('Item adicionado com sucesso');
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao salvar item:', error);
      toast.error('Erro ao salvar item');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item ? 'Editar Item' : 'Adicionar Item'}</DialogTitle>
          <DialogDescription>
            {item ? 'Atualize as informações do item' : 'Preencha os dados do novo item'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="part_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="EX: PCA-001" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="part_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Nome do produto" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
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
                name="subcategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subcategoria (opcional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ex: Limpeza, Proteção" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
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
                control={form.control}
                name="minimum_stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estoque Mínimo</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="critical_stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estoque Crítico</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="unit_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço Unitário (R$)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} placeholder="0.00" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="supplier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fornecedor</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Nome do fornecedor" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Localização</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Prateleira, setor..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="barcode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código de Barras</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="EAN/UPC" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Informações adicionais..." rows={3} />
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
                {item ? 'Atualizar' : 'Adicionar'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
