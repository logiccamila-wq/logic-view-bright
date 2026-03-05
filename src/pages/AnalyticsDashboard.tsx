import { PageHeader, Section } from "@/components/ui/modern-components";
import { InteractiveChart, useSampleChartData } from "@/components/charts";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/animations";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw } from "lucide-react";

/**
 * Página de Analytics com Charts Interativos
 * Demonstra o uso dos componentes de gráfico com dados de exemplo
 */
export default function AnalyticsDashboard() {
  const { revenueData, tripData, vehicleStatusData, efficiencyData } = useSampleChartData();

  return (
      <PageTransition className="space-y-8">
        <PageHeader
          title="Analytics Dashboard"
          description="Visualize métricas e KPIs com gráficos interativos"
          action={
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Atualizar
              </Button>
              <Button size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Exportar
              </Button>
            </div>
          }
        />

        <Section title="Desempenho Financeiro" description="Receitas vs Despesas (últimos 6 meses)">
          <StaggerContainer className="grid lg:grid-cols-2 gap-6">
            <StaggerItem>
              <InteractiveChart
                title="Receita e Despesas"
                description="Evolução mensal em R$"
                data={revenueData}
                type="area"
                dataKey="value"
                xAxisKey="name"
                color="#007BFF"
                secondaryDataKey="despesas"
                secondaryColor="#EF4444"
              />
            </StaggerItem>

            <StaggerItem>
              <InteractiveChart
                title="Comparativo Mensal"
                description="Receita vs Despesas por mês"
                data={revenueData}
                type="bar"
                dataKey="value"
                xAxisKey="name"
                color="#10B981"
                secondaryDataKey="despesas"
                secondaryColor="#F59E0B"
              />
            </StaggerItem>
          </StaggerContainer>
        </Section>

        <Section title="Operações" description="Métricas de viagens e frota">
          <StaggerContainer className="grid lg:grid-cols-2 gap-6">
            <StaggerItem>
              <InteractiveChart
                title="Viagens por Dia"
                description="Última semana"
                data={tripData}
                type="line"
                dataKey="value"
                xAxisKey="name"
                color="#6366F1"
              />
            </StaggerItem>

            <StaggerItem>
              <InteractiveChart
                title="Status da Frota"
                description="Distribuição atual dos veículos"
                data={vehicleStatusData}
                type="pie"
                dataKey="value"
              />
            </StaggerItem>
          </StaggerContainer>
        </Section>

        <Section title="Eficiência Operacional" description="Taxa de eficiência ao longo do tempo">
          <StaggerContainer className="grid gap-6">
            <StaggerItem>
              <InteractiveChart
                title="Eficiência da Frota (%)"
                description="Tendência de eficiência nos últimos 6 meses"
                data={efficiencyData}
                type="area"
                dataKey="value"
                xAxisKey="name"
                color="#10B981"
              />
            </StaggerItem>
          </StaggerContainer>
        </Section>
      </PageTransition>
  );
}
