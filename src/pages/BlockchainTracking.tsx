import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Link2, Package, Truck, CheckCircle2, AlertCircle, Clock, FileCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BlockchainTransaction {
  hash: string;
  timestamp: string;
  type: "shipment" | "delivery" | "inspection" | "payment";
  status: "confirmed" | "pending" | "failed";
  from: string;
  to: string;
  data: Record<string, unknown>;
  confirmations: number;
}

interface SmartContract {
  id: string;
  name: string;
  status: "active" | "completed" | "cancelled";
  parties: string[];
  conditions: string[];
  progress: number;
  value: number;
}

export default function BlockchainTracking() {
  const { toast } = useToast();
  const [searchHash, setSearchHash] = useState("");
  const [transactions, setTransactions] = useState<BlockchainTransaction[]>([
    {
      hash: "0x7f9fade1c0d57a7af66ab4ead79fade1c0d57a7af66ab4ead7c2c2eb7b11a91385",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      type: "shipment",
      status: "confirmed",
      from: "Depósito SP",
      to: "Centro Distribuição RJ",
      data: { cargo: "Eletrônicos", weight: 2500, value: 45000 },
      confirmations: 12
    },
    {
      hash: "0x8a9fade1c0d57a7af66ab4ead79fade1c0d57a7af66ab4ead7c2c2eb7b11a92486",
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      type: "delivery",
      status: "confirmed",
      from: "Transportadora XYZ",
      to: "Cliente Final",
      data: { proof: "Assinatura Digital", location: { lat: -23.5505, lng: -46.6333 } },
      confirmations: 24
    },
    {
      hash: "0x9b0fade1c0d57a7af66ab4ead79fade1c0d57a7af66ab4ead7c2c2eb7b11a93587",
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      type: "inspection",
      status: "pending",
      from: "Sistema Qualidade",
      to: "Blockchain Network",
      data: { inspector: "João Silva", result: "Aprovado", photos: 4 },
      confirmations: 3
    }
  ]);

  const [contracts, _setContracts] = useState<SmartContract[]>([
    {
      id: "SC-001",
      name: "Entrega SP-RJ - Eletrônicos",
      status: "active",
      parties: ["Remetente ABC", "Transportadora XYZ", "Destinatário DEF"],
      conditions: [
        "Coleta realizada em até 24h",
        "Temperatura mantida entre 15-25°C",
        "Entrega em até 48h",
        "Sem avarias no produto"
      ],
      progress: 75,
      value: 45000
    },
    {
      id: "SC-002",
      name: "Logística Reversa - Devolução",
      status: "active",
      parties: ["Cliente", "Transportadora", "Fabricante"],
      conditions: [
        "Produto lacrado e com nota fiscal",
        "Prazo de devolução respeitado",
        "Inspeção aprovada"
      ],
      progress: 33,
      value: 12500
    },
    {
      id: "SC-003",
      name: "Transporte Frigorificado - Alimentos",
      status: "completed",
      parties: ["Fornecedor", "Transportadora", "Supermercado"],
      conditions: [
        "Temperatura -18°C constantemente",
        "Certificado sanitário válido",
        "Entrega em até 12h"
      ],
      progress: 100,
      value: 28000
    }
  ]);

  const registerOnBlockchain = async (type: string) => {
    toast({
      title: "Registrando na Blockchain",
      description: "Criando transação imutável..."
    });

    setTimeout(() => {
      const newTransaction: BlockchainTransaction = {
        hash: `0x${Math.random().toString(16).substr(2, 64)}`,
        timestamp: new Date().toISOString(),
        type: type as "shipment" | "delivery" | "inspection" | "payment",
        status: "pending",
        from: "Sistema LogicFlow",
        to: "Blockchain Network",
        data: { automated: true },
        confirmations: 0
      };

      setTransactions(prev => [newTransaction, ...prev]);

      toast({
        title: "Registrado com Sucesso",
        description: `Hash: ${newTransaction.hash.substr(0, 20)}...`
      });
    }, 1500);
  };

  const verifyTransaction = (hash: string) => {
    const tx = transactions.find(t => t.hash === hash);
    if (tx) {
      toast({
        title: "Transação Verificada",
        description: `Status: ${tx.status} | Confirmações: ${tx.confirmations}`
      });
    } else {
      toast({
        title: "Transação Não Encontrada",
        description: "Hash não existe na blockchain",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "text-green-600";
      case "pending": return "text-yellow-600";
      case "failed": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed": return <CheckCircle2 className="h-4 w-4" />;
      case "pending": return <Clock className="h-4 w-4" />;
      case "failed": return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="h-8 w-8 text-blue-600" />
              Blockchain & Rastreabilidade
            </h1>
            <p className="text-muted-foreground mt-1">
              Rastreamento imutável e contratos inteligentes
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => registerOnBlockchain("shipment")}>
              <Link2 className="h-4 w-4 mr-2" />
              Registrar Embarque
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transações</CardTitle>
              <Link2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{transactions.length}</div>
              <p className="text-xs text-muted-foreground">
                {transactions.filter(t => t.status === "confirmed").length} confirmadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Smart Contracts</CardTitle>
              <FileCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{contracts.length}</div>
              <p className="text-xs text-muted-foreground">
                {contracts.filter(c => c.status === "active").length} ativos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rastreamentos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">247</div>
              <p className="text-xs text-muted-foreground">Em tempo real</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Protegido</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ 85.5K</div>
              <p className="text-xs text-muted-foreground">Em contratos ativos</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle>Verificar Transação</CardTitle>
            <CardDescription>
              Digite o hash da transação para verificar na blockchain
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="0x7f9fade1c0d57a7af66ab4ead79fade1c0d57a7af66ab4ead7..."
                value={searchHash}
                onChange={(e) => setSearchHash(e.target.value)}
              />
              <Button onClick={() => verifyTransaction(searchHash)}>
                Verificar
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="transactions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="transactions">Transações</TabsTrigger>
            <TabsTrigger value="contracts">Smart Contracts</TabsTrigger>
            <TabsTrigger value="trace">Rastreamento</TabsTrigger>
          </TabsList>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-4">
            {transactions.map((tx) => (
              <Card key={tx.hash}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base font-mono text-sm">
                          {tx.hash.substr(0, 20)}...{tx.hash.substr(-10)}
                        </CardTitle>
                        <Badge variant="outline">{tx.type}</Badge>
                      </div>
                      <CardDescription>
                        {new Date(tx.timestamp).toLocaleString()}
                      </CardDescription>
                    </div>
                    <div className={`flex items-center gap-2 ${getStatusColor(tx.status)}`}>
                      {getStatusIcon(tx.status)}
                      <span className="font-medium capitalize">{tx.status}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">De:</span>
                      <p className="font-medium">{tx.from}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Para:</span>
                      <p className="font-medium">{tx.to}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-sm text-muted-foreground">
                      Confirmações: {tx.confirmations}/12
                    </span>
                    <Button variant="ghost" size="sm">Ver Detalhes</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Smart Contracts Tab */}
          <TabsContent value="contracts" className="space-y-4">
            {contracts.map((contract) => (
              <Card key={contract.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{contract.name}</CardTitle>
                      <CardDescription>Contrato ID: {contract.id}</CardDescription>
                    </div>
                    <Badge variant={contract.status === "completed" ? "default" : "secondary"}>
                      {contract.status === "completed" ? "Completo" : "Ativo"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progresso</span>
                      <span className="font-bold">{contract.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${contract.progress}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold mb-2">Partes Envolvidas</h4>
                    <div className="flex flex-wrap gap-2">
                      {contract.parties.map((party, idx) => (
                        <Badge key={idx} variant="outline">{party}</Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold mb-2">Condições</h4>
                    <ul className="space-y-1">
                      {contract.conditions.map((condition, idx) => (
                        <li key={idx} className="text-sm flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                          <span>{condition}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-lg font-bold">
                      R$ {contract.value.toLocaleString()}
                    </span>
                    <Button variant="outline" size="sm">Ver Contrato</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Traceability Tab */}
          <TabsContent value="trace" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Rastreamento de Carga</CardTitle>
                <CardDescription>
                  Histórico completo e imutável registrado na blockchain
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { time: "14:30", event: "Coleta realizada", location: "São Paulo, SP", status: "confirmed" },
                    { time: "16:45", event: "Saída do depósito", location: "São Paulo, SP", status: "confirmed" },
                    { time: "20:15", event: "Parada programada", location: "Registro, SP", status: "confirmed" },
                    { time: "02:30", event: "Em trânsito", location: "Curitiba, PR", status: "pending" },
                    { time: "08:00", event: "Previsão de entrega", location: "Rio de Janeiro, RJ", status: "pending" }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-4 pb-4 border-b last:border-0">
                      <div className="flex flex-col items-center">
                        {item.status === "confirmed" ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <Clock className="h-5 w-5 text-gray-400" />
                        )}
                        {idx < 4 && <div className="w-0.5 h-12 bg-gray-200 mt-1" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{item.event}</h4>
                          <span className="text-sm text-muted-foreground">{item.time}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          <Truck className="h-3 w-3 inline mr-1" />
                          {item.location}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
