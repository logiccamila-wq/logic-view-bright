import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  AreaChart, 
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { FadeInUp } from "@/components/animations";

interface ChartData {
  name: string;
  value: number;
  [key: string]: string | number;
}

interface InteractiveChartProps {
  title: string;
  description?: string;
  data: ChartData[];
  type: 'line' | 'bar' | 'area' | 'pie';
  dataKey: string;
  xAxisKey?: string;
  color?: string;
  secondaryDataKey?: string;
  secondaryColor?: string;
}

const COLORS = ['#007BFF', '#10B981', '#F59E0B', '#EF4444', '#6366F1', '#EC4899'];

/**
 * Componente de Chart Interativo com Recharts
 * Suporta Line, Bar, Area e Pie charts com animações
 */
export function InteractiveChart({
  title,
  description,
  data,
  type,
  dataKey,
  xAxisKey = 'name',
  color = '#007BFF',
  secondaryDataKey,
  secondaryColor = '#10B981',
}: InteractiveChartProps) {
  
  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis 
                dataKey={xAxisKey} 
                stroke="currentColor" 
                opacity={0.5}
                fontSize={12}
              />
              <YAxis 
                stroke="currentColor" 
                opacity={0.5}
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey={dataKey} 
                stroke={color} 
                strokeWidth={2}
                dot={{ fill: color, r: 4 }}
                activeDot={{ r: 6 }}
                animationDuration={1000}
              />
              {secondaryDataKey && (
                <Line 
                  type="monotone" 
                  dataKey={secondaryDataKey} 
                  stroke={secondaryColor} 
                  strokeWidth={2}
                  dot={{ fill: secondaryColor, r: 4 }}
                  activeDot={{ r: 6 }}
                  animationDuration={1000}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis 
                dataKey={xAxisKey} 
                stroke="currentColor" 
                opacity={0.5}
                fontSize={12}
              />
              <YAxis 
                stroke="currentColor" 
                opacity={0.5}
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar 
                dataKey={dataKey} 
                fill={color} 
                radius={[8, 8, 0, 0]}
                animationDuration={1000}
              />
              {secondaryDataKey && (
                <Bar 
                  dataKey={secondaryDataKey} 
                  fill={secondaryColor} 
                  radius={[8, 8, 0, 0]}
                  animationDuration={1000}
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={color} stopOpacity={0}/>
                </linearGradient>
                {secondaryDataKey && (
                  <linearGradient id="colorSecondary" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={secondaryColor} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={secondaryColor} stopOpacity={0}/>
                  </linearGradient>
                )}
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis 
                dataKey={xAxisKey} 
                stroke="currentColor" 
                opacity={0.5}
                fontSize={12}
              />
              <YAxis 
                stroke="currentColor" 
                opacity={0.5}
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey={dataKey} 
                stroke={color} 
                fillOpacity={1} 
                fill="url(#colorValue)"
                strokeWidth={2}
                animationDuration={1000}
              />
              {secondaryDataKey && (
                <Area 
                  type="monotone" 
                  dataKey={secondaryDataKey} 
                  stroke={secondaryColor} 
                  fillOpacity={1} 
                  fill="url(#colorSecondary)"
                  strokeWidth={2}
                  animationDuration={1000}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey={dataKey}
                animationDuration={1000}
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <FadeInUp>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="text-xl">{title}</CardTitle>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </CardHeader>
        <CardContent>
          {renderChart()}
        </CardContent>
      </Card>
    </FadeInUp>
  );
}

/**
 * Hook para dados de exemplo - pode ser substituído por dados reais da API
 */
export const useSampleChartData = () => {
  const revenueData = [
    { name: 'Jan', value: 850000, despesas: 620000 },
    { name: 'Fev', value: 920000, despesas: 680000 },
    { name: 'Mar', value: 1050000, despesas: 720000 },
    { name: 'Abr', value: 980000, despesas: 690000 },
    { name: 'Mai', value: 1120000, despesas: 750000 },
    { name: 'Jun', value: 1200000, despesas: 780000 },
  ];

  const tripData = [
    { name: 'Seg', value: 45 },
    { name: 'Ter', value: 52 },
    { name: 'Qua', value: 48 },
    { name: 'Qui', value: 61 },
    { name: 'Sex', value: 55 },
    { name: 'Sáb', value: 38 },
    { name: 'Dom', value: 24 },
  ];

  const vehicleStatusData = [
    { name: 'Em Operação', value: 45 },
    { name: 'Manutenção', value: 8 },
    { name: 'Disponíveis', value: 12 },
    { name: 'Parados', value: 3 },
  ];

  const efficiencyData = [
    { name: 'Jan', value: 85 },
    { name: 'Fev', value: 88 },
    { name: 'Mar', value: 92 },
    { name: 'Abr', value: 89 },
    { name: 'Mai', value: 94 },
    { name: 'Jun', value: 96 },
  ];

  return {
    revenueData,
    tripData,
    vehicleStatusData,
    efficiencyData,
  };
};
