import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface DREEntry {
  id: string;
  categoria: string;
  subcategoria?: string;
  descricao?: string;
  valor: number;
  tipo: "RECEITA" | "DESPESA";
  data: string;
  origem_tipo?: string;
}

interface DRETableProps {
  entries: DREEntry[];
}

export function DRETable({ entries }: DRETableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const getTipoBadge = (tipo: string) => {
    return tipo === "RECEITA"
      ? "bg-green-500/20 text-green-600"
      : "bg-red-500/20 text-red-600";
  };

  // Agrupar por categoria
  const groupedEntries = entries.reduce((acc, entry) => {
    if (!acc[entry.categoria]) {
      acc[entry.categoria] = [];
    }
    acc[entry.categoria].push(entry);
    return acc;
  }, {} as Record<string, DREEntry[]>);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detalhamento DRE</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Subcategoria</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(groupedEntries).map(([categoria, items]) => (
              <>
                <TableRow key={categoria} className="bg-muted/50">
                  <TableCell colSpan={5} className="font-bold">
                    {categoria}
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {formatCurrency(
                      items.reduce((sum, item) => {
                        return sum + (item.tipo === "RECEITA" ? item.valor : -item.valor);
                      }, 0)
                    )}
                  </TableCell>
                </TableRow>
                {items.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="text-sm">
                      {formatDate(entry.data)}
                    </TableCell>
                    <TableCell>{entry.categoria}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {entry.subcategoria || "-"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {entry.descricao || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge className={getTipoBadge(entry.tipo)}>
                        {entry.tipo}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {entry.tipo === "RECEITA" ? "+" : "-"}
                      {formatCurrency(entry.valor)}
                    </TableCell>
                  </TableRow>
                ))}
              </>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
