import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Package, AlertTriangle, Search } from 'lucide-react';
import { toast } from 'sonner';

interface InventoryItem {
  id: string;
  part_code: string;
  part_name: string;
  category: string;
  quantity: number;
  minimum_stock: number;
  unit_price?: number;
  supplier?: string;
  location?: string;
}

export function WorkshopTab() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchInventory = async () => {
    try {
      const { data, error } = await supabase
        .from('workshop_inventory')
        .select('*')
        .order('part_name');

      if (error) throw error;
      setInventory(data || []);
      setFilteredInventory(data || []);
    } catch (error) {
      console.error('Erro ao buscar inventário:', error);
      toast.error('Erro ao carregar inventário');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = inventory.filter(item =>
        item.part_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.part_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredInventory(filtered);
    } else {
      setFilteredInventory(inventory);
    }
  }, [searchTerm, inventory]);

  const lowStockItems = inventory.filter(item => item.quantity <= item.minimum_stock);
  const totalItems = inventory.reduce((acc, item) => acc + item.quantity, 0);
  const totalValue = inventory.reduce((acc, item) => acc + (item.quantity * (item.unit_price || 0)), 0);

  if (loading) {
    return <div className="flex items-center justify-center p-8">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Inventário da Oficina</h2>
        <p className="text-muted-foreground">Controle de peças e materiais</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total de Itens</p>
              <p className="text-2xl font-bold">{totalItems}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-500/10 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Estoque Baixo</p>
              <p className="text-2xl font-bold">{lowStockItems.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <Package className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Valor Total</p>
              <p className="text-2xl font-bold">
                R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, código ou categoria..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {lowStockItems.length > 0 && (
        <Card className="p-4 bg-yellow-50 border-yellow-200">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <h3 className="font-semibold text-yellow-900">Itens com Estoque Baixo</h3>
          </div>
          <div className="space-y-2">
            {lowStockItems.map(item => (
              <div key={item.id} className="text-sm text-yellow-800">
                {item.part_name} - Estoque: {item.quantity} (Mínimo: {item.minimum_stock})
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid gap-4">
        {filteredInventory.map((item) => (
          <Card key={item.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-bold text-lg">{item.part_name}</h3>
                  <Badge variant="outline">{item.category}</Badge>
                  {item.quantity <= item.minimum_stock && (
                    <Badge variant="destructive">Estoque Baixo</Badge>
                  )}
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Código</p>
                    <p className="font-medium">{item.part_code}</p>
                  </div>
                  
                  <div>
                    <p className="text-muted-foreground">Quantidade</p>
                    <p className="font-medium">{item.quantity} unidades</p>
                  </div>
                  
                  {item.unit_price && (
                    <div>
                      <p className="text-muted-foreground">Preço Unitário</p>
                      <p className="font-medium">
                        R$ {item.unit_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  )}
                  
                  {item.location && (
                    <div>
                      <p className="text-muted-foreground">Localização</p>
                      <p className="font-medium">{item.location}</p>
                    </div>
                  )}
                </div>

                {item.supplier && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Fornecedor: {item.supplier}
                  </p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredInventory.length === 0 && (
        <Card className="p-12 text-center">
          <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">
            {searchTerm ? 'Nenhum item encontrado com os critérios de busca' : 'Nenhum item no inventário'}
          </p>
        </Card>
      )}
    </div>
  );
}