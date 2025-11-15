import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Building2, Upload, CheckCircle2, AlertCircle, TrendingUp } from "lucide-react";
import { BankAccountCard } from "@/components/bank/BankAccountCard";
import { TransactionList } from "@/components/bank/TransactionList";
import { ImportDialog } from "@/components/bank/ImportDialog";
import { BankAccountDialog } from "@/components/bank/BankAccountDialog";
import { ReconciliationPanel } from "@/components/bank/ReconciliationPanel";

export default function BankReconciliation() {
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showAccountDialog, setShowAccountDialog] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);

  const { data: accounts, refetch: refetchAccounts } = useQuery({
    queryKey: ["bank_accounts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bank_accounts")
        .select("*")
        .eq("status", "ativa")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const { data: transactions } = useQuery({
    queryKey: ["bank_transactions", selectedAccount],
    queryFn: async () => {
      let query = supabase
        .from("bank_transactions")
        .select(`
          *,
          bank_account:bank_accounts(nome_conta, banco_nome)
        `)
        .order("data_transacao", { ascending: false });

      if (selectedAccount) {
        query = query.eq("bank_account_id", selectedAccount);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const { data: imports } = useQuery({
    queryKey: ["bank_imports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bank_imports")
        .select(`
          *,
          bank_account:bank_accounts(nome_conta)
        `)
        .order("created_at", { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    },
  });

  const saldoTotal = accounts?.reduce((sum, acc) => sum + Number(acc.saldo_atual), 0) || 0;
  const naoConciliadas = transactions?.filter(t => !t.conciliado).length || 0;
  const taxaConciliacao = transactions?.length 
    ? ((transactions.filter(t => t.conciliado).length / transactions.length) * 100).toFixed(1)
    : "0";

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Conciliação Bancária</h1>
            <p className="text-muted-foreground">Gestão de contas e transações bancárias</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowAccountDialog(true)}>
              <Building2 className="mr-2 h-4 w-4" />
              Nova Conta
            </Button>
            <Button onClick={() => setShowImportDialog(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Importar Extrato
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card className="p-6">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm text-muted-foreground">Saldo Total</div>
            </div>
            <div className="text-2xl font-bold mt-2">
              {saldoTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm text-muted-foreground">Não Conciliadas</div>
            </div>
            <div className="text-2xl font-bold mt-2">{naoConciliadas}</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm text-muted-foreground">Taxa de Conciliação</div>
            </div>
            <div className="text-2xl font-bold mt-2">{taxaConciliacao}%</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm text-muted-foreground">Contas Ativas</div>
            </div>
            <div className="text-2xl font-bold mt-2">{accounts?.length || 0}</div>
          </Card>
        </div>

        <Tabs defaultValue="contas" className="w-full">
          <TabsList>
            <TabsTrigger value="contas">Contas Bancárias</TabsTrigger>
            <TabsTrigger value="transacoes">Transações</TabsTrigger>
            <TabsTrigger value="conciliacao">Conciliação</TabsTrigger>
            <TabsTrigger value="importacoes">Importações</TabsTrigger>
          </TabsList>

          <TabsContent value="contas" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {accounts?.map((account) => (
                <BankAccountCard 
                  key={account.id} 
                  account={account}
                  onSelect={() => setSelectedAccount(account.id)}
                  onUpdate={refetchAccounts}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="transacoes">
            <TransactionList 
              transactions={transactions || []}
              onAccountFilter={setSelectedAccount}
            />
          </TabsContent>

          <TabsContent value="conciliacao">
            <ReconciliationPanel
              transactions={transactions?.filter(t => !t.conciliado) || []}
            />
          </TabsContent>

          <TabsContent value="importacoes" className="space-y-4">
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4">Data</th>
                      <th className="text-left p-4">Conta</th>
                      <th className="text-left p-4">Arquivo</th>
                      <th className="text-left p-4">Formato</th>
                      <th className="text-right p-4">Transações</th>
                      <th className="text-left p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {imports?.map((imp) => (
                      <tr key={imp.id} className="border-b">
                        <td className="p-4">
                          {new Date(imp.created_at).toLocaleDateString("pt-BR")}
                        </td>
                        <td className="p-4">{imp.bank_account?.nome_conta}</td>
                        <td className="p-4">{imp.arquivo_nome}</td>
                        <td className="p-4">{imp.formato}</td>
                        <td className="p-4 text-right">
                          {imp.total_conciliadas}/{imp.total_transacoes}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-xs ${
                            imp.status === 'concluido' ? 'bg-green-100 text-green-800' :
                            imp.status === 'erro' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {imp.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <BankAccountDialog
        open={showAccountDialog}
        onOpenChange={setShowAccountDialog}
        onSuccess={refetchAccounts}
      />

      <ImportDialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
        accounts={accounts || []}
        onSuccess={() => window.location.reload()}
      />
    </Layout>
  );
}
