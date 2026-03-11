import React, { useState } from 'react';
import { Settings, MessageSquare, BarChart3, Package, TrendingUp, Send, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ERPChatPanel } from "@/components/erp/ERPChatPanel";

const SEVEN_DAY_RISK_THRESHOLD = 50;
const THIRTY_DAY_RISK_THRESHOLD = 70;

const modules = [
  { icon: BarChart3, label: "Analytics", value: "R$ 4,2M", change: "+12%", positive: true },
  { icon: Package, label: "Estoque", value: "1.847 itens", change: "-3%", positive: false },
  { icon: TrendingUp, label: "Receita", value: "R$ 892K", change: "+8%", positive: true },
  { icon: MessageSquare, label: "Mensagens", value: "24 novas", change: "+5", positive: true },
];

const inventory = [
  { sku: "PRD-001", nome: "Peças Motor Diesel", estoque: 320, minimo: 50, status: "ok" },
  { sku: "PRD-002", nome: "Filtros de Óleo", estoque: 18, minimo: 30, status: "baixo" },
  { sku: "PRD-003", nome: "Pneus 295/80 R22.5", estoque: 64, minimo: 20, status: "ok" },
  { sku: "PRD-004", nome: "Pastilhas de Freio", estoque: 5, minimo: 15, status: "crítico" },
  { sku: "PRD-005", nome: "Correias Dentadas", estoque: 110, minimo: 40, status: "ok" },
];

const mensagensIniciais = [
  { id: "msg-1", de: "Operações", texto: "Solicitação de compra urgente — filtros de óleo", hora: "09:14" },
  { id: "msg-2", de: "Financeiro", texto: "Aprovação pendente para NF #4512", hora: "09:30" },
  { id: "msg-3", de: "Manutenção", texto: "Alerta: pastilhas de freio em nível crítico", hora: "10:02" },
];

