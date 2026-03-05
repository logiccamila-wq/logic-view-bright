import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend, CartesianGrid } from "recharts";

interface DREGraphProps {
  data: Array<{
    mes: string;
    receitas: number;
    despesas: number;
    lucro: number;
  }>;
}

export function DREGraph({ data }: DREGraphProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolução Financeira</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="mes" 
              className="text-sm"
              tick={{ fill: "hsl(var(--foreground))" }}
            />
            <YAxis 
              tickFormatter={formatCurrency}
              className="text-sm"
              tick={{ fill: "hsl(var(--foreground))" }}
            />
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="receitas"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              name="Receitas"
              dot={{ fill: "hsl(var(--primary))" }}
            />
            <Line
              type="monotone"
              dataKey="despesas"
              stroke="hsl(142, 76%, 36%)"
              strokeWidth={2}
              name="Despesas"
              dot={{ fill: "hsl(142, 76%, 36%)" }}
            />
            <Line
              type="monotone"
              dataKey="lucro"
              stroke="hsl(221, 83%, 53%)"
              strokeWidth={2}
              name="Lucro"
              dot={{ fill: "hsl(221, 83%, 53%)" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
