import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface PayrollRecord {
  id: string;
  employee_id: string;
  mes_referencia: string;
  salario_base: number;
  horas_extras: number;
  adicional_noturno: number;
  adicional_periculosidade: number;
  adicional_insalubridade: number;
  outros_adicionais: number;
  descontos: number;
  fgts: number;
  inss: number;
  irrf: number;
  total_bruto: number;
  total_liquido: number;
  status: "aberta" | "fechada" | "paga";
  observacoes?: string;
  created_at?: string;
  updated_at?: string;
  employee?: {
    nome: string;
    cpf: string;
    cargo: string;
  };
}

export function usePayroll(mesReferencia?: string, page = 1, pageSize = 10) {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["payroll", mesReferencia, page, pageSize],
    queryFn: async () => {
      let query = supabase
        .from("payroll_records")
        .select(
          `
          *,
          employee:employees(nome, cpf, cargo)
        `,
          { count: "exact" }
        )
        .order("mes_referencia", { ascending: false });

      if (mesReferencia) {
        query = query.eq("mes_referencia", mesReferencia);
      }

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        records: data || [],
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize),
      };
    },
  });

  const calculatePayroll = (employee: any): Omit<PayrollRecord, "id" | "created_at" | "updated_at"> => {
    const salarioBase = employee.salario || 0;
    const horasExtras = 0; // Pode ser calculado de driver_work_sessions
    const adicionalNoturno = 0;
    const adicionalPericulosidade = 0;
    const adicionalInsalubridade = 0;
    const outrosAdicionais = 0;

    const totalBruto = 
      salarioBase + 
      horasExtras + 
      adicionalNoturno + 
      adicionalPericulosidade + 
      adicionalInsalubridade + 
      outrosAdicionais;

    const inss = totalBruto * 0.11; // 11% simplificado
    const irrf = totalBruto > 2500 ? (totalBruto - 2500) * 0.15 : 0; // Simplificado
    const fgts = totalBruto * 0.08; // 8%
    const descontos = inss + irrf;

    const totalLiquido = totalBruto - descontos;

    return {
      employee_id: employee.id,
      mes_referencia: new Date().toISOString().slice(0, 7) + "-01",
      salario_base: salarioBase,
      horas_extras: horasExtras,
      adicional_noturno: adicionalNoturno,
      adicional_periculosidade: adicionalPericulosidade,
      adicional_insalubridade: adicionalInsalubridade,
      outros_adicionais: outrosAdicionais,
      descontos,
      fgts,
      inss,
      irrf,
      total_bruto: totalBruto,
      total_liquido: totalLiquido,
      status: "aberta",
    };
  };

  const generateMonthlyPayroll = useMutation({
    mutationFn: async (mesReferencia: string) => {
      // Buscar todos os funcionários ativos
      const { data: employees, error: empError } = await supabase
        .from("employees")
        .select("*")
        .is("data_demissao", null);

      if (empError) throw empError;

      const payrollRecords = employees.map((emp) => calculatePayroll(emp));

      // Inserir todas as folhas
      const { error: insertError } = await supabase
        .from("payroll_records")
        .upsert(
          payrollRecords.map((p) => ({ ...p, mes_referencia: mesReferencia })),
          { onConflict: "employee_id,mes_referencia" }
        );

      if (insertError) throw insertError;

      return payrollRecords.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ["payroll"] });
      toast.success(`${count} folhas de pagamento geradas com sucesso!`);
    },
    onError: (error: any) => {
      toast.error(`Erro ao gerar folhas: ${error.message}`);
    },
  });

  const updatePayrollStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: PayrollRecord["status"] }) => {
      const { data, error } = await supabase
        .from("payroll_records")
        .update({ status })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll"] });
      toast.success("Status atualizado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao atualizar status: ${error.message}`);
    },
  });

  const deletePayroll = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("payroll_records").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll"] });
      toast.success("Folha excluída com sucesso!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao excluir folha: ${error.message}`);
    },
  });

  return {
    records: data?.records || [],
    totalCount: data?.totalCount || 0,
    totalPages: data?.totalPages || 0,
    isLoading,
    error,
    generateMonthlyPayroll,
    updatePayrollStatus,
    deletePayroll,
  };
}
