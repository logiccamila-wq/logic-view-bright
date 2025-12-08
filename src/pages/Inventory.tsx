import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
  FileText,
  Droplet,
  SprayCan,
  Filter,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { InventoryItemDialog } from "@/components/inventory/InventoryItemDialog";
import { MovementDialog } from "@/components/inventory/MovementDialog";
import { InventoryRequestsTable } from "@/components/inventory/InventoryRequestsTable";
import { RequestItemDialog } from "@/components/inventory/RequestItemDialog";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { MovementsTable } from "@/components/inventory/MovementsTable";
import { StatCard } from "@/components/StatCard";
import { BarcodeScanner } from "@/components/inventory/BarcodeScanner";

interface InventoryItem {
  id: string;
  part_code: string;
  part_name: string;
  category: string;
  subcategory: string | null;
  quantity: number;
  minimum_stock: number;
  critical_stock: number;
  unit_price: number | null;
  supplier: string | null;
  location: string | null;
  barcode: string | null;
  notes: string | null;
  last_restocked: string | null;
  warehouse_type: string | null;
  created_at: string;
  updated_at: string;
}

interface Request {
  id: string;
  item_id: string;
  quantity: number;
  status: string;
  reason: string;
  created_at: string;
  requester_id: string;
  warehouse_type: string;
  workshop_inventory: {
    part_name: string;
    part_code: string;
  };
  profiles?: {
    full_name: string;
    email: string;
  };
}

interface Movement {
  id: string;
  item_id: string;
  movement_type: string;
  quantity: number;
  reason: string;
  reference_document: string | null;
  notes: string | null;
  created_at: string;
  workshop_inventory: {
    part_name: string;
    part_code: string;
  };
}

