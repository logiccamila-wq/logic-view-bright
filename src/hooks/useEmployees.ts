import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Employee {
  id: string;
  user_id?: string;
  nome: string;
  cpf: string;
  rg?: string;
  cargo: string;
  tipo_vinculo: "CLT" | "SOCIO" | "CONSULTOR" | "PRESTADOR";
  data_admissao: string;
  data_demissao?: string;
  salario?: number;
  telefone?: string;
  email?: string;
  cidade?: string;
  endereco?: string;
  documentos?: any[];
  created_at?: string;
  updated_at?: string;
}

export function useEmployees(searchTerm = "", page = 1, pageSize = 10) {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["employees", searchTerm, page, pageSize],
    queryFn: async () => {
      let query = supabase
        .from("employees")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false });

      if (searchTerm) {
        query = query.or(
          `nome.ilike.%${searchTerm}%,cpf.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`
        );
      }

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        employees: data || [],
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize),
      };
    },
  });

  const createEmployee = useMutation({
    mutationFn: async (employee: Omit<Employee, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("employees")
        .insert([employee])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Funcionário cadastrado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao cadastrar funcionário: ${error.message}`);
    },
  });

  const updateEmployee = useMutation({
    mutationFn: async ({ id, ...employee }: Partial<Employee> & { id: string }) => {
      const { data, error } = await supabase
        .from("employees")
        .update(employee)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Funcionário atualizado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao atualizar funcionário: ${error.message}`);
    },
  });

  const deleteEmployee = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("employees").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Funcionário excluído com sucesso!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao excluir funcionário: ${error.message}`);
    },
  });

  return {
    employees: data?.employees || [],
    totalCount: data?.totalCount || 0,
    totalPages: data?.totalPages || 0,
    isLoading,
    error,
    createEmployee,
    updateEmployee,
    deleteEmployee,
  };
}
