import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, AlertTriangle, Info, MessageSquare, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const DriverAlerts = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    loadAlerts();
  }, [user]);

  const loadAlerts = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);

    if (data) {
      setAlerts(data);
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getAlertVariant = (type: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (type) {
      case 'warning':
        return 'destructive';
      case 'info':
        return 'default';
      case 'success':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Alertas e Mensagens
          </CardTitle>
          {alerts.filter(a => !a.read).length > 0 && (
            <Badge variant="destructive" className="animate-pulse">
              {alerts.filter(a => !a.read).length} novo(s)
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.length > 0 ? (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-3 rounded-lg border transition-colors ${
                !alert.read 
                  ? 'bg-primary/10 border-primary/20' 
                  : 'bg-muted/50 border-muted'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {getAlertIcon(alert.type)}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">{alert.title}</p>
                    <Badge variant={getAlertVariant(alert.type)} className="text-xs">
                      {alert.module || 'Sistema'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{alert.message}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(alert.created_at).toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Nenhum alerta no momento</p>
            <p className="text-sm mt-1">Você está em dia!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
