import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Edit, ArrowUpDown, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface InventoryItem {
  id: string;
  part_code: string;
  part_name: string;
  category: string;
  quantity: number;
  minimum_stock: number;
  critical_stock: number;
  unit_price: number | null;
  supplier: string | null;
  location: string | null;
}

interface InventoryTableProps {
  inventory: InventoryItem[];
  onEdit: (item: InventoryItem) => void;
  onAddMovement: (item: InventoryItem) => void;
  onRefresh: () => void;
}

export function InventoryTable({ inventory, onEdit, onAddMovement, onRefresh }: InventoryTableProps) {
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Deseja realmente excluir "${name}"?`)) return;

    try {
      const { error } = await supabase
        .from('workshop_inventory')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Item excluído com sucesso');
      onRefresh();
    } catch (error) {
      console.error('Erro ao excluir item:', error);
      toast.error('Erro ao excluir item');
    }
  };

  const getStockBadge = (item: InventoryItem) => {
    if (item.quantity <= item.critical_stock) {
      return <Badge variant="destructive">Crítico</Badge>;
    } else if (item.quantity <= item.minimum_stock) {
      return <Badge variant="outline">Baixo</Badge>;
    }
    return <Badge variant="secondary">Normal</Badge>;
  };

  if (inventory.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Nenhum item encontrado</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead className="text-right">Quantidade</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Valor Unit.</TableHead>
              <TableHead>Fornecedor</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventory.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.part_code}</TableCell>
                <TableCell>{item.part_name}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {item.category}
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {item.quantity}
                </TableCell>
                <TableCell>{getStockBadge(item)}</TableCell>
                <TableCell className="text-right">
                  {item.unit_price 
                    ? `R$ ${item.unit_price.toFixed(2)}`
                    : '-'}
                </TableCell>
                <TableCell className="text-sm">
                  {item.supplier || '-'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onAddMovement(item)}
                      title="Registrar movimentação"
                    >
                      <ArrowUpDown className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onEdit(item)}
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(item.id, item.part_name)}
                      title="Excluir"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
