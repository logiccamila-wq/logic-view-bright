import { useNotifications } from '@/contexts/NotificationsContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Check, CheckCheck, Trash2, Info, AlertTriangle, AlertCircle, CheckCircle, Bell } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function NotificationPanel() {
  const { notifications, loading, markAsRead, markAllAsRead, deleteNotification } = useNotifications();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Carregando notificações...</div>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <Bell className="h-12 w-12 mb-4 opacity-50" />
        <p>Nenhuma notificação</p>
      </div>
    );
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-500/10 text-green-500';
      case 'warning':
        return 'bg-yellow-500/10 text-yellow-500';
      case 'error':
        return 'bg-red-500/10 text-red-500';
      default:
        return 'bg-blue-500/10 text-blue-500';
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] mt-4">
      <div className="flex gap-2 mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={markAllAsRead}
          className="flex-1"
        >
          <CheckCheck className="h-4 w-4 mr-2" />
          Marcar todas como lidas
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-2">
          {notifications.map((notification, index) => (
            <div key={notification.id}>
              <div
                className={`p-4 rounded-lg border transition-colors ${
                  notification.read 
                    ? 'bg-background/50 border-border/50' 
                    : 'bg-accent/10 border-accent/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{getIcon(notification.type)}</div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="font-semibold text-sm">{notification.title}</h4>
                      {!notification.read && (
                        <Badge variant="secondary" className="h-2 w-2 p-0 rounded-full" />
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2">
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(notification.created_at), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </span>
                        
                        {notification.module && (
                          <Badge variant="outline" className={`text-xs ${getTypeColor(notification.type)}`}>
                            {notification.module.toUpperCase()}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex gap-1">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                            className="h-8 px-2"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNotification(notification.id)}
                          className="h-8 px-2 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {index < notifications.length - 1 && <Separator className="my-2" />}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
