import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Circle, Plus, Package, ArrowRightLeft, AlertCircle, Map } from 'lucide-react';
import { TirePlanner } from './TirePlanner';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Pneu {
  id: string;
  codigo: string;
  marca: string;
  modelo: string;
  medida: string;
  tipo: string;
  status: string;
  vehicle_plate?: string;
  posicao?: string;
  km_instalacao?: number;
  km_atual?: number;
  vida_util_km: number;
  profundidade_sulco?: number;
  pressao_recomendada?: number;
  created_at: string;
}

interface MovimentacaoPneu {
  id: string;
  pneu_id: string;
  tipo_movimentacao: string;
  vehicle_plate_origem?: string;
  vehicle_plate_destino?: string;
  posicao_origem?: string;
  posicao_destino?: string;
  km_veiculo?: number;
  motivo: string;
  created_at: string;
}

const POSICOES = [
  { value: 'dianteiro_esquerdo', label: 'Dianteiro Esquerdo' },
  { value: 'dianteiro_direito', label: 'Dianteiro Direito' },
  { value: 'traseiro_esquerdo_externo', label: 'Traseiro Esq. Externo' },
  { value: 'traseiro_esquerdo_interno', label: 'Traseiro Esq. Interno' },
  { value: 'traseiro_direito_externo', label: 'Traseiro Dir. Externo' },
  { value: 'traseiro_direito_interno', label: 'Traseiro Dir. Interno' },
  { value: 'step', label: 'Step' },
  { value: 'estepe', label: 'Estepe' },
];

