import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calculator, DollarSign, Eye, CheckCircle, FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PayrollRecord {
  id: string;
  driver_id: string;
  mes: number;
  ano: number;
  horas_normais: number;
  horas_extras: number;
  horas_espera: number;
  valor_horas_normais: number;
  valor_horas_extras: number;
  valor_horas_espera: number;
  salario_base: number;
  total_valor_ctes: number;
  total_combustivel: number;
  base_calculo_gratificacao: number;
  valor_gratificacao: number;
  total_bruto: number;
  total_liquido: number;
  status: string;
  data_pagamento: string | null;
  profiles?: { full_name: string };
}

export default function PayrollManagement() {
  const { user } = useAuth();
  const [payrolls, setPayrolls] = useState<PayrollRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    loadPayrolls();
  }, []);

  const loadPayrolls = async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("driver_payroll")
        .select(`
          *,
          profiles!driver_payroll_driver_id_fkey(full_name)
        `)
        .order("ano", { ascending: false })
        .order("mes", { ascending: false });

      if (error) throw error;
      setPayrolls(data as any);
    } catch (error) {
      console.error("Erro ao carregar folhas:", error);
      toast.error("Erro ao carregar folhas de pagamento");
    } finally {
      setLoading(false);
    }
  };

  const calculatePayroll = async () => {
    setCalculating(true);
    try {
      const { error } = await supabase.functions.invoke("calculate-driver-payroll", {
        body: {
          mes: selectedMonth,
          ano: selectedYear,
        },
      });

      if (error) throw error;

      toast.success("Folha de pagamento calculada com sucesso!");
      loadPayrolls();
    } catch (error) {
      console.error("Erro ao calcular folha:", error);
      toast.error("Erro ao calcular folha de pagamento");
    } finally {
      setCalculating(false);
    }
  };

  const approvePayroll = async (payrollId: string) => {
    try {
      const { error } = await (supabase as any)
        .from("driver_payroll")
        .update({
          status: "aprovado",
          aprovado_por: user?.id,
          data_aprovacao: new Date().toISOString(),
        })
        .eq("id", payrollId);

      if (error) throw error;

      toast.success("Folha aprovada!");
      loadPayrolls();
    } catch (error) {
      console.error("Erro ao aprovar folha:", error);
      toast.error("Erro ao aprovar folha");
    }
  };

  const markAsPaid = async (payrollId: string) => {
    try {
      const { error } = await (supabase as any)
        .from("driver_payroll")
        .update({
          status: "pago",
          data_pagamento: new Date().toISOString(),
        })
        .eq("id", payrollId);

      if (error) throw error;

      toast.success("Pagamento registrado!");
      loadPayrolls();
    } catch (error) {
      console.error("Erro ao registrar pagamento:", error);
      toast.error("Erro ao registrar pagamento");
    }
  };

  const formatMoney = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "outline"; label: string }> = {
      calculado: { variant: "secondary", label: "Calculado" },
      aprovado: { variant: "default", label: "Aprovado" },
      pago: { variant: "outline", label: "Pago" },
    };

    const config = variants[status] || variants.calculado;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestão de Folha de Pagamento</h1>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button size="lg">
              <Calculator className="mr-2 h-5 w-5" />
              Calcular Folha
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Calcular Folha de Pagamento</DialogTitle>
              <DialogDescription>
                Selecione o período para calcular a folha de todos os motoristas
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label>Mês</Label>
                <Input
                  type="number"
                  min="1"
                  max="12"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                />
              </div>

              <div>
                <Label>Ano</Label>
                <Input
                  type="number"
                  min="2020"
                  max="2030"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                />
              </div>

              <Button
                onClick={calculatePayroll}
                disabled={calculating}
                className="w-full"
              >
                {calculating ? "Calculando..." : "Calcular Folha"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <DollarSign className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">Total a Pagar</p>
              <p className="text-2xl font-bold">
                {formatMoney(
                  payrolls
                    .filter((p) => p.status !== "pago")
                    .reduce((sum, p) => sum + Number(p.total_liquido), 0)
                )}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <FileText className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Folhas Pendentes</p>
              <p className="text-2xl font-bold">
                {payrolls.filter((p) => p.status === "calculado").length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <CheckCircle className="h-8 w-8 text-orange-500" />
            <div>
              <p className="text-sm text-muted-foreground">Aprovadas</p>
              <p className="text-2xl font-bold">
                {payrolls.filter((p) => p.status === "aprovado").length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">Pagas</p>
              <p className="text-2xl font-bold">
                {payrolls.filter((p) => p.status === "pago").length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabela de Folhas */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Folhas de Pagamento</h2>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Motorista</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Salário Base</TableHead>
                  <TableHead>Horas</TableHead>
                  <TableHead>Gratificação</TableHead>
                  <TableHead>Total Líquido</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payrolls.map((payroll) => (
                  <TableRow key={payroll.id}>
                    <TableCell className="font-medium">
                      {payroll.profiles?.full_name || "N/A"}
                    </TableCell>
                    <TableCell>
                      {String(payroll.mes).padStart(2, "0")}/{payroll.ano}
                    </TableCell>
                    <TableCell>{formatMoney(payroll.salario_base)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>Normal: {payroll.horas_normais.toFixed(1)}h</div>
                        <div>Extra: {payroll.horas_extras.toFixed(1)}h</div>
                        <div>Espera: {payroll.horas_espera.toFixed(1)}h</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-green-600 font-semibold">
                      {formatMoney(payroll.valor_gratificacao)}
                    </TableCell>
                    <TableCell className="font-bold">
                      {formatMoney(payroll.total_liquido)}
                    </TableCell>
                    <TableCell>{getStatusBadge(payroll.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Detalhes da Folha</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm text-muted-foreground">Motorista</p>
                                  <p className="font-semibold">{payroll.profiles?.full_name}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Período</p>
                                  <p className="font-semibold">
                                    {String(payroll.mes).padStart(2, "0")}/{payroll.ano}
                                  </p>
                                </div>
                              </div>

                              <div className="border-t pt-4">
                                <h4 className="font-semibold mb-2">Horas Trabalhadas</h4>
                                <div className="grid grid-cols-3 gap-4 text-sm">
                                  <div>
                                    <p className="text-muted-foreground">Horas Normais</p>
                                    <p>{payroll.horas_normais.toFixed(2)}h</p>
                                    <p className="text-green-600">{formatMoney(payroll.valor_horas_normais)}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Horas Extras</p>
                                    <p>{payroll.horas_extras.toFixed(2)}h</p>
                                    <p className="text-green-600">{formatMoney(payroll.valor_horas_extras)}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Horas Espera</p>
                                    <p>{payroll.horas_espera.toFixed(2)}h</p>
                                    <p className="text-green-600">{formatMoney(payroll.valor_horas_espera)}</p>
                                  </div>
                                </div>
                              </div>

                              <div className="border-t pt-4">
                                <h4 className="font-semibold mb-2">Gratificação</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <p className="text-muted-foreground">Valor CTe's</p>
                                    <p>{formatMoney(payroll.total_valor_ctes)}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Combustível</p>
                                    <p className="text-red-600">-{formatMoney(payroll.total_combustivel)}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Base Cálculo</p>
                                    <p>{formatMoney(payroll.base_calculo_gratificacao)}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Gratificação (3%)</p>
                                    <p className="text-green-600 font-semibold">
                                      {formatMoney(payroll.valor_gratificacao)}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <div className="border-t pt-4 bg-primary/5 p-4 rounded">
                                <div className="flex justify-between items-center">
                                  <span className="font-semibold">Total Líquido</span>
                                  <span className="text-2xl font-bold text-green-600">
                                    {formatMoney(payroll.total_liquido)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        {payroll.status === "calculado" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => approvePayroll(payroll.id)}
                          >
                            Aprovar
                          </Button>
                        )}

                        {payroll.status === "aprovado" && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => markAsPaid(payroll.id)}
                          >
                            Marcar Pago
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}