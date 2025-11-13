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
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { MovementsTable } from "@/components/inventory/MovementsTable";
import { StatCard } from "@/components/StatCard";

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
  created_at: string;
  updated_at: string;
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
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [movementDialogOpen, setMovementDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Carregar inventário
      const { data: invData, error: invError } = await supabase
        .from('workshop_inventory')
        .select('*')
        .order('part_name');

      if (invError) throw invError;
      setInventory(invData || []);

      // Carregar movimentações
      const { data: movData, error: movError } = await supabase
        .from('inventory_movements')
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
      setMovements(movData || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados do estoque');
    } finally {
      setLoading(false);
    }
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = 
      item.part_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.part_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.supplier || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

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
              Controle de peças, produtos de lavajato e movimentações
            </p>
          </div>
          <div className="flex gap-2">
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

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="Total de Itens"
            value={totalItems.toString()}
            icon={Package}
          />
          <StatCard
            title="Valor Total"
            value={`R$ ${totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            icon={TrendingUp}
          />
          <StatCard
            title="Estoque Baixo"
            value={lowStockItems.length.toString()}
            icon={AlertTriangle}
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

        <Tabs defaultValue="inventory" className="space-y-6">
          <TabsList>
            <TabsTrigger value="inventory">
              <Package className="w-4 h-4 mr-2" />
              Inventário
            </TabsTrigger>
            <TabsTrigger value="movements">
              <ArrowUpDown className="w-4 h-4 mr-2" />
              Movimentações
            </TabsTrigger>
            <TabsTrigger value="carwash">
              <SprayCan className="w-4 h-4 mr-2" />
              Lavajato
            </TabsTrigger>
          </TabsList>

          {/* Tab: Inventário */}
          <TabsContent value="inventory" className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex gap-4">
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
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>

            <InventoryTable
              inventory={filteredInventory}
              onEdit={handleEditItem}
              onAddMovement={handleAddMovement}
              onRefresh={loadData}
            />
          </TabsContent>

          {/* Tab: Movimentações */}
          <TabsContent value="movements" className="space-y-4">
            <MovementsTable movements={movements} />
          </TabsContent>

          {/* Tab: Lavajato */}
          <TabsContent value="carwash" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Produtos Químicos */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Droplet className="w-5 h-5" />
                    Produtos Químicos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {inventory
                      .filter(item => item.category === 'Lavajato - Químicos')
                      .map(item => (
                        <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{item.part_name}</p>
                            <p className="text-xs text-muted-foreground">{item.part_code}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant={
                              item.quantity <= item.critical_stock ? 'destructive' :
                              item.quantity <= item.minimum_stock ? 'outline' :
                              'secondary'
                            }>
                              {item.quantity} un.
                            </Badge>
                            <Button size="sm" variant="ghost" onClick={() => handleAddMovement(item)}>
                              <ArrowUpDown className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              {/* Consumíveis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Consumíveis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {inventory
                      .filter(item => item.category === 'Lavajato - Consumíveis')
                      .map(item => (
                        <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{item.part_name}</p>
                            <p className="text-xs text-muted-foreground">{item.part_code}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant={
                              item.quantity <= item.critical_stock ? 'destructive' :
                              item.quantity <= item.minimum_stock ? 'outline' :
                              'secondary'
                            }>
                              {item.quantity} un.
                            </Badge>
                            <Button size="sm" variant="ghost" onClick={() => handleAddMovement(item)}>
                              <ArrowUpDown className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
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
    </Layout>
  );
};

export default Inventory;
