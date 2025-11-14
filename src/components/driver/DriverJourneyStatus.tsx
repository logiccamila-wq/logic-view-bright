import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, PlayCircle, StopCircle, Coffee } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const DriverJourneyStatus = () => {
  const { user } = useAuth();
  const [activeSession, setActiveSession] = useState<any>(null);
  const [currentEvent, setCurrentEvent] = useState<any>(null);

  useEffect(() => {
    loadActiveSession();
  }, [user]);

  const loadActiveSession = async () => {
    if (!user) return;

    const { data: session } = await supabase
      .from('driver_work_sessions')
      .select('*')
      .eq('driver_id', user.id)
      .eq('status', 'ativa')
      .single();

    if (session) {
      setActiveSession(session);
      
      const { data: event } = await supabase
        .from('driver_work_events')
        .select('*')
        .eq('session_id', session.id)
        .is('data_hora_fim', null)
        .single();
        
      setCurrentEvent(event);
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getActivityLabel = (type: string) => {
    const labels: Record<string, string> = {
      direcao: 'Direção',
      descanso: 'Descanso',
      refeicao: 'Refeição',
      espera: 'Espera'
    };
    return labels[type] || type;
  };

  const getActivityIcon = (type: string) => {
    if (type === 'direcao') return <PlayCircle className="h-4 w-4" />;
    if (type === 'descanso') return <StopCircle className="h-4 w-4" />;
    return <Coffee className="h-4 w-4" />;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Status da Jornada
          </CardTitle>
          {activeSession && (
            <Badge variant={activeSession.status === 'ativa' ? 'default' : 'secondary'}>
              {activeSession.status === 'ativa' ? 'Ativa' : 'Finalizada'}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeSession ? (
          <>
            {currentEvent && (
              <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg">
                {getActivityIcon(currentEvent.tipo_atividade)}
                <div className="flex-1">
                  <p className="font-medium">Atividade Atual</p>
                  <p className="text-sm text-muted-foreground">
                    {getActivityLabel(currentEvent.tipo_atividade)}
                  </p>
                </div>
                <Badge variant="outline">Em andamento</Badge>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Direção</p>
                <p className="text-lg font-bold">
                  {formatTime(activeSession.total_direcao_minutos || 0)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Descanso</p>
                <p className="text-lg font-bold">
                  {formatTime(activeSession.total_descanso_minutos || 0)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Espera</p>
                <p className="text-lg font-bold">
                  {formatTime(activeSession.total_espera_minutos || 0)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Trabalhado</p>
                <p className="text-lg font-bold">
                  {formatTime(activeSession.total_trabalho_minutos || 0)}
                </p>
              </div>
            </div>

            {activeSession.total_trabalho_minutos > 660 && (
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-sm text-yellow-600 dark:text-yellow-400">
                  ⚠️ Atenção: Próximo ao limite diário de 11h
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Nenhuma jornada ativa no momento</p>
            <p className="text-sm mt-1">Inicie uma nova jornada para começar</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