export function BorachariaTab() {
  const { user } = useAuth();
  const [pneus, setPneus] = useState<Pneu[]>([]);
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoPneu[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPneuDialogOpen, setIsPneuDialogOpen] = useState(false);
  const [isMovimentacaoDialogOpen, setIsMovimentacaoDialogOpen] = useState(false);

  const [pneuFormData, setpneuFormData] = useState({
    codigo: '',
    marca: '',
    modelo: '',
    medida: '',
    tipo: 'novo',
    pressao_recomendada: '',
    fornecedor: '',
    valor_compra: '',
  });

  const [movimentacaoFormData, setMovimentacaoFormData] = useState({
    pneu_id: '',
    tipo_movimentacao: 'instalacao',
    vehicle_plate_destino: '',
    posicao_destino: '',
    km_veiculo: '',
    motivo: '',
    observacoes: '',
  });

  const fetchPneus = async () => {
    try {
      const { data, error } = await supabase
        .from('pneus' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPneus((data as any) || []);
    } catch (error) {
      console.error('Erro ao buscar pneus:', error);
      toast.error('Erro ao carregar pneus');
    } finally {
      setLoading(false);
    }
  };

  const fetchMovimentacoes = async () => {
    try {
      const { data, error } = await supabase
        .from('movimentacao_pneus' as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setMovimentacoes((data as any) || []);
    } catch (error) {
      console.error('Erro ao buscar movimentações:', error);
    }
  };

  useEffect(() => {
    fetchPneus();
    fetchMovimentacoes();

    const pneusChannel = supabase
      .channel('pneus_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pneus' }, () => {
        fetchPneus();
      })
      .subscribe();

    const movChannel = supabase
      .channel('movimentacao_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'movimentacao_pneus' }, () => {
        fetchMovimentacoes();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(pneusChannel);
      supabase.removeChannel(movChannel);
    };
  }, []);

  const handleCreatePneu = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase.from('pneus' as any).insert({
        ...pneuFormData,
        pressao_recomendada: pneuFormData.pressao_recomendada ? parseFloat(pneuFormData.pressao_recomendada) : null,
        valor_compra: pneuFormData.valor_compra ? parseFloat(pneuFormData.valor_compra) : null,
        data_compra: new Date().toISOString(),
      } as any);

      if (error) throw error;

      toast.success('Pneu cadastrado com sucesso');
      setIsPneuDialogOpen(false);
      setpneuFormData({
        codigo: '',
        marca: '',
        modelo: '',
        medida: '',
        tipo: 'novo',
        pressao_recomendada: '',
        fornecedor: '',
        valor_compra: '',
      });
    } catch (error) {
      console.error('Erro ao cadastrar pneu:', error);
      toast.error('Erro ao cadastrar pneu');
    }
  };

  const handleCreateMovimentacao = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase.from('movimentacao_pneus' as any).insert({
        ...movimentacaoFormData,
        km_veiculo: movimentacaoFormData.km_veiculo ? parseInt(movimentacaoFormData.km_veiculo) : null,
        responsavel_id: user?.id,
      } as any);

      if (error) throw error;

      // Atualizar status do pneu
      if (movimentacaoFormData.tipo_movimentacao === 'instalacao') {
        await supabase
          .from('pneus' as any)
          .update({
            status: 'em_uso',
            vehicle_plate: movimentacaoFormData.vehicle_plate_destino,
            posicao: movimentacaoFormData.posicao_destino,
            km_instalacao: parseInt(movimentacaoFormData.km_veiculo),
          } as any)
          .eq('id', movimentacaoFormData.pneu_id);
      }

      toast.success('Movimentação registrada com sucesso');
      setIsMovimentacaoDialogOpen(false);
      setMovimentacaoFormData({
        pneu_id: '',
        tipo_movimentacao: 'instalacao',
        vehicle_plate_destino: '',
        posicao_destino: '',
        km_veiculo: '',
        motivo: '',
        observacoes: '',
      });
    } catch (error) {
      console.error('Erro ao registrar movimentação:', error);
      toast.error('Erro ao registrar movimentação');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      estoque: 'default',
      em_uso: 'secondary',
      manutencao: 'secondary',
      descarte: 'destructive',
      recapagem: 'default',
    };
    return colors[status] || 'default';
  };

  const getPneuNome = (pneuId: string) => {
    const pneu = pneus.find(p => p.id === pneuId);
    return pneu ? `${pneu.codigo} - ${pneu.marca}` : 'Desconhecido';
  };

  if (loading) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Borracharia</h2>
          <p className="text-muted-foreground">Gestão completa de pneus da frota</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isPneuDialogOpen} onOpenChange={setIsPneuDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo Pneu
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Cadastrar Novo Pneu</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreatePneu} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="codigo">Código/Número</Label>
                    <Input
                      id="codigo"
                      value={pneuFormData.codigo}
                      onChange={(e) => setpneuFormData({ ...pneuFormData, codigo: e.target.value })}
                      placeholder="PN-001"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tipo">Tipo</Label>
                    <Select
                      value={pneuFormData.tipo}
                      onValueChange={(value) => setpneuFormData({ ...pneuFormData, tipo: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="novo">Novo</SelectItem>
                        <SelectItem value="recapado">Recapado</SelectItem>
                        <SelectItem value="usado">Usado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="marca">Marca</Label>
                    <Input
                      id="marca"
                      value={pneuFormData.marca}
                      onChange={(e) => setpneuFormData({ ...pneuFormData, marca: e.target.value })}
                      placeholder="Pirelli"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="modelo">Modelo</Label>
                    <Input
                      id="modelo"
                      value={pneuFormData.modelo}
                      onChange={(e) => setpneuFormData({ ...pneuFormData, modelo: e.target.value })}
                      placeholder="FH01"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="medida">Medida</Label>
                    <Input
                      id="medida"
                      value={pneuFormData.medida}
                      onChange={(e) => setpneuFormData({ ...pneuFormData, medida: e.target.value })}
                      placeholder="295/80R22.5"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pressao_recomendada">Pressão (PSI)</Label>
                    <Input
                      id="pressao_recomendada"
                      type="number"
                      step="0.1"
                      value={pneuFormData.pressao_recomendada}
                      onChange={(e) => setpneuFormData({ ...pneuFormData, pressao_recomendada: e.target.value })}
                      placeholder="120"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fornecedor">Fornecedor</Label>
                    <Input
                      id="fornecedor"
                      value={pneuFormData.fornecedor}
                      onChange={(e) => setpneuFormData({ ...pneuFormData, fornecedor: e.target.value })}
                      placeholder="Loja ABC"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="valor_compra">Valor (R$)</Label>
                    <Input
                      id="valor_compra"
                      type="number"
                      step="0.01"
                      value={pneuFormData.valor_compra}
                      onChange={(e) => setpneuFormData({ ...pneuFormData, valor_compra: e.target.value })}
                      placeholder="1500.00"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsPneuDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">Cadastrar</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isMovimentacaoDialogOpen} onOpenChange={setIsMovimentacaoDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <ArrowRightLeft className="mr-2 h-4 w-4" />
                Movimentar
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Registrar Movimentação de Pneu</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateMovimentacao} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pneu_id">Pneu</Label>
                    <Select
                      value={movimentacaoFormData.pneu_id}
                      onValueChange={(value) => setMovimentacaoFormData({ ...movimentacaoFormData, pneu_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um pneu" />
                      </SelectTrigger>
                      <SelectContent>
                        {pneus.filter(p => p.status === 'estoque').map(pneu => (
                          <SelectItem key={pneu.id} value={pneu.id}>
                            {pneu.codigo} - {pneu.marca} {pneu.modelo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tipo_movimentacao">Tipo</Label>
                    <Select
                      value={movimentacaoFormData.tipo_movimentacao}
                      onValueChange={(value) => setMovimentacaoFormData({ ...movimentacaoFormData, tipo_movimentacao: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="instalacao">Instalação</SelectItem>
                        <SelectItem value="remocao">Remoção</SelectItem>
                        <SelectItem value="rodizio">Rodízio</SelectItem>
                        <SelectItem value="recapagem">Recapagem</SelectItem>
                        <SelectItem value="conserto">Conserto</SelectItem>
                        <SelectItem value="descarte">Descarte</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vehicle_plate_destino">Placa Veículo</Label>
                    <Input
                      id="vehicle_plate_destino"
                      value={movimentacaoFormData.vehicle_plate_destino}
                      onChange={(e) => setMovimentacaoFormData({ ...movimentacaoFormData, vehicle_plate_destino: e.target.value.toUpperCase() })}
                      placeholder="ABC-1234"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="posicao_destino">Posição</Label>
                    <Select
                      value={movimentacaoFormData.posicao_destino}
                      onValueChange={(value) => setMovimentacaoFormData({ ...movimentacaoFormData, posicao_destino: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {POSICOES.map(pos => (
                          <SelectItem key={pos.value} value={pos.value}>
                            {pos.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="km_veiculo">KM Veículo</Label>
                    <Input
                      id="km_veiculo"
                      type="number"
                      value={movimentacaoFormData.km_veiculo}
                      onChange={(e) => setMovimentacaoFormData({ ...movimentacaoFormData, km_veiculo: e.target.value })}
                      placeholder="120000"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="motivo">Motivo</Label>
                  <Input
                    id="motivo"
                    value={movimentacaoFormData.motivo}
                    onChange={(e) => setMovimentacaoFormData({ ...movimentacaoFormData, motivo: e.target.value })}
                    placeholder="Desgaste, furo, manutenção preventiva..."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    value={movimentacaoFormData.observacoes}
                    onChange={(e) => setMovimentacaoFormData({ ...movimentacaoFormData, observacoes: e.target.value })}
                    placeholder="Informações adicionais..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsMovimentacaoDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">Registrar</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="pneus" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pneus">Pneus</TabsTrigger>
          <TabsTrigger value="movimentacoes">Movimentações</TabsTrigger>
          <TabsTrigger value="planner" className="flex items-center gap-2"><Map className="h-4 w-4" /> Mapa de Pneus</TabsTrigger>
        </TabsList>

        <TabsContent value="pneus" className="space-y-4">
          {pneus.length === 0 ? (
            <Card className="p-8 text-center">
              <Circle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Nenhum pneu cadastrado</h3>
              <p className="text-muted-foreground">Cadastre o primeiro pneu para começar.</p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {pneus.map((pneu) => (
                <Card key={pneu.id} className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <Circle className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{pneu.codigo}</h3>
                        <p className="text-sm text-muted-foreground">
                          {pneu.marca} {pneu.modelo} • {pneu.medida}
                        </p>
                      </div>
                    </div>
                    <Badge variant={getStatusColor(pneu.status) as any}>
                      {pneu.status.replace('_', ' ')}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Tipo:</span>
                      <p className="font-semibold">{pneu.tipo}</p>
                    </div>
                    {pneu.vehicle_plate && (
                      <>
                        <div>
                          <span className="text-muted-foreground">Veículo:</span>
                          <p className="font-semibold">{pneu.vehicle_plate}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Posição:</span>
                          <p className="font-semibold">{pneu.posicao?.replace('_', ' ')}</p>
                        </div>
                      </>
                    )}
                    {pneu.km_atual && (
                      <div>
                        <span className="text-muted-foreground">KM Rodado:</span>
                        <p className="font-semibold">{((pneu.km_atual - (pneu.km_instalacao || 0))).toLocaleString()} km</p>
                      </div>
                    )}
                  </div>

                  {pneu.km_atual && pneu.vida_util_km && (
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Vida útil</span>
                        <span>{Math.round(((pneu.km_atual - (pneu.km_instalacao || 0)) / pneu.vida_util_km) * 100)}%</span>
                      </div>
                      <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-primary h-full transition-all"
                          style={{
                            width: `${Math.min(((pneu.km_atual - (pneu.km_instalacao || 0)) / pneu.vida_util_km) * 100, 100)}%`
                          }}
                        />
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="movimentacoes" className="space-y-4">
          {movimentacoes.length === 0 ? (
            <Card className="p-8 text-center">
              <ArrowRightLeft className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma movimentação registrada</h3>
              <p className="text-muted-foreground">Registre a primeira movimentação de pneu.</p>
            </Card>
          ) : (
            movimentacoes.map((mov) => (
              <Card key={mov.id} className="p-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                    <ArrowRightLeft className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold">{getPneuNome(mov.pneu_id)}</h4>
                        <p className="text-sm text-muted-foreground">
                          {mov.tipo_movimentacao.replace('_', ' ')} • {mov.motivo}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(mov.created_at), { addSuffix: true, locale: ptBR })}
                      </span>
                    </div>
                    {mov.vehicle_plate_destino && (
                      <p className="text-sm">
                        <strong>Veículo:</strong> {mov.vehicle_plate_destino} • <strong>Posição:</strong> {mov.posicao_destino?.replace('_', ' ')}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="planner" className="space-y-4">
          <TirePlanner />
        </TabsContent>
      </Tabs>
    </div>
  );
}
