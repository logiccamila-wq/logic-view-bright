import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";

const DRE = () => {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const { data: dreData, isLoading } = useQuery({
    queryKey: ["dre", month, year],
    queryFn: async () => {
      const startDate = new Date(year, month - 1, 1).toISOString().split("T")[0];
      const endDate = new Date(year, month, 0).toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("dre_entries")
        .select("*")
        .gte("data", startDate)
        .lte("data", endDate)
        .order("data", { ascending: false });

      if (error) throw error;

      const receitas = data?.filter((e) => e.tipo === "RECEITA") || [];
      const despesas = data?.filter((e) => e.tipo === "DESPESA") || [];

      const totalReceitas = receitas.reduce((sum, e) => sum + Number(e.valor), 0);
      const totalDespesas = despesas.reduce((sum, e) => sum + Number(e.valor), 0);
      const lucroLiquido = totalReceitas - totalDespesas;

      // Agrupar por categoria
      const receitasPorCategoria = receitas.reduce((acc, e) => {
        if (!acc[e.categoria]) acc[e.categoria] = 0;
        acc[e.categoria] += Number(e.valor);
        return acc;
      }, {} as Record<string, number>);

      const despesasPorCategoria = despesas.reduce((acc, e) => {
        if (!acc[e.categoria]) acc[e.categoria] = 0;
        acc[e.categoria] += Number(e.valor);
        return acc;
      }, {} as Record<string, number>);

      return {
        totalReceitas,
        totalDespesas,
        lucroLiquido,
        margemLiquida: totalReceitas > 0 ? (lucroLiquido / totalReceitas) * 100 : 0,
        receitasPorCategoria,
        despesasPorCategoria,
        entries: data || [],
      };
    },
  });

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">DRE - Demonstrativo de Resultados</h1>
        </div>

        {/* Filtros */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Mês</Label>
                <Select
                  value={month.toString()}
                  onValueChange={(value) => setMonth(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        {new Date(2000, i, 1).toLocaleDateString("pt-BR", { month: "long" })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Ano</Label>
                <Input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value))}
                />
              </div>

              <div className="flex items-end">
                <Button className="w-full">Atualizar</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground">Carregando...</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Receitas</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-500">
                    R$ {dreData?.totalReceitas.toFixed(2)}
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
                    R$ {dreData?.totalDespesas.toFixed(2)}
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
                      (dreData?.lucroLiquido || 0) >= 0 ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    R$ {dreData?.lucroLiquido.toFixed(2)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Margem Líquida</CardTitle>
                  <TrendingUp className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dreData?.margemLiquida.toFixed(1)}%
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detalhamento */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Receitas por Categoria</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(dreData?.receitasPorCategoria || {}).map(
                      ([categoria, valor]) => (
                        <div key={categoria} className="flex justify-between items-center">
                          <span className="text-sm font-medium">{categoria}</span>
                          <span className="text-sm text-green-500 font-bold">
                            R$ {(valor as number).toFixed(2)}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Despesas por Categoria</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(dreData?.despesasPorCategoria || {}).map(
                      ([categoria, valor]) => (
                        <div key={categoria} className="flex justify-between items-center">
                          <span className="text-sm font-medium">{categoria}</span>
                          <span className="text-sm text-red-500 font-bold">
                            R$ {(valor as number).toFixed(2)}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default DRE;
