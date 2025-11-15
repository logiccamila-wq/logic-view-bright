import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth, subMonths } from "date-fns";

export const useFinancialData = () => {
  return useQuery({
    queryKey: ['financial-data'],
    queryFn: async () => {
      const now = new Date();
      const currentMonthStart = startOfMonth(now);
      const currentMonthEnd = endOfMonth(now);
      const lastMonthStart = startOfMonth(subMonths(now, 1));
      const lastMonthEnd = endOfMonth(subMonths(now, 1));

      // Buscar CTEs autorizados do mês atual
      const { data: ctesCurrent, error: cteError } = await supabase
        .from('cte')
        .select('valor_total, data_emissao')
        .eq('status', 'autorizado')
        .gte('data_emissao', currentMonthStart.toISOString())
        .lte('data_emissao', currentMonthEnd.toISOString());

      if (cteError) throw cteError;

      // Buscar CTEs do mês anterior para comparação
      const { data: ctesLast, error: cteLastError } = await supabase
        .from('cte')
        .select('valor_total')
        .eq('status', 'autorizado')
        .gte('data_emissao', lastMonthStart.toISOString())
        .lte('data_emissao', lastMonthEnd.toISOString());

      if (cteLastError) throw cteLastError;

      // Buscar contas a receber
      const { data: contasReceber, error: crError } = await supabase
        .from('contas_receber')
        .select('valor, status, data_vencimento, cliente, descricao, created_at')
        .order('created_at', { ascending: false });

      if (crError) throw crError;

      // Buscar contas a pagar
      const { data: contasPagar, error: cpError } = await supabase
        .from('contas_pagar')
        .select('valor, status, data_vencimento, fornecedor, descricao, created_at, categoria')
        .order('created_at', { ascending: false });

      if (cpError) throw cpError;

      // Calcular receita total do mês atual
      const receitaMesAtual = ctesCurrent?.reduce((sum, cte) => sum + Number(cte.valor_total), 0) || 0;
      const receitaMesAnterior = ctesLast?.reduce((sum, cte) => sum + Number(cte.valor_total), 0) || 0;
      
      // Calcular variação percentual
      const variacaoReceita = receitaMesAnterior > 0 
        ? ((receitaMesAtual - receitaMesAnterior) / receitaMesAnterior) * 100 
        : 0;

      // Calcular despesas do mês (contas a pagar pagas)
      const despesasMes = contasPagar
        ?.filter(cp => {
          const dataPagamento = new Date(cp.created_at);
          return dataPagamento >= currentMonthStart && dataPagamento <= currentMonthEnd;
        })
        .reduce((sum, cp) => sum + Number(cp.valor), 0) || 0;

      // Calcular margem líquida
      const lucroLiquido = receitaMesAtual - despesasMes;
      const margemLiquida = receitaMesAtual > 0 ? (lucroLiquido / receitaMesAtual) * 100 : 0;

      // Calcular contas a receber pendentes
      const receitaPendente = contasReceber
        ?.filter(cr => cr.status === 'pendente')
        .reduce((sum, cr) => sum + Number(cr.valor), 0) || 0;

      // Preparar lançamentos recentes (combinar receitas e despesas)
      const lancamentosReceitas = contasReceber?.slice(0, 10).map(cr => ({
        id: cr.created_at,
        data: new Date(cr.created_at).toISOString().split('T')[0],
        descricao: cr.descricao,
        tipo: 'receita' as const,
        valor: Number(cr.valor),
        categoria: 'Receita Operacional',
        status: cr.status
      })) || [];

      const lancamentosDespesas = contasPagar?.slice(0, 10).map(cp => ({
        id: cp.created_at,
        data: new Date(cp.created_at).toISOString().split('T')[0],
        descricao: cp.descricao,
        tipo: 'despesa' as const,
        valor: Number(cp.valor),
        categoria: cp.categoria || 'Despesa Operacional',
        status: cp.status
      })) || [];

      const lancamentos = [...lancamentosReceitas, ...lancamentosDespesas]
        .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
        .slice(0, 20);

      return {
        receitaMesAtual,
        variacaoReceita,
        despesasMes,
        lucroLiquido,
        margemLiquida,
        receitaPendente,
        totalCtes: ctesCurrent?.length || 0,
        lancamentos,
        contasReceber: contasReceber || [],
        contasPagar: contasPagar || []
      };
    },
    refetchInterval: 30000, // Atualiza a cada 30 segundos
  });
};
