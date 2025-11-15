import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

interface PartnershipChartProps {
  partners: any[];
}

export function PartnershipChart({ partners }: PartnershipChartProps) {
  const data = partners.map((partner, index) => ({
    name: partner.profiles?.full_name || partner.razao_social,
    value: Number(partner.participacao_percentual),
    color: COLORS[index % COLORS.length],
  }));

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Distribuição de Participação Societária</h3>
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => `${name}: ${value.toFixed(2)}%`}
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => `${value.toFixed(2)}%`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>

      <div className="mt-6 space-y-2">
        {partners.map((partner, index) => (
          <div key={partner.id} className="flex justify-between items-center p-3 bg-muted rounded">
            <div className="flex items-center gap-3">
              <div 
                className="w-4 h-4 rounded"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="font-medium">
                {partner.profiles?.full_name || partner.razao_social}
              </span>
            </div>
            <div className="text-right">
              <p className="font-semibold">{Number(partner.participacao_percentual).toFixed(2)}%</p>
              <p className="text-sm text-muted-foreground">
                {Number(partner.valor_capital_social || 0).toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
