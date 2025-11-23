import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, Calendar, User, CheckCircle, XCircle } from "lucide-react";
import { PayrollRecord } from "@/hooks/usePayroll";

interface PayrollCardProps {
  record: PayrollRecord;
  onUpdateStatus: (id: string, status: PayrollRecord["status"]) => void;
  onDelete: (id: string) => void;
}

export function PayrollCard({ record, onUpdateStatus, onDelete }: PayrollCardProps) {
  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      aberta: "bg-yellow-500/20 text-yellow-600",
      fechada: "bg-blue-500/20 text-blue-600",
      paga: "bg-green-500/20 text-green-600",
    };
    return colors[status] || "bg-gray-500/20 text-gray-600";
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      month: "long",
      year: "numeric",
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="w-5 h-5" />
            {record.employee?.nome}
          </CardTitle>
          <Badge className={getStatusBadge(record.status)}>
            {record.status.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">{formatDate(record.mes_referencia)}</span>
          </div>
          <div className="text-sm text-muted-foreground">
            {record.employee?.cargo}
          </div>
        </div>

        <div className="space-y-2 border-t pt-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Salário Base:</span>
            <span className="font-medium">{formatCurrency(record.salario_base)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Horas Extras:</span>
            <span className="font-medium">{formatCurrency(record.horas_extras)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Adicionais:</span>
            <span className="font-medium">
              {formatCurrency(
                record.adicional_noturno +
                  record.adicional_periculosidade +
                  record.adicional_insalubridade +
                  record.outros_adicionais
              )}
            </span>
          </div>
          <div className="flex justify-between text-sm border-t pt-2">
            <span className="font-semibold">Total Bruto:</span>
            <span className="font-semibold">{formatCurrency(record.total_bruto)}</span>
          </div>
          <div className="flex justify-between text-sm text-red-600">
            <span>Descontos (INSS + IRRF):</span>
            <span>-{formatCurrency(record.descontos)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t pt-2">
            <span>Total Líquido:</span>
            <span className="flex items-center gap-1">
              <DollarSign className="w-5 h-5" />
              {formatCurrency(record.total_liquido)}
            </span>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          {record.status === "aberta" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onUpdateStatus(record.id, "fechada")}
              className="flex-1"
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Fechar
            </Button>
          )}
          {record.status === "fechada" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onUpdateStatus(record.id, "paga")}
              className="flex-1"
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Marcar como Paga
            </Button>
          )}
          {record.status === "aberta" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDelete(record.id)}
              className="text-destructive hover:text-destructive"
            >
              <XCircle className="w-4 h-4 mr-1" />
              Excluir
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
