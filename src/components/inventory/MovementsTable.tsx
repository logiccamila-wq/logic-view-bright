import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowDown, ArrowUp, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Movement {
  id: string;
  movement_type: string;
  quantity: number;
  reason: string;
  reference_document: string | null;
  created_at: string;
  workshop_inventory: {
    part_name: string;
    part_code: string;
  };
}

interface MovementsTableProps {
  movements: Movement[];
}

export function MovementsTable({ movements }: MovementsTableProps) {
  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'entrada':
        return <ArrowDown className="w-4 h-4 text-green-600" />;
      case 'saida':
        return <ArrowUp className="w-4 h-4 text-red-600" />;
      case 'ajuste':
        return <RefreshCw className="w-4 h-4 text-blue-600" />;
      default:
        return <RefreshCw className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getMovementBadge = (type: string) => {
    const variants = {
      entrada: { label: 'Entrada', variant: 'default' as const },
      saida: { label: 'Saída', variant: 'destructive' as const },
      ajuste: { label: 'Ajuste', variant: 'outline' as const },
      transferencia: { label: 'Transferência', variant: 'secondary' as const },
    };
    return variants[type as keyof typeof variants] || { label: type, variant: 'secondary' as const };
  };

  if (movements.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Nenhuma movimentação registrada</p>
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
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Data/Hora</TableHead>
              <TableHead>Item</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Quantidade</TableHead>
              <TableHead>Motivo</TableHead>
              <TableHead>Documento</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {movements.map((movement) => {
              const badge = getMovementBadge(movement.movement_type);
              return (
                <TableRow key={movement.id}>
                  <TableCell>{getMovementIcon(movement.movement_type)}</TableCell>
                  <TableCell className="text-sm">
                    {format(new Date(movement.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{movement.workshop_inventory.part_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {movement.workshop_inventory.part_code}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={badge.variant}>{badge.label}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {movement.movement_type === 'entrada' ? '+' : movement.movement_type === 'saida' ? '-' : ''}
                    {movement.quantity}
                  </TableCell>
                  <TableCell className="text-sm">{movement.reason}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {movement.reference_document || '-'}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
