import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar } from "recharts";
import { useState } from "react";
import { predictTireFailureRisk, optimizeFuelCosts } from "@/utils/mlPredictive";

type Sector = "finance" | "operations" | "fleet" | "commercial";

const ExecutiveDashboard = () => {
  const [sector, setSector] = useState<Sector>("finance");

  const indicatorsQuery = useQuery({
    queryKey: ["financial_indicators"],
    queryFn: async () => {
      const { data } = await supabase
        .from("financial_indicators")
        .select("periodo_mes,periodo_ano,receita_total,custo_total,margem_liquida,ticket_medio")
        .order("periodo_ano", { ascending: true })
        .order("periodo_mes", { ascending: true });
      return (data || []) as Tables<"financial_indicators">[];
    },
  });

  const revenueQuery = useQuery({
    queryKey: ["revenue_records_recent"],
    queryFn: async () => {
      const { data } = await supabase
        .from("revenue_records")
        .select("data_emissao,valor_frete,peso_kg,cliente_nome,destino_uf")
        .limit(100)
        .order("data_emissao", { ascending: false });
      return (data || []) as Tables<"revenue_records">[];
    },
  });

  const payrollQuery = useQuery({
    queryKey: ["payroll_records"],
    queryFn: async () => {
      const { data } = await supabase
        .from("payroll_records")
        .select("mes_referencia,salario_base,horas_extras,adicional_noturno,descontos,total_liquido,status")
        .limit(100)
        .order("mes_referencia", { ascending: false });
      return (data || []) as Tables<"payroll_records">[];
    },
  });

  const revenueSeries = indicatorsQuery.data?.map((i) => ({
    label: `${String(i.periodo_mes).padStart(2, "0")}/${i.periodo_ano}`,
    receita: i.receita_total,
    custo: i.custo_total,
    margem: i.margem_liquida,
  })) || [];

  const kpiFinance = (() => {
    const last = indicatorsQuery.data?.[indicatorsQuery.data.length - 1];
    const receita = last?.receita_total || 0;
    const custo = last?.custo_total || 0;
    const margem = last?.margem_liquida || 0;
    return { receita, custo, margem };
  })();

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Painel Executivo</h1>
          <Tabs value={sector} onValueChange={(v) => setSector(v as Sector)}>
            <TabsList>
              <TabsTrigger value="finance">Financeiro</TabsTrigger>
              <TabsTrigger value="operations">Operações</TabsTrigger>
              <TabsTrigger value="fleet">Frota</TabsTrigger>
              <TabsTrigger value="commercial">Comercial</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <Tabs value={sector}>
          <TabsContent value="finance" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card><CardContent className="p-4"><div className="text-sm text-muted-foreground">Receita</div><div className="text-3xl font-bold">R$ {kpiFinance.receita?.toLocaleString()}</div></CardContent></Card>
              <Card><CardContent className="p-4"><div className="text-sm text-muted-foreground">Custos</div><div className="text-3xl font-bold">R$ {kpiFinance.custo?.toLocaleString()}</div></CardContent></Card>
              <Card><CardContent className="p-4"><div className="text-sm text-muted-foreground">Margem Líquida</div><div className="text-3xl font-bold">{(kpiFinance.margem || 0).toFixed(2)}%</div></CardContent></Card>
            </div>

            <Card>
              <CardContent className="p-4">
                <ChartContainer config={{ receita: { label: "Receita", color: "#16a34a" }, custo: { label: "Custos", color: "#ef4444" }, margem: { label: "Margem %", color: "#3b82f6" } }}>
                  <LineChart data={revenueSeries}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="receita" stroke="var(--color-receita)" dot={false} />
                    <Line type="monotone" dataKey="custo" stroke="var(--color-custo)" dot={false} />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="operations" className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <ChartContainer config={{ fretes: { label: "Fretes", color: "#14b8a6" }, peso: { label: "Peso (kg)", color: "#f59e0b" } }}>
                  <BarChart data={(revenueQuery.data || []).slice(0, 20).map((r) => ({ label: r.data_emissao, fretes: r.valor_frete, peso: r.peso_kg }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="fretes" fill="var(--color-fretes)" />
                    <Bar dataKey="peso" fill="var(--color-peso)" />
                    <ChartLegend content={<ChartLegendContent />} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fleet" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card><CardContent className="p-4"><div className="text-sm text-muted-foreground">Risco de Pneus</div><div className="text-3xl font-bold">{tireRisk.riskScore}</div><div className="text-xs mt-2">{tireRisk.recommendations[0]}</div></CardContent></Card>
              <Card><CardContent className="p-4"><div className="text-sm text-muted-foreground">Custo Médio/km</div><div className="text-3xl font-bold">R$ {fuelInsights.avgCostPerKm?.toFixed(2)}</div><div className="text-xs mt-2">Tendência: {fuelInsights.trend}</div></CardContent></Card>
              <Card><CardContent className="p-4"><div className="text-sm text-muted-foreground">Veículos Ineficientes</div><div className="text-3xl font-bold">{fuelInsights.inefficientVehicles?.length || 0}</div></CardContent></Card>
            </div>
          </TabsContent>

          <TabsContent value="commercial" className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Top clientes e rotas disponíveis em Indicadores</div>
                <div className="text-xs">KPIs comerciais consolidados</div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default ExecutiveDashboard;
  const tpmsQuery = useQuery({
    queryKey: ["tpms_readings_recent"],
    queryFn: async () => {
      const { data } = await supabase.from("tpms_readings" as any).select("pressure_psi,temperature_celsius,tread_depth_mm,alert_level,created_at,vehicle_plate,tire_position").limit(50).order("created_at", { ascending: false });
      return (data as any) || [];
    }
  });

  const refuelQuery = useQuery({
    queryKey: ["refuelings_recent"],
    queryFn: async () => {
      const { data } = await supabase.from("refuelings" as any).select("km,liters,total_value,cost_per_km,timestamp,vehicle_plate").limit(100).order("timestamp", { ascending: false });
      return (data as any) || [];
    }
  });

  const tireRisk = tpmsQuery.data ? predictTireFailureRisk(tpmsQuery.data) : { riskScore: 0, predictedFailureDays: null, recommendations: [] };
  const fuelInsights = refuelQuery.data ? optimizeFuelCosts(refuelQuery.data) : { avgCostPerKm: 0, trend: "stable", inefficientVehicles: [], recommendations: [] } as any;
