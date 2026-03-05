import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PayrollDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payroll: any;
}

const formatMoney = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0);
};

export const PayrollDetailDialog = ({ open, onOpenChange, payroll }: PayrollDetailDialogProps) => {
  if (!payroll) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Detalhes da Folha - {payroll.profiles?.full_name}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
          {/* Coluna 1: Resumo */}
          <div className="col-span-1 space-y-4 p-4 bg-muted/40 rounded-lg">
            <h3 className="font-semibold text-lg">Resumo</h3>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Salário Base</span>
              <span className="font-medium">{formatMoney(payroll.salario_base)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Bruto</span>
              <span className="font-bold text-xl">{formatMoney(payroll.total_bruto)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Descontos</span>
              <span className="font-medium text-red-500">{formatMoney(payroll.total_descontos)}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-muted-foreground">Total Líquido</span>
              <span className="font-bold text-xl text-green-600">{formatMoney(payroll.total_liquido)}</span>
            </div>
          </div>

          {/* Coluna 2 e 3: Detalhes */}
          <div className="col-span-2 space-y-4">
            <h3 className="font-semibold text-lg">Composição do Salário</h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2">
              <div className="text-muted-foreground">Horas Normais</div>
              <div>{payroll.horas_normais.toFixed(2)}h - {formatMoney(payroll.valor_horas_normais)}</div>
              
              <div className="text-muted-foreground">Horas Extras</div>
              <div>{payroll.horas_extras.toFixed(2)}h - {formatMoney(payroll.valor_horas_extras)}</div>

              <div className="text-muted-foreground">Horas em Espera</div>
              <div>{payroll.horas_espera.toFixed(2)}h - {formatMoney(payroll.valor_horas_espera)}</div>
            </div>

            <h3 className="font-semibold text-lg pt-4">Gratificação e Bônus</h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2">
              <div className="text-muted-foreground">Total em Fretes (CT-es)</div>
              <div>{formatMoney(payroll.total_valor_ctes)}</div>

              <div className="text-muted-foreground">Base de Cálculo da Gratificação</div>
              <div>{formatMoney(payroll.base_calculo_gratificacao)}</div>

              <div className="text-muted-foreground">Valor da Gratificação</div>
              <div className="font-semibold">{formatMoney(payroll.valor_gratificacao)}</div>
            </div>

            <h3 className="font-semibold text-lg pt-4">Outros</h3>
             <div className="grid grid-cols-2 gap-x-8 gap-y-2">
              <div className="text-muted-foreground">Combustível</div>
              <div className="text-red-500">{formatMoney(payroll.total_combustivel)}</div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};