import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Phone,
  Mail,
  Calendar,
  MessageSquare,
  Plus,
  Search,
  Star
} from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { RevenueAnalysis } from "@/components/revenue/RevenueAnalysis";
import { Input } from "@/components/ui/input";
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
  const clientes = [
    { id: "CL001", nome: "Transportadora ABC Ltda", segmento: "Transportes", valor_mes: "R$ 48.5k", status: "ativo", ultimo_contato: "2025-11-10" },
    { id: "CL002", nome: "Logística XYZ S/A", segmento: "Logística", valor_mes: "R$ 35.2k", status: "ativo", ultimo_contato: "2025-11-11" },
    { id: "CL003", nome: "Frota Nacional", segmento: "Transportes", valor_mes: "R$ 28.9k", status: "ativo", ultimo_contato: "2025-11-08" },
    { id: "CL004", nome: "Cargo Express", segmento: "E-commerce", valor_mes: "R$ 22.1k", status: "inativo", ultimo_contato: "2025-10-28" },
  ];

  const leads = [
    { id: "LD001", nome: "Nova Transportadora", origem: "Site", interesse: "Contrato anual", valor_potencial: "R$ 180k", status: "negociacao" },
    { id: "LD002", nome: "Logística do Sul", origem: "Indicação", interesse: "Teste piloto", valor_potencial: "R$ 85k", status: "qualificacao" },
    { id: "LD003", nome: "Trans Norte", origem: "LinkedIn", interesse: "Orçamento", valor_potencial: "R$ 120k", status: "contato" },
  ];

  const atendimentos = [
    { id: "AT001", cliente: "Transportadora ABC", tipo: "Suporte", assunto: "Dúvida sobre faturamento", status: "aberto", prioridade: "alta" },
    { id: "AT002", cliente: "Logística XYZ", tipo: "Comercial", assunto: "Renovação de contrato", status: "andamento", prioridade: "alta" },
    { id: "AT003", cliente: "Frota Nacional", tipo: "Técnico", assunto: "Integração de sistema", status: "resolvido", prioridade: "media" },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">CRM - Customer Relationship</h1>
          <p className="text-muted-foreground mt-2">
            Gestão de Relacionamento com Clientes e Vendas
          </p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard 
            title="Clientes Ativos" 
            value="142" 
            icon={Users}
            trend={{ value: "+8 este mês", positive: true }}
          />
          <StatCard 
            title="Leads em Negociação" 
            value="23" 
            icon={TrendingUp}
          />
          <StatCard 
            title="Taxa de Conversão" 
            value="68%" 
            icon={Star}
            trend={{ value: "+5%", positive: true }}
          />
          <StatCard 
            title="Receita Recorrente" 
            value="R$ 1.2M" 
            icon={DollarSign}
            trend={{ value: "+12%", positive: true }}
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="clientes" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="clientes">Clientes</TabsTrigger>
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="atendimentos">Atendimentos</TabsTrigger>
            <TabsTrigger value="campanhas">Campanhas</TabsTrigger>
            <TabsTrigger value="receita">Receita</TabsTrigger>
            <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
          </TabsList>

          {/* Clientes */}
          <TabsContent value="clientes" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Carteira de Clientes</CardTitle>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Buscar clientes..." className="pl-8 w-64" />
                    </div>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Novo Cliente
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Segmento</TableHead>
                      <TableHead>Valor/Mês</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Último Contato</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clientes.map((cliente) => (
                      <TableRow key={cliente.id}>
                        <TableCell className="font-mono">{cliente.id}</TableCell>
                        <TableCell className="font-medium">{cliente.nome}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{cliente.segmento}</Badge>
                        </TableCell>
                        <TableCell className="font-semibold text-green-600">{cliente.valor_mes}</TableCell>
                        <TableCell>
                          <Badge variant={cliente.status === "ativo" ? "default" : "secondary"}>
                            {cliente.status === "ativo" ? "Ativo" : "Inativo"}
                          </Badge>
                        </TableCell>
                        <TableCell>{cliente.ultimo_contato}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Phone className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Leads */}
          <TabsContent value="leads" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Pipeline de Vendas</CardTitle>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Lead
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Origem</TableHead>
                      <TableHead>Interesse</TableHead>
                      <TableHead>Valor Potencial</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell className="font-mono">{lead.id}</TableCell>
                        <TableCell className="font-medium">{lead.nome}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{lead.origem}</Badge>
                        </TableCell>
                        <TableCell>{lead.interesse}</TableCell>
                        <TableCell className="font-semibold text-green-600">{lead.valor_potencial}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              lead.status === "negociacao" ? "default" : 
                              lead.status === "qualificacao" ? "secondary" : 
                              "outline"
                            }
                          >
                            {lead.status === "negociacao" ? "Negociação" : 
                             lead.status === "qualificacao" ? "Qualificação" : 
                             "Contato Inicial"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">Avançar</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Leads Este Mês</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">34</p>
                  <p className="text-sm text-muted-foreground mt-2">+12 vs mês anterior</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Taxa de Conversão</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-green-600">68%</p>
                  <p className="text-sm text-muted-foreground mt-2">+5% vs mês anterior</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Valor Médio</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">R$ 128k</p>
                  <p className="text-sm text-muted-foreground mt-2">por contrato</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Atendimentos */}
          <TabsContent value="atendimentos" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Central de Atendimento</CardTitle>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Ticket
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Assunto</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Prioridade</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {atendimentos.map((atendimento) => (
                      <TableRow key={atendimento.id}>
                        <TableCell className="font-mono">{atendimento.id}</TableCell>
                        <TableCell>{atendimento.cliente}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{atendimento.tipo}</Badge>
                        </TableCell>
                        <TableCell>{atendimento.assunto}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              atendimento.status === "resolvido" ? "default" : 
                              atendimento.status === "andamento" ? "secondary" : 
                              "destructive"
                            }
                          >
                            {atendimento.status === "resolvido" ? "Resolvido" : 
                             atendimento.status === "andamento" ? "Em Andamento" : 
                             "Aberto"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              atendimento.prioridade === "alta" ? "destructive" : 
                              atendimento.prioridade === "media" ? "secondary" : 
                              "outline"
                            }
                          >
                            {atendimento.prioridade === "alta" ? "Alta" : 
                             atendimento.prioridade === "media" ? "Média" : 
                             "Baixa"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Receita */}
          <TabsContent value="receita" className="space-y-4">
            <RevenueAnalysis />
          </TabsContent>

          {/* Campanhas */}
          <TabsContent value="campanhas" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Campanhas Ativas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-medium">Renovação de Contratos Q4</p>
                    <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                      <span>Taxa abertura: 42%</span>
                      <span>Conversões: 18</span>
                    </div>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-medium">Promoção Black Friday</p>
                    <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                      <span>Taxa abertura: 38%</span>
                      <span>Conversões: 12</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4">
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Campanha
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Próximos Follow-ups
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-medium">Transportadora ABC</p>
                    <p className="text-sm text-muted-foreground mt-1">Hoje, 14:00 - Renovação contrato</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-medium">Nova Transportadora</p>
                    <p className="text-sm text-muted-foreground mt-1">Amanhã, 10:00 - Apresentação</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-medium">Logística do Sul</p>
                    <p className="text-sm text-muted-foreground mt-1">13/11, 16:00 - Follow-up proposta</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Relatórios */}
          <TabsContent value="relatorios" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">NPS Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-green-600">8.4</p>
                  <p className="text-sm text-muted-foreground mt-2">+0.3 vs trimestre anterior</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Tempo Médio Resposta</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">2.1h</p>
                  <p className="text-sm text-muted-foreground mt-2">-0.4h vs mês anterior</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Taxa de Retenção</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-green-600">94%</p>
                  <p className="text-sm text-muted-foreground mt-2">+2% vs ano anterior</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Relatórios Disponíveis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  Análise de Churn por Segmento
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Performance da Equipe de Vendas
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Funil de Conversão Detalhado
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Lifetime Value por Cliente
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default CRM;
