import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Plus, Search, TrendingUp, FileText, AlertCircle } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ClientDialog } from "@/components/crm/ClientDialog";
import { ClientAnalysis } from "@/components/crm/ClientAnalysis";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const CRM = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [analysisClient, setAnalysisClient] = useState<any>(null);

  const { data: clients, isLoading, refetch } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const { data: stats } = useQuery({
    queryKey: ['client-stats'],
    queryFn: async () => {
      const { data: clientsData } = await supabase
        .from('clients')
        .select('status, limite_credito');

      const { data: analysisData } = await supabase
        .from('client_financial_analysis')
        .select('inadimplente, score_cliente');

      const totalClients = clientsData?.length || 0;
      const activeClients = clientsData?.filter(c => c.status === 'ativo').length || 0;
      const totalCredit = clientsData?.reduce((sum, c) => sum + Number(c.limite_credito || 0), 0) || 0;
      const inadimplentes = analysisData?.filter(a => a.inadimplente).length || 0;

      return { totalClients, activeClients, totalCredit, inadimplentes };
    }
  });

  const filteredClients = clients?.filter(client =>
    client.razao_social.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.cnpj.includes(searchTerm) ||
    client.nome_fantasia?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (client: any) => {
    setSelectedClient(client);
    setDialogOpen(true);
  };

  const handleNew = () => {
    setSelectedClient(null);
    setDialogOpen(true);
  };

  const handleAnalyze = (client: any) => {
    setAnalysisClient(client);
  };

  const handleImportFromCTE = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('import-clients-from-cte');
      
      if (error) throw error;
      
      if (data.success) {
        alert(`✅ ${data.message}\nImportados: ${data.imported}\nTotal no sistema: ${data.total}`);
        refetch();
      }
    } catch (error: any) {
      console.error('Erro ao importar clientes:', error);
      alert('❌ Erro ao importar clientes dos CTEs');
    }
  };

  return (    <>      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">CRM - Gestão de Clientes</h1>
            <p className="text-base text-muted-foreground">
              Gestão Inteligente de Relacionamento com Clientes
            </p>
          </div>
          <Button
            onClick={handleImportFromCTE}
            variant="outline"
            className="gap-2 shadow-sm"
          >
            <FileText className="w-4 h-4" />
            Importar de CTEs
          </Button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total de Clientes"
            value={stats?.totalClients || 0}
            icon={Users}
          />
          <StatCard
            title="Clientes Ativos"
            value={stats?.activeClients || 0}
            icon={TrendingUp}
            trend={{ value: `${stats?.totalClients || 0} total`, positive: true }}
          />
          <StatCard
            title="Limite Total de Crédito"
            value={`R$ ${((stats?.totalCredit || 0) / 1000).toFixed(0)}k`}
            icon={FileText}
          />
          <StatCard
            title="Inadimplentes"
            value={stats?.inadimplentes || 0}
            icon={AlertCircle}
            trend={{ 
              value: stats?.inadimplentes ? `${((stats.inadimplentes / (stats.totalClients || 1)) * 100).toFixed(1)}%` : "0%", 
              positive: false 
            }}
          />
        </div>

        {/* Análise de Cliente */}
        {analysisClient && (
          <ClientAnalysis
            clientCnpj={analysisClient.cnpj}
            clientName={analysisClient.razao_social}
          />
        )}

        {/* Lista de Clientes */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Clientes Cadastrados</CardTitle>
              <Button onClick={handleNew}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Cliente
              </Button>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por razão social, CNPJ ou nome fantasia..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Carregando clientes...
              </div>
            ) : filteredClients?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? "Nenhum cliente encontrado" : "Nenhum cliente cadastrado"}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>CNPJ</TableHead>
                    <TableHead>Razão Social</TableHead>
                    <TableHead>Cidade/UF</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Limite Crédito</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients?.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-mono">{client.cnpj}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{client.razao_social}</p>
                          {client.nome_fantasia && (
                            <p className="text-sm text-muted-foreground">{client.nome_fantasia}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {client.cidade && client.uf ? `${client.cidade}/${client.uf}` : '-'}
                      </TableCell>
                      <TableCell>{client.telefone || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={
                          client.status === 'ativo' ? 'default' : 
                          client.status === 'bloqueado' ? 'destructive' : 
                          'secondary'
                        }>
                          {client.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(Number(client.limite_credito || 0))}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleAnalyze(client)}>
                            Analisar
                          </Button>
                          <Button size="sm" onClick={() => handleEdit(client)}>
                            Editar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <ClientDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        client={selectedClient}
        onSuccess={refetch}
      />
    </>
  );
};

export default CRM;
