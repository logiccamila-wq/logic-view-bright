import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  MapPin,
  Package,
  TrendingUp,
  Award,
  Clock,
  DollarSign,
  Star,
  Truck,
  Fuel,
  AlertTriangle,
} from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const MACROS = [
  { id: 'INICIO', label: 'Início da Jornada', icon: Clock, color: 'bg-green-500' },
  { id: 'CARREGADO', label: 'Início Carregamento', icon: Truck, color: 'bg-indigo-500' },
  { id: 'PARADA', label: 'Parada/Pernoite (CLT)', icon: Package, color: 'bg-blue-500' },
  { id: 'DESCARREGADO', label: 'Fim Descarga', icon: Truck, color: 'bg-purple-500' },
  { id: 'FIM_JORNADA', label: 'Fim da Jornada (CLT)', icon: Clock, color: 'bg-red-500' },
];

const Driver = () => {
  const { user } = useAuth();
  const [currentMacro, setCurrentMacro] = useState<string | null>(null);
  const [abastecimento, setAbastecimento] = useState({ km: '', litros: '', valor: '' });
  const [macroStatus, setMacroStatus] = useState<Array<{ label: string; time: string; success: boolean }>>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeTrip, setActiveTrip] = useState<any>(null);
  const [activeCTE, setActiveCTE] = useState<any>(null);

  useEffect(() => {
    loadActiveTrip();
    loadMacroHistory();
  }, []);

  useEffect(() => {
    if (activeTrip) {
      loadActiveCTE();
    }
  }, [activeTrip]);

  const loadActiveTrip = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .eq('driver_id', user.id)
      .in('status', ['aprovada', 'em_andamento'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (data) {
      setActiveTrip(data);
    }
  };

  const loadActiveCTE = async () => {
    if (!activeTrip) return;

    const { data, error } = await supabase
      .from('cte')
      .select('*')
      .eq('trip_id', activeTrip.id)
      .in('status', ['emitido', 'autorizado'])
      .single();

    if (data) {
      setActiveCTE(data);
    }
  };

  const loadMacroHistory = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('trip_macros')
      .select('*')
      .eq('driver_id', user.id)
      .order('timestamp', { ascending: false })
      .limit(10);

    if (data) {
      setMacroStatus(data.map(m => ({
        label: MACROS.find(macro => macro.id === m.macro_type)?.label || m.macro_type,
        time: new Date(m.timestamp).toLocaleTimeString('pt-BR'),
        success: true
      })));
    }
  };

  const handleMacroClick = async (macro: typeof MACROS[0]) => {
    if (!user || !activeTrip) {
      toast.error('Nenhuma viagem ativa encontrada');
      return;
    }

    if (errorMessage) setErrorMessage('');
    setCurrentMacro(macro.label);
    
    try {
      const { error } = await supabase
        .from('trip_macros')
        .insert({
          trip_id: activeTrip.id,
          driver_id: user.id,
          macro_type: macro.id,
          timestamp: new Date().toISOString(),
        });

      if (error) throw error;

      toast.success(`${macro.label} registrado com sucesso!`);
      
      setMacroStatus(prev => [...prev, { 
        label: macro.label, 
        time: new Date().toLocaleTimeString('pt-BR'), 
        success: true 
      }]);

      // Atualizar status da viagem se for início ou fim
      if (macro.id === 'INICIO') {
        await supabase
          .from('trips')
          .update({ status: 'em_andamento' })
          .eq('id', activeTrip.id);
        setActiveTrip({ ...activeTrip, status: 'em_andamento' });
      } else if (macro.id === 'FIM_JORNADA') {
        await supabase
          .from('trips')
          .update({ status: 'concluida' })
          .eq('id', activeTrip.id);
        setActiveTrip(null);
      }
    } catch (error: any) {
      console.error('Erro ao registrar macro:', error);
      toast.error('Erro ao registrar macro');
      setErrorMessage('Falha ao registrar macro. Tente novamente.');
    }
  };

  const handleAbastecimentoSubmit = async () => {
    if (!user) return;
    
    if (!abastecimento.km || !abastecimento.litros || !abastecimento.valor) {
      setErrorMessage('Preencha todos os campos do abastecimento.');
      toast.error('Preencha todos os campos');
      return;
    }
    
    if (errorMessage) setErrorMessage('');
    
    try {
      const { error } = await supabase
        .from('refuelings')
        .insert({
          trip_id: activeTrip?.id,
          driver_id: user.id,
          vehicle_plate: activeTrip?.vehicle_plate || 'N/A',
          km: parseFloat(abastecimento.km),
          liters: parseFloat(abastecimento.litros),
          total_value: parseFloat(abastecimento.valor),
        });

      if (error) throw error;

      toast.success('Abastecimento registrado! Custo/KM será atualizado.');
      setAbastecimento({ km: '', litros: '', valor: '' });
    } catch (error: any) {
      console.error('Erro ao registrar abastecimento:', error);
      toast.error('Erro ao registrar abastecimento');
      setErrorMessage('Falha ao registrar abastecimento.');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Super App Motorista</h1>
          <p className="text-muted-foreground">Central completa para motoristas</p>
        </div>

        {errorMessage && (
          <Card className="bg-destructive/10 border-destructive">
            <CardContent className="flex items-center gap-2 p-4">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <span className="text-sm text-destructive">{errorMessage}</span>
            </CardContent>
          </Card>
        )}

        {/* Premium Features */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard title="Entregas Hoje" value="12" icon={Package} />
          <StatCard 
            title="Pontuação" 
            value="9.2" 
            icon={Star}
            trend={{ value: "+0.3", positive: true }}
          />
          <StatCard title="Horas" value="8.5h" icon={Clock} />
          <StatCard 
            title="Ganhos" 
            value="R$ 840" 
            icon={DollarSign}
            trend={{ value: "+R$ 120", positive: true }}
          />
        </div>

        {/* Active Delivery */}
        {activeTrip ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                Viagem Ativa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{activeTrip.origin} → {activeTrip.destination}</h3>
                    <p className="text-sm text-muted-foreground">Veículo: {activeTrip.vehicle_plate}</p>
                  </div>
                  <Badge className="bg-green-500/20 text-green-600 hover:bg-green-500/30">
                    {activeTrip.status === 'aprovada' ? 'Aprovada' : 'Em Andamento'}
                  </Badge>
                </div>

                {activeTrip.notes && (
                  <p className="text-sm text-muted-foreground">Obs: {activeTrip.notes}</p>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    <MapPin className="mr-2 w-4 h-4" />
                    Ver Rota
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Nenhuma viagem ativa no momento</p>
            </CardContent>
          </Card>
        )}

        {/* CT-e Information */}
        {activeCTE && (
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Package className="w-5 h-5" />
                CT-e Vinculado ao Transporte
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Número CT-e</p>
                  <p className="font-mono font-semibold">{activeCTE.numero_cte}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant="secondary">{activeCTE.status === 'emitido' ? 'Emitido' : 'Autorizado'}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Remetente</p>
                  <p className="font-semibold text-sm">{activeCTE.remetente_nome}</p>
                  <p className="text-xs text-muted-foreground">{activeCTE.remetente_cidade}/{activeCTE.remetente_uf}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Destinatário</p>
                  <p className="font-semibold text-sm">{activeCTE.destinatario_nome}</p>
                  <p className="text-xs text-muted-foreground">{activeCTE.destinatario_cidade}/{activeCTE.destinatario_uf}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Produto</p>
                  <p className="font-semibold text-sm">{activeCTE.produto_predominante}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Peso Bruto</p>
                  <p className="font-semibold text-sm">{activeCTE.peso_bruto} kg</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Quantidade Volumes</p>
                  <p className="font-semibold text-sm">{activeCTE.quantidade_volumes}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Valor Total</p>
                  <p className="font-semibold text-green-600">
                    R$ {activeCTE.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                {activeCTE.observacoes && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Observações</p>
                    <p className="text-sm">{activeCTE.observacoes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Macros de Jornada */}
        <Card>
          <CardHeader>
            <CardTitle>Macros de Viagem (Flow de Atividades)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
              {MACROS.map(macro => (
                <Button
                  key={macro.id}
                  onClick={() => handleMacroClick(macro)}
                  disabled={!activeTrip}
                  className={`${macro.color} text-white hover:opacity-80 h-auto py-4 flex flex-col gap-2`}
                  variant="secondary"
                >
                  <macro.icon className="w-5 h-5" />
                  <span className="text-xs font-medium text-center">{macro.label}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Lançamento de Abastecimento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Fuel className="w-5 h-5" />
              Lançar Abastecimento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Input
                type="number"
                placeholder="KM Atual (Obrigatório)"
                value={abastecimento.km}
                onChange={e => setAbastecimento({ ...abastecimento, km: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Litros Abastecidos"
                value={abastecimento.litros}
                onChange={e => setAbastecimento({ ...abastecimento, litros: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Valor Total Gasto (R$)"
                value={abastecimento.valor}
                onChange={e => setAbastecimento({ ...abastecimento, valor: e.target.value })}
              />
              <Button onClick={handleAbastecimentoSubmit} className="w-full">
                Registrar Abastecimento
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Performance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Entregas no Prazo</span>
                  <span className="text-lg font-semibold text-green-600">96%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Avaliação Média</span>
                  <span className="text-lg font-semibold">4.8 ⭐</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Km Rodados</span>
                  <span className="text-lg font-semibold">12.4k km</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                Conquistas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                    🏆
                  </div>
                  <div>
                    <p className="font-semibold">Motorista do Mês</p>
                    <p className="text-xs text-muted-foreground">Outubro 2024</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                    ⚡
                  </div>
                  <div>
                    <p className="font-semibold">100 Entregas</p>
                    <p className="text-xs text-muted-foreground">Sem atrasos</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    🌟
                  </div>
                  <div>
                    <p className="font-semibold">5 Estrelas</p>
                    <p className="text-xs text-muted-foreground">10 avaliações</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Histórico de Macros */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Macros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {macroStatus.length > 0 ? (
                macroStatus.map((status, index) => (
                  <div key={index} className="flex justify-between items-center bg-muted p-3 rounded-lg text-sm">
                    <span className="font-medium">{status.label}</span>
                    <span className="text-xs text-muted-foreground">{status.time}</span>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground text-sm">Nenhuma macro registrada.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Earnings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Ganhos do Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-2xl font-bold text-green-600">R$ 8.420</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
              <div>
                <p className="text-2xl font-bold">R$ 7.200</p>
                <p className="text-sm text-muted-foreground">Base</p>
              </div>
              <div>
                <p className="text-2xl font-bold">R$ 820</p>
                <p className="text-sm text-muted-foreground">Bônus</p>
              </div>
              <div>
                <p className="text-2xl font-bold">R$ 400</p>
                <p className="text-sm text-muted-foreground">Extras</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Driver;
