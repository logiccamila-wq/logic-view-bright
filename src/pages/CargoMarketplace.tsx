import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, TrendingUp, MapPin, DollarSign, Users, Package2, Star, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CargoListing {
  id: string;
  title: string;
  origin: string;
  destination: string;
  weight: number;
  volume: number;
  value: number;
  deadline: string;
  rating: number;
  shipper: { name: string; rating: number; completedOrders: number };
  status: "open" | "matched" | "in-transit" | "delivered";
}

interface Carrier {
  id: string;
  name: string;
  rating: number;
  vehicles: number;
  completedOrders: number;
  specialties: string[];
  pricePerKm: number;
}

export default function CargoMarketplace() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("listings");

  const [listings] = useState<CargoListing[]>([
    {
      id: "1",
      title: "Eletrônicos - SP para RJ",
      origin: "São Paulo, SP",
      destination: "Rio de Janeiro, RJ",
      weight: 2500,
      volume: 12.5,
      value: 45000,
      deadline: new Date(Date.now() + 172800000).toISOString(),
      rating: 4.8,
      shipper: { name: "Tech Distribuidora", rating: 4.9, completedOrders: 234 },
      status: "open"
    },
    {
      id: "2",
      title: "Alimentos Perecíveis - SP para BH",
      origin: "São Paulo, SP",
      destination: "Belo Horizonte, MG",
      weight: 1800,
      volume: 8.3,
      value: 12500,
      deadline: new Date(Date.now() + 86400000).toISOString(),
      rating: 4.7,
      shipper: { name: "Alimentos Express", rating: 4.8, completedOrders: 156 },
      status: "open"
    },
    {
      id: "3",
      title: "Materiais Construção - RJ para Salvador",
      origin: "Rio de Janeiro, RJ",
      destination: "Salvador, BA",
      weight: 5400,
      volume: 28.0,
      value: 28000,
      deadline: new Date(Date.now() + 259200000).toISOString(),
      rating: 4.6,
      shipper: { name: "Construmax", rating: 4.7, completedOrders: 89 },
      status: "matched"
    }
  ]);

  const [carriers] = useState<Carrier[]>([
    {
      id: "1",
      name: "Transportes Rápido Ltda",
      rating: 4.9,
      vehicles: 24,
      completedOrders: 1247,
      specialties: ["Eletrônicos", "Frigorificado", "Cargas Leves"],
      pricePerKm: 3.80
    },
    {
      id: "2",
      name: "LogiExpress Brasil",
      rating: 4.8,
      vehicles: 18,
      completedOrders: 892,
      specialties: ["Alimentos", "Frigorificado", "Urgente"],
      pricePerKm: 4.20
    },
    {
      id: "3",
      name: "MegaCargas Transportes",
      rating: 4.7,
      vehicles: 32,
      completedOrders: 1534,
      specialties: ["Cargas Pesadas", "Construção", "Grande Volume"],
      pricePerKm: 3.50
    }
  ]);

  const handleBid = (_listingId: string) => {
    toast({
      title: "Proposta Enviada",
      description: "O embarcador receberá sua oferta em instantes"
    });
  };

  const handleMatch = (_carrierId: string) => {
    toast({
      title: "Match Realizado!",
      description: "Transportadora selecionada. Iniciando processo de contratação."
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "bg-green-600";
      case "matched": return "bg-blue-600";
      case "in-transit": return "bg-purple-600";
      case "delivered": return "bg-gray-600";
      default: return "bg-gray-400";
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      open: "Aberto",
      matched: "Combinado",
      "in-transit": "Em Trânsito",
      delivered: "Entregue"
    };
    return labels[status] || status;
  };

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <ShoppingCart className="h-8 w-8 text-emerald-600" />
              Marketplace de Cargas
            </h1>
            <p className="text-muted-foreground mt-1">
              Conectando embarcadores e transportadoras de forma inteligente
            </p>
          </div>
          <Button>
            <Package2 className="h-4 w-4 mr-2" />
            Publicar Carga
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cargas Disponíveis</CardTitle>
              <Package2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">847</div>
              <p className="text-xs text-green-600">+23 hoje</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transportadoras</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1.2K</div>
              <p className="text-xs text-muted-foreground">Ativas na plataforma</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Matches Hoje</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">234</div>
              <p className="text-xs text-green-600">+18% vs ontem</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Volume Transacionado</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ 2.4M</div>
              <p className="text-xs text-muted-foreground">Este mês</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="listings">Cargas Disponíveis</TabsTrigger>
            <TabsTrigger value="carriers">Transportadoras</TabsTrigger>
            <TabsTrigger value="matches">Meus Matches</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Listings Tab */}
          <TabsContent value="listings" className="space-y-4">
            <div className="flex gap-2 mb-4">
              <Input placeholder="Buscar por origem, destino, tipo..." className="flex-1" />
              <Button variant="outline">Filtros</Button>
            </div>

            {listings.map((listing) => (
              <Card key={listing.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{listing.title}</CardTitle>
                        <Badge className={getStatusColor(listing.status)}>
                          {getStatusLabel(listing.status)}
                        </Badge>
                      </div>
                      <CardDescription className="mt-2 flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {listing.origin} → {listing.destination}
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          {listing.shipper.rating}
                        </span>
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        R$ {listing.value.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Prazo: {new Date(listing.deadline).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Peso</p>
                      <p className="font-semibold">{listing.weight} kg</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Volume</p>
                      <p className="font-semibold">{listing.volume} m³</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Embarcador</p>
                      <p className="font-semibold text-sm">{listing.shipper.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Pedidos</p>
                      <p className="font-semibold">{listing.shipper.completedOrders}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={() => handleBid(listing.id)}
                      disabled={listing.status !== "open"}
                    >
                      <DollarSign className="h-4 w-4 mr-2" />
                      Fazer Proposta
                    </Button>
                    <Button variant="outline">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Contatar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Carriers Tab */}
          <TabsContent value="carriers" className="space-y-4">
            <div className="flex gap-2 mb-4">
              <Input placeholder="Buscar transportadora..." className="flex-1" />
              <Button variant="outline">Filtros</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {carriers.map((carrier) => (
                <Card key={carrier.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{carrier.name}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          {carrier.rating} ({carrier.completedOrders} entregas)
                        </CardDescription>
                      </div>
                      <Badge variant="outline">{carrier.vehicles} veículos</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-2">Especialidades</p>
                      <div className="flex flex-wrap gap-1">
                        {carrier.specialties.map((spec, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div>
                        <p className="text-xs text-muted-foreground">Preço médio</p>
                        <p className="text-xl font-bold">R$ {carrier.pricePerKm}/km</p>
                      </div>
                      <Button onClick={() => handleMatch(carrier.id)}>
                        Contratar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* My Matches Tab */}
          <TabsContent value="matches" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Matches Ativos</CardTitle>
                <CardDescription>Cargas que você combinou com transportadoras</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {listings.filter(l => l.status === "matched").map((listing) => (
                    <div key={listing.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{listing.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {listing.origin} → {listing.destination}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-blue-600 mb-2">Em andamento</Badge>
                        <p className="text-sm font-bold">R$ {listing.value.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Performance do Marketplace</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Taxa de Match</span>
                      <span className="text-2xl font-bold">87.3%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Tempo Médio de Match</span>
                      <span className="text-2xl font-bold">2.4h</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Satisfação Geral</span>
                      <span className="text-2xl font-bold flex items-center gap-1">
                        4.8 <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Rotas Mais Populares</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[
                      { route: "SP → RJ", count: 234 },
                      { route: "SP → BH", count: 187 },
                      { route: "RJ → Salvador", count: 156 },
                      { route: "SP → Curitiba", count: 142 }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 border-b">
                        <span className="font-medium">{item.route}</span>
                        <Badge variant="outline">{item.count} cargas</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