const Inventory = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [movementDialogOpen, setMovementDialogOpen] = useState(false);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [activeTab, setActiveTab] = useState("workshop");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Carregar inventário
      const { data: invData, error: invError } = await supabase
        .from('workshop_inventory' as any)
        .select('*')
        .order('part_name');

      if (invError) throw invError;
      setInventory((invData as any) || []);

      // Carregar movimentações
      const { data: movData, error: movError } = await supabase
        .from('inventory_movements' as any)
        .select(`
          *,
          workshop_inventory (
            part_name,
            part_code
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (movError) throw movError;
      setMovements((movData as any) || []);

      // Carregar solicitações
      const { data: reqData, error: reqError } = await supabase
        .from('inventory_requests' as any)
        .select(`
          *,
          workshop_inventory (
            part_name,
            part_code
          ),
          profiles:requester_id (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false });
      
      if (!reqError) {
        // Cast seguro pois a query retorna a estrutura correta
        setRequests((reqData as any) || []);
      }

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados do estoque');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredInventory = (type: string) => {
    return inventory.filter(item => {
      const matchesSearch = 
        item.part_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.part_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.supplier || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      const matchesType = (item.warehouse_type || 'workshop') === type;
      
      return matchesSearch && matchesCategory && matchesType;
    });
  };

  const handleRequestApprove = async (id: string) => {
    try {
      const { error } = await supabase
        .rpc('approve_inventory_request' as any, {
          p_request_id: id,
          p_approver_id: user?.id
        });
      
      if (error) throw error;
      toast.success('Solicitação aprovada');
      loadData();
    } catch (e: any) {
      console.error('Erro ao aprovar:', e);
      toast.error(e.message || 'Erro ao aprovar solicitação');
    }
  };

  const handleRequestReject = async (id: string, reason: string) => {
    try {
      const { error } = await supabase
        .rpc('reject_inventory_request' as any, {
          p_request_id: id,
          p_approver_id: user?.id,
          p_reason: reason
        });
      
      if (error) throw error;
      toast.success('Solicitação rejeitada');
      loadData();
    } catch (e: any) {
      console.error('Erro ao rejeitar:', e);
      toast.error(e.message || 'Erro ao rejeitar solicitação');
    }
  };

  const lowStockItems = inventory.filter(item => item.quantity <= item.minimum_stock);
  const criticalStockItems = inventory.filter(item => item.quantity <= item.critical_stock);
  const totalValue = inventory.reduce((sum, item) => sum + (item.quantity * (item.unit_price || 0)), 0);
  const totalItems = inventory.reduce((sum, item) => sum + item.quantity, 0);

  const categories = [
    { value: 'all', label: 'Todas' },
    { value: 'Peças Mecânicas', label: 'Peças Mecânicas' },
    { value: 'Pneus e Rodas', label: 'Pneus e Rodas' },
    { value: 'Filtros', label: 'Filtros' },
    { value: 'Fluidos', label: 'Fluidos' },
    { value: 'Elétrica', label: 'Elétrica' },
    { value: 'Lavajato - Químicos', label: 'Lavajato - Químicos' },
    { value: 'Lavajato - Consumíveis', label: 'Lavajato - Consumíveis' },
    { value: 'Ferramentas', label: 'Ferramentas' },
  ];

  const handleAddItem = () => {
    setSelectedItem(null);
    setItemDialogOpen(true);
  };

  const handleEditItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setItemDialogOpen(true);
  };

  const handleAddMovement = (item?: InventoryItem) => {
    setSelectedItem(item || null);
    setMovementDialogOpen(true);
  };

  const handleRequestItem = (item?: InventoryItem) => {
    setSelectedItem(item || null);
    setRequestDialogOpen(true);
  };

  const handleBarcodeScan = async (barcode: string) => {
    const item = inventory.find(
      (i) => i.barcode === barcode || i.part_code === barcode
    );
    if (item) {
      toast.success(`Item encontrado: ${item.part_name}`);
      setSelectedItem(item);
      setMovementDialogOpen(true);
    } else {
      toast.error("Item não encontrado");
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando estoque...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Gestão de Estoque</h1>
            <p className="text-muted-foreground">
              Controle com IOT: scanner de código de barras e impressora de etiquetas
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => handleRequestItem()} variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              Solicitar Material
            </Button>
            <Button onClick={() => handleAddMovement()} variant="outline">
              <ArrowUpDown className="w-4 h-4 mr-2" />
              Nova Movimentação
            </Button>
            <Button onClick={handleAddItem}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Item
            </Button>
          </div>
        </div>

        {/* Scanner de Código de Barras */}
        <BarcodeScanner onScan={handleBarcodeScan} />

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="Total de Itens"
            value={totalItems.toString()}
            icon={Package}
          />
          <StatCard
            title="Valor Total"
            value={`R$ ${Number(totalValue ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            icon={TrendingUp}
          />
          <StatCard
            title="Solicitações Pendentes"
            value={requests.filter(r => r.status === 'pending').length.toString()}
            icon={FileText}
          />
          <StatCard
            title="Estoque Crítico"
            value={criticalStockItems.length.toString()}
            icon={AlertTriangle}
          />
        </div>

        {/* Alertas de estoque crítico */}
        {criticalStockItems.length > 0 && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-5 h-5" />
                Itens com Estoque Crítico
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {criticalStockItems.map(item => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <div>
                      <span className="font-medium">{item.part_name}</span>
                      <span className="text-muted-foreground ml-2">({item.part_code})</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="destructive">
                        {item.quantity} unidades
                      </Badge>
                      <Button size="sm" onClick={() => handleAddMovement(item)}>
                        Registrar Entrada
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="workshop" className="space-y-6" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="workshop">
              <Package className="w-4 h-4 mr-2" />
              Oficina
            </TabsTrigger>
            <TabsTrigger value="office">
              <Package className="w-4 h-4 mr-2" />
              Empresa
            </TabsTrigger>
            <TabsTrigger value="requests">
              <FileText className="w-4 h-4 mr-2" />
              Solicitações
            </TabsTrigger>
            <TabsTrigger value="movements">
              <ArrowUpDown className="w-4 h-4 mr-2" />
              Movimentações
            </TabsTrigger>
          </TabsList>

          {/* Tab: Inventário Oficina */}
          <TabsContent value="workshop" className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex gap-4 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Buscar por nome, código ou fornecedor..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <select
                    className="border rounded-md px-3 py-2 text-sm"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <InventoryTable
                  inventory={getFilteredInventory('workshop')}
                  onEdit={handleEditItem}
                  onAddMovement={handleAddMovement}
                  onRefresh={loadData}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Inventário Empresa */}
          <TabsContent value="office" className="space-y-4">
             <Card>
              <CardContent className="p-4">
                <div className="flex gap-4 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Buscar por nome, código ou fornecedor..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <select
                    className="border rounded-md px-3 py-2 text-sm"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <InventoryTable
                  inventory={getFilteredInventory('office')}
                  onEdit={handleEditItem}
                  onAddMovement={handleAddMovement}
                  onRefresh={loadData}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Solicitações */}
          <TabsContent value="requests" className="space-y-4">
             <InventoryRequestsTable 
                requests={requests}
                onApprove={handleRequestApprove}
                onReject={handleRequestReject}
                userRole={user?.role || ''}
             />
          </TabsContent>

          <TabsContent value="movements">
            <MovementsTable movements={movements} />
          </TabsContent>
        </Tabs>
      </div>

      <InventoryItemDialog
        open={itemDialogOpen}
        onOpenChange={setItemDialogOpen}
        item={selectedItem}
        onSuccess={loadData}
      />

      <MovementDialog
        open={movementDialogOpen}
        onOpenChange={setMovementDialogOpen}
        item={selectedItem}
        inventory={inventory}
        onSuccess={loadData}
      />

      <RequestItemDialog
        open={requestDialogOpen}
        onOpenChange={setRequestDialogOpen}
        onSuccess={loadData}
        preselectedItem={selectedItem}
      />
    </Layout>
  );
};

export default Inventory;
