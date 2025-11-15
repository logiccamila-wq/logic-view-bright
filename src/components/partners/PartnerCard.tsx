import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, User } from "lucide-react";

interface PartnerCardProps {
  partner: any;
  onUpdate: () => void;
}

export function PartnerCard({ partner, onUpdate }: PartnerCardProps) {
  const profileName = partner.profiles?.full_name || "Sem nome";
  
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{profileName}</h3>
            <p className="text-sm text-muted-foreground">{partner.razao_social}</p>
            <p className="text-xs text-muted-foreground mt-1">{partner.cnpj_cpf}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm">
          <Edit className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <div>
          <p className="text-sm text-muted-foreground">Participação</p>
          <p className="text-2xl font-bold">{Number(partner.participacao_percentual).toFixed(2)}%</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Capital Social</p>
          <p className="text-lg font-semibold">
            {Number(partner.valor_capital_social || 0).toLocaleString("pt-BR", { 
              style: "currency", 
              currency: "BRL" 
            })}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Pro-labore Mensal</p>
          <p className="text-lg font-semibold">
            {Number(partner.prolabore_mensal || 0).toLocaleString("pt-BR", { 
              style: "currency", 
              currency: "BRL" 
            })}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Status</p>
          <Badge variant={partner.status === 'ativo' ? 'default' : 'secondary'}>
            {partner.status}
          </Badge>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t">
        <p className="text-xs text-muted-foreground">
          Entrada: {new Date(partner.data_entrada).toLocaleDateString("pt-BR")}
        </p>
        {partner.observacoes && (
          <p className="text-sm mt-2">{partner.observacoes}</p>
        )}
      </div>
    </Card>
  );
}