const ERPSystemShaderStyle = () => {
  const [prediction, setPrediction] = useState(50);
  const [teamMessages, setTeamMessages] = useState(mensagensIniciais);
  const [message, setMessage] = useState('');

  const getPredictionLabel = (val: number) => {
    if (val < 30) return { label: "Baixo Risco", color: "text-emerald-400" };
    if (val < 60) return { label: "Risco Moderado", color: "text-yellow-400" };
    if (val < 80) return { label: "Alto Risco", color: "text-orange-400" };
    return { label: "Risco Crítico", color: "text-red-400" };
  };

  const { label: predLabel, color: predColor } = getPredictionLabel(prediction);

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      ok: "bg-emerald-500/20 text-emerald-400",
      baixo: "bg-yellow-500/20 text-yellow-400",
      crítico: "bg-red-500/20 text-red-400",
    };
    return (
      <Badge className={map[status] ?? "bg-slate-500/20 text-slate-400"}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header com gradiente shader */}
      <div className="relative rounded-2xl overflow-hidden p-6 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 shadow-xl">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-indigo-500 via-transparent to-transparent pointer-events-none" />
        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              ERP — Gestão Integrada
            </h1>
            <p className="text-indigo-300 mt-1 text-sm">
              Visão unificada de operações, estoque, finanças e comunicação
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-indigo-500/30 text-indigo-200 border-indigo-500/40 border">
              <Settings className="w-3 h-3 mr-1" />
              Sistema Ativo
            </Badge>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {modules.map(({ icon: Icon, label, value, change, positive }) => (
          <Card
            key={label}
            className="bg-gradient-to-br from-slate-800/60 to-slate-900/80 border border-slate-700/50 backdrop-blur-sm shadow-md"
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-400 text-sm font-medium">{label}</span>
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-indigo-400" />
                </div>
              </div>
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className={`text-xs mt-1 font-medium ${positive ? "text-emerald-400" : "text-red-400"}`}>
                {positive ? "▲" : "▼"} {change} este mês
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs principais */}
      <Tabs defaultValue="analytics" className="w-full">
        <TabsList className="bg-slate-800/60 border border-slate-700/50">
          <TabsTrigger value="analytics" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="erp-pilot" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
            <Sparkles className="w-4 h-4 mr-2" />
            ERP Pilot
          </TabsTrigger>
          <TabsTrigger value="inventory" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
            <Package className="w-4 h-4 mr-2" />
            Estoque
          </TabsTrigger>
          <TabsTrigger value="messages" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
            <MessageSquare className="w-4 h-4 mr-2" />
            Mensagens
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
            <Settings className="w-4 h-4 mr-2" />
            Configurações
          </TabsTrigger>
        </TabsList>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4 mt-4">
          <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/80 border border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <TrendingUp className="w-5 h-5 text-indigo-400" />
                Previsão de Demanda — IA
              </CardTitle>
              <CardDescription className="text-slate-400">
                Ajuste o nível de confiança da previsão preditiva
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 text-sm">Índice de Risco Operacional</span>
                  <span className={`text-sm font-bold ${predColor}`}>
                    {prediction}% — {predLabel}
                  </span>
                </div>
                <Slider
                  value={[prediction]}
                  onValueChange={(v) => setPrediction(v[0])}
                  min={0}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-slate-500">
                  <span>0 — Sem risco</span>
                  <span>100 — Risco máximo</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-2">
                {[
                  { label: "Previsão 7 dias", value: prediction < SEVEN_DAY_RISK_THRESHOLD ? "Normal" : "Alerta" },
                  { label: "Previsão 30 dias", value: prediction < THIRTY_DAY_RISK_THRESHOLD ? "Estável" : "Crítico" },
                  { label: "Confiança IA", value: `${Math.round(70 + (prediction / 100) * 30)}%` },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="rounded-xl bg-slate-700/40 border border-slate-600/30 p-4 text-center"
                  >
                    <p className="text-xs text-slate-400 mb-1">{label}</p>
                    <p className="text-base font-semibold text-white">{value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: "Receita Acumulada", items: ["Jan: R$ 720K", "Fev: R$ 810K", "Mar: R$ 892K"], color: "text-emerald-400" },
              { title: "Custo Operacional", items: ["Frete: R$ 340K", "Manutenção: R$ 128K", "Pessoal: R$ 256K"], color: "text-orange-400" },
            ].map(({ title, items, color }) => (
              <Card key={title} className="bg-gradient-to-br from-slate-800/60 to-slate-900/80 border border-slate-700/50">
                <CardHeader>
                  <CardTitle className={`text-sm font-semibold ${color}`}>{title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {items.map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-indigo-500" />
                      <span className="text-slate-300 text-sm">{item}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ERP Pilot Chat Tab */}
        <TabsContent value="erp-pilot" className="mt-4">
          <ERPChatPanel />
        </TabsContent>

        {/* Inventory Tab */}
        <TabsContent value="inventory" className="mt-4">
          <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/80 border border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Package className="w-5 h-5 text-indigo-400" />
                Gestão de Estoque
              </CardTitle>
              <CardDescription className="text-slate-400">
                Itens com estoque mínimo e alertas de reposição
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700/50 hover:bg-transparent">
                    <TableHead className="text-slate-400">SKU</TableHead>
                    <TableHead className="text-slate-400">Produto</TableHead>
                    <TableHead className="text-slate-400 text-right">Estoque</TableHead>
                    <TableHead className="text-slate-400 text-right">Mínimo</TableHead>
                    <TableHead className="text-slate-400">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventory.map((item) => (
                    <TableRow key={item.sku} className="border-slate-700/30 hover:bg-slate-700/20">
                      <TableCell className="text-slate-400 font-mono text-xs">{item.sku}</TableCell>
                      <TableCell className="text-slate-200">{item.nome}</TableCell>
                      <TableCell className="text-slate-200 text-right font-medium">{item.estoque}</TableCell>
                      <TableCell className="text-slate-400 text-right">{item.minimo}</TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Messages Tab */}
        <TabsContent value="messages" className="space-y-4 mt-4">
          <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/80 border border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <MessageSquare className="w-5 h-5 text-indigo-400" />
                Central de Comunicação
              </CardTitle>
              <CardDescription className="text-slate-400">
                Mensagens entre módulos e equipes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {teamMessages.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-start gap-3 p-3 rounded-xl bg-slate-700/30 border border-slate-600/20"
                  >
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-indigo-300">{m.de}</span>
                        <span className="text-xs text-slate-500">{m.hora}</span>
                      </div>
                      <p className="text-sm text-slate-300">{m.texto}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <Textarea
                  placeholder="Digite uma mensagem para a equipe..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="bg-slate-700/40 border-slate-600/50 text-slate-200 placeholder:text-slate-500 resize-none h-20"
                />
              </div>
              <Button
                onClick={() => {
                  if (!message.trim()) return;
                  const now = new Date();
                  const hora = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                  setTeamMessages((prev) => [
                    ...prev,
                    { id: `msg-${Date.now()}`, de: "Você", texto: message.trim(), hora },
                  ]);
                  setMessage('');
                }}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                disabled={!message.trim()}
              >
                <Send className="w-4 h-4 mr-2" />
                Enviar Mensagem
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4 mt-4">
          <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/80 border border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Settings className="w-5 h-5 text-indigo-400" />
                Configurações do Sistema
              </CardTitle>
              <CardDescription className="text-slate-400">
                Parâmetros gerais de operação do ERP
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: "Empresa", placeholder: "Nome da empresa", defaultValue: "LogicFlow Transportes" },
                  { label: "CNPJ", placeholder: "00.000.000/0000-00", defaultValue: "12.345.678/0001-90" },
                  { label: "E-mail ERP", placeholder: "erp@empresa.com", defaultValue: "erp@logicflow.com.br" },
                  { label: "Fuso Horário", placeholder: "America/Sao_Paulo", defaultValue: "America/Sao_Paulo" },
                ].map(({ label, placeholder, defaultValue }) => (
                  <div key={label} className="space-y-1">
                    <label className="text-sm text-slate-400">{label}</label>
                    <Input
                      placeholder={placeholder}
                      defaultValue={defaultValue}
                      className="bg-slate-700/40 border-slate-600/50 text-slate-200 placeholder:text-slate-500"
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-2">
                <p className="text-sm font-medium text-slate-300">Módulos Ativos</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {["TMS", "WMS", "OMS", "CRM", "SCM", "BI"].map((mod) => (
                    <div
                      key={mod}
                      className="flex items-center gap-2 p-2 rounded-lg bg-slate-700/30 border border-slate-600/20"
                    >
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="text-sm text-slate-300 font-medium">{mod}</span>
                      <Badge className="ml-auto bg-emerald-500/20 text-emerald-400 text-xs">ON</Badge>
                    </div>
                  ))}
                </div>
              </div>

              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                <Settings className="w-4 h-4 mr-2" />
                Salvar Configurações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ERPSystemShaderStyle;
