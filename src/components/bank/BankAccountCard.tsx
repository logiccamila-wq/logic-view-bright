import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Edit, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface BankAccountCardProps {
  account: any;
  onSelect: () => void;
  onUpdate: () => void;
}

export function BankAccountCard({ account, onSelect, onUpdate }: BankAccountCardProps) {
  return (
    <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={onSelect}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">{account.nome_conta}</h3>
            <p className="text-sm text-muted-foreground">{account.banco_nome}</p>
          </div>
        </div>
        <Badge variant={account.status === 'ativa' ? 'default' : 'secondary'}>
          {account.status}
        </Badge>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Agência</span>
          <span className="font-medium">{account.agencia}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Conta</span>
          <span className="font-medium">{account.conta}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Tipo</span>
          <span className="font-medium capitalize">{account.tipo_conta}</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t">
        <p className="text-sm text-muted-foreground mb-1">Saldo Atual</p>
        <p className="text-2xl font-bold">
          {Number(account.saldo_atual).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
        </p>
      </div>

      <div className="mt-4 flex gap-2">
        <Button size="sm" variant="outline" className="flex-1" onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}>
          <Eye className="mr-2 h-4 w-4" />
          Ver Extrato
        </Button>
        <Button size="sm" variant="outline" onClick={(e) => {
          e.stopPropagation();
        }}>
          <Edit className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
