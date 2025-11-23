import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, TrendingDown, DollarSign, Filter } from "lucide-react";
import { DREGraph } from "@/components/dre/DREGraph";
import { DRETable } from "@/components/dre/DRETable";
import { toast } from "sonner";

const DRE = () => {
  const [entries, setEntries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedPeriod, setSelectedPeriod] = useState("ano");

  useEffect(() => {
    loadEntries();
  }, [selectedYear, selectedPeriod]);

  const loadEntries = async () => {
    setIsLoading(true);
    try {
      const startDate = `${selectedYear}-01-01`;
      const endDate = `${selectedYear}-12-31`;

      const { data, error } = await supabase
        .from("dre_entries")
        .select("*")
        .gte("data", startDate)
        .lte("data", endDate)
        .order("data", { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (error: any) {
      toast.error(`Erro ao carregar DRE: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const totalReceitas = entries
    .filter((e) => e.tipo === "RECEITA")
    .reduce((sum, e) => sum + e.valor, 0);

  const totalDespesas = entries
    .filter((e) => e.tipo === "DESPESA")
    .reduce((sum, e) => sum + e.valor, 0);

  const lucroLiquido = totalReceitas - totalDespesas;
  const margemLucro = totalReceitas > 0 ? (lucroLiquido / totalReceitas) * 100 : 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getGraphData = () => {
    const monthlyData: Record<string, { receitas: number; despesas: number }> = {};

    entries.forEach((entry) => {
      const month = new Date(entry.data).toLocaleDateString("pt-BR", {
        month: "short",
        year: "2-digit",
      });

      if (!monthlyData[month]) {
        monthlyData[month] = { receitas: 0, despesas: 0 };
      }

      if (entry.tipo === "RECEITA") {
        monthlyData[month].receitas += entry.valor;
      } else {
        monthlyData[month].despesas += entry.valor;
      }
    });

    return Object.entries(monthlyData)
      .map(([mes, valores]) => ({
        mes,
        receitas: valores.receitas,
        despesas: valores.despesas,
        lucro: valores.receitas - valores.despesas,
      }))
      .sort((a, b) => {
        const [monthA, yearA] = a.mes.split(" ");
        const [monthB, yearB] = b.mes.split(" ");
        return yearA === yearB
          ? new Date(`${monthA} 1`).getTime() - new Date(`${monthB} 1`).getTime()
          : Number(yearA) - Number(yearB);
      });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">DRE - Demonstrativo de Resultados</h1>
        </div>

        {/* Filtros */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Filter className="w-5 h-5 text-muted-foreground" />
              <div className="flex-1 grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="year">Ano</Label>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[2023, 2024, 2025].map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="period">Período</Label>
                  <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mes">Mensal</SelectItem>
                      <SelectItem value="trimestre">Trimestral</SelectItem>
                      <SelectItem value="ano">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receitas</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                {formatCurrency(totalReceitas)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Despesas</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">
                {formatCurrency(totalDespesas)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
              <DollarSign className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${
                  lucroLiquido >= 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                {formatCurrency(lucroLiquido)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Margem de Lucro</CardTitle>
              <TrendingUp className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {margemLucro.toFixed(1)}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico */}
        {!isLoading && <DREGraph data={getGraphData()} />}

        {/* Tabela Detalhada */}
        {!isLoading && <DRETable entries={entries} />}
      </div>
    </Layout>
  );
};

export default DRE;
