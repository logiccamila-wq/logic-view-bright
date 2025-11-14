import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Play,
  Square,
  Coffee,
  Utensils,
  Clock,
  AlertTriangle,
  CheckCircle,
  Truck,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { VehicleChangeDialog } from "./VehicleChangeDialog";

interface WorkSession {
  id: string;
  status: string;
  data_inicio: string;
  vehicle_plate: string;
  total_direcao_minutos: number;
  total_trabalho_minutos: number;
  total_espera_minutos: number;
  total_descanso_minutos: number;
  horas_extras_minutos: number;
}

interface WorkEvent {
  id: string;
  tipo_atividade: string;
  data_hora_inicio: string;
  data_hora_fim: string | null;
}

const ATIVIDADES = [
  { id: "direcao", label: "Direção", icon: Play, color: "bg-blue-500" },
  { id: "descanso", label: "Descanso", icon: Coffee, color: "bg-green-500" },
  { id: "refeicao", label: "Refeição", icon: Utensils, color: "bg-orange-500" },
  { id: "espera", label: "Espera", icon: Clock, color: "bg-yellow-500" },
  { id: "trabalho", label: "Trabalho", icon: CheckCircle, color: "bg-purple-500" },
];

export function WorkSessionPanel() {
  const { user } = useAuth();
  const [currentSession, setCurrentSession] = useState<WorkSession | null>(null);
  const [currentEvent, setCurrentEvent] = useState<WorkEvent | null>(null);
  const [observacoes, setObservacoes] = useState("");
  const [loading, setLoading] = useState(false);
  const [vehicleChangeDialogOpen, setVehicleChangeDialogOpen] = useState(false);

  useEffect(() => {
    loadActiveSession();
  }, [user]);

  const loadActiveSession = async () => {
    if (!user) return;

    const { data: session } = await (supabase as any)
      .from("driver_work_sessions")
      .select("*")
      .eq("driver_id", user.id)
      .eq("status", "em_andamento")
      .order("data_inicio", { ascending: false })
      .limit(1)
      .maybeSingle();

    setCurrentSession(session);

    if (session) {
      // Buscar evento atual (não finalizado)
      const { data: event } = await (supabase as any)
        .from("driver_work_events")
        .select("*")
        .eq("session_id", session.id)
        .is("data_hora_fim", null)
        .order("data_hora_inicio", { ascending: false })
        .limit(1)
        .maybeSingle();

      setCurrentEvent(event);
    }
  };

  const iniciarJornada = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Buscar viagem ativa do motorista
      const { data: trip } = await supabase
        .from("trips")
        .select("id, vehicle_plate")
        .eq("driver_id", user.id)
        .eq("status", "em_andamento")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!trip) {
        toast.error("Nenhuma viagem ativa encontrada");
        setLoading(false);
        return;
      }

      const { data: session, error } = await (supabase as any)
        .from("driver_work_sessions")
        .insert({
          driver_id: user.id,
          vehicle_plate: trip.vehicle_plate,
          trip_id: trip.id,
          data_inicio: new Date().toISOString(),
          status: "em_andamento",
        })
        .select()
        .single();

      if (error) throw error;

      setCurrentSession(session);
      toast.success("Jornada iniciada!");
    } catch (error) {
      console.error("Erro ao iniciar jornada:", error);
      toast.error("Erro ao iniciar jornada");
    } finally {
      setLoading(false);
    }
  };

  const finalizarJornada = async () => {
    if (!currentSession) return;

    setLoading(true);
    try {
      // Finalizar evento atual se houver
      if (currentEvent) {
        await finalizarEvento();
      }

      const { error } = await (supabase as any)
        .from("driver_work_sessions")
        .update({
          status: "concluida",
          data_fim: new Date().toISOString(),
        })
        .eq("id", currentSession.id);

      if (error) throw error;

      // Chamar função de análise
      await supabase.functions.invoke("analyze-driver-journey", {
        body: { sessionId: currentSession.id },
      });

      setCurrentSession(null);
      setCurrentEvent(null);
      toast.success("Jornada finalizada e analisada!");
    } catch (error) {
      console.error("Erro ao finalizar jornada:", error);
      toast.error("Erro ao finalizar jornada");
    } finally {
      setLoading(false);
    }
  };

  const iniciarAtividade = async (tipoAtividade: "direcao" | "descanso" | "refeicao" | "espera" | "trabalho" | "intervalo") => {
    if (!currentSession) return;

    setLoading(true);
    try {
      // Finalizar evento anterior se houver
      if (currentEvent) {
        await finalizarEvento();
      }

      const { data: event, error } = await (supabase as any)
        .from("driver_work_events")
        .insert([{
          session_id: currentSession.id,
          driver_id: user!.id,
          tipo_atividade: tipoAtividade,
          data_hora_inicio: new Date().toISOString(),
          observacoes,
        }])
        .select()
        .single();

      if (error) throw error;

      setCurrentEvent(event);
      setObservacoes("");
      toast.success(`${ATIVIDADES.find(a => a.id === tipoAtividade)?.label} iniciada`);
    } catch (error) {
      console.error("Erro ao iniciar atividade:", error);
      toast.error("Erro ao iniciar atividade");
    } finally {
      setLoading(false);
    }
  };

  const finalizarEvento = async () => {
    if (!currentEvent) return;

    const agora = new Date();
    const inicio = new Date(currentEvent.data_hora_inicio);
    const duracaoMinutos = Math.round((agora.getTime() - inicio.getTime()) / (1000 * 60));

    const { error } = await (supabase as any)
      .from("driver_work_events")
      .update({
        data_hora_fim: agora.toISOString(),
        duracao_minutos: duracaoMinutos,
      })
      .eq("id", currentEvent.id);

    if (error) throw error;

    // Atualizar totais da sessão
    const tipoAtividade = currentEvent.tipo_atividade;
    const updateData: any = {};

    if (tipoAtividade === "direcao") {
      updateData.total_direcao_minutos = (currentSession?.total_direcao_minutos || 0) + duracaoMinutos;
      updateData.total_trabalho_minutos = (currentSession?.total_trabalho_minutos || 0) + duracaoMinutos;
    } else if (tipoAtividade === "espera" || tipoAtividade === "trabalho") {
      if (tipoAtividade === "espera") {
        updateData.total_espera_minutos = (currentSession?.total_espera_minutos || 0) + duracaoMinutos;
      }
      updateData.total_trabalho_minutos = (currentSession?.total_trabalho_minutos || 0) + duracaoMinutos;
    } else if (tipoAtividade === "descanso") {
      updateData.total_descanso_minutos = (currentSession?.total_descanso_minutos || 0) + duracaoMinutos;
    }

    await (supabase as any)
      .from("driver_work_sessions")
      .update(updateData)
      .eq("id", currentSession!.id);

    setCurrentEvent(null);
  };

  const formatarTempo = (minutos: number) => {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return `${horas}h${mins.toString().padStart(2, "0")}min`;
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">Controle de Jornada (Lei 13.103/2015)</h2>

      {!currentSession ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">
            Nenhuma jornada em andamento
          </p>
          <Button onClick={iniciarJornada} disabled={loading} size="lg">
            <Play className="mr-2 h-5 w-5" />
            Iniciar Jornada
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Status Atual */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Tempo Trabalhado</p>
              <p className="text-2xl font-bold">
                {formatarTempo(currentSession.total_trabalho_minutos)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tempo Direção</p>
              <p className="text-2xl font-bold">
                {formatarTempo(currentSession.total_direcao_minutos)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Horas Extras</p>
              <p className="text-2xl font-bold text-orange-500">
                {formatarTempo(currentSession.horas_extras_minutos)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Limite Diário</p>
              <p className="text-2xl font-bold">
                {currentSession.total_trabalho_minutos > 720 ? (
                  <span className="text-red-500">12h00</span>
                ) : (
                  "12h00"
                )}
              </p>
            </div>
          </div>

          {/* Atividade Atual */}
          {currentEvent && (
            <div className="bg-primary/10 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="animate-pulse">
                    EM ANDAMENTO
                  </Badge>
                  <span className="font-semibold">
                    {ATIVIDADES.find(a => a.id === currentEvent.tipo_atividade)?.label}
                  </span>
                </div>
                <Button
                  onClick={finalizarEvento}
                  variant="outline"
                  size="sm"
                  disabled={loading}
                >
                  <Square className="mr-2 h-4 w-4" />
                  Finalizar
                </Button>
              </div>
            </div>
          )}

          {/* Observações */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Observações (opcional)
            </label>
            <Textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Ex: Carregamento atrasado, condições da estrada, etc."
              rows={2}
            />
          </div>

          {/* Botões de Atividades */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {ATIVIDADES.map((atividade) => {
              const Icon = atividade.icon;
              const isAtual = currentEvent?.tipo_atividade === atividade.id;
              
              return (
                <Button
                  key={atividade.id}
                  onClick={() => iniciarAtividade(atividade.id as any)}
                  disabled={loading || isAtual}
                  variant={isAtual ? "default" : "outline"}
                  className="h-20 flex-col"
                >
                  <Icon className="h-6 w-6 mb-2" />
                  {atividade.label}
                </Button>
              );
            })}
          </div>

          {/* Alertas */}
          {currentSession.total_trabalho_minutos > 660 && (
            <div className="bg-orange-500/10 border border-orange-500 p-4 rounded-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <span className="text-sm">
                Atenção: Você está próximo do limite de 12h diárias
              </span>
            </div>
          )}

          {/* Finalizar Jornada */}
          <div className="flex gap-2">
            <Button
              onClick={finalizarJornada}
              disabled={loading}
              variant="destructive"
              className="flex-1"
              size="lg"
            >
              <Square className="mr-2 h-5 w-5" />
              Finalizar Jornada
            </Button>
            <Button
              onClick={() => setVehicleChangeDialogOpen(true)}
              disabled={loading}
              variant="outline"
              size="lg"
            >
              <Truck className="mr-2 h-5 w-5" />
              Trocar Veículo
            </Button>
          </div>
        </div>
      )}
      
      {currentSession && (
        <VehicleChangeDialog
          open={vehicleChangeDialogOpen}
          onOpenChange={setVehicleChangeDialogOpen}
          currentSessionId={currentSession.id}
          currentVehicle={currentSession.vehicle_plate}
          onVehicleChanged={loadActiveSession}
        />
      )}
    </Card>
  );
}
