import { useState, useMemo } from 'react';
import { useNotifications } from '@/contexts/NotificationsContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check, CheckCheck, Trash2, Info, AlertTriangle, AlertCircle, CheckCircle, Bell, Filter } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function NotificationPanel() {
  const { notifications, loading, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  
  const [moduleFilter, setModuleFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Get unique modules from notifications
  const availableModules = useMemo(() => {
    const modules = new Set(notifications.map(n => n.module).filter(Boolean));
    return Array.from(modules);
  }, [notifications]);

  // Filter notifications based on selected filters
  const filteredNotifications = useMemo(() => {
    return notifications.filter(notification => {
      const moduleMatch = moduleFilter === 'all' || notification.module === moduleFilter;
      const typeMatch = typeFilter === 'all' || notification.type === typeFilter;
      const statusMatch = statusFilter === 'all' || 
        (statusFilter === 'read' && notification.read) ||
        (statusFilter === 'unread' && !notification.read);
      
      return moduleMatch && typeMatch && statusMatch;
    });
  }, [notifications, moduleFilter, typeFilter, statusFilter]);

  const hasActiveFilters = moduleFilter !== 'all' || typeFilter !== 'all' || statusFilter !== 'all';

  const clearFilters = () => {
    setModuleFilter('all');
    setTypeFilter('all');
    setStatusFilter('all');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Carregando notificações...</div>
      </div>
    );
  }

  const showEmptyState = notifications.length === 0 || filteredNotifications.length === 0;

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
      {/* Filters Section */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Filter className="h-4 w-4" />
          Filtros
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          <Select value={moduleFilter} onValueChange={setModuleFilter}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Módulo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os módulos</SelectItem>
              {availableModules.map(module => (
                <SelectItem key={module} value={module!}>
                  {module?.toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="success">Sucesso</SelectItem>
              <SelectItem value="warning">Aviso</SelectItem>
              <SelectItem value="error">Erro</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="unread">Não lidas</SelectItem>
              <SelectItem value="read">Lidas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearFilters}
            className="w-full h-8"
          >
            Limpar filtros
          </Button>
        )}
      </div>

      {/* Actions Section */}
      <div className="flex gap-2 mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={markAllAsRead}
          className="flex-1"
          disabled={filteredNotifications.every(n => n.read)}
        >
          <CheckCheck className="h-4 w-4 mr-2" />
          Marcar todas como lidas
        </Button>
      </div>

      {/* Empty State */}
      {showEmptyState && (
        <div className="flex flex-col items-center justify-center flex-1 text-muted-foreground">
          <Bell className="h-12 w-12 mb-4 opacity-50" />
          <p className="text-center">
            {notifications.length === 0 
              ? 'Nenhuma notificação' 
              : 'Nenhuma notificação com os filtros selecionados'}
          </p>
          {hasActiveFilters && notifications.length > 0 && (
            <Button 
              variant="link" 
              size="sm" 
              onClick={clearFilters}
              className="mt-2"
            >
              Limpar filtros
            </Button>
          )}
        </div>
      )}

      {/* Notifications List */}
      {!showEmptyState && (
        <ScrollArea className="flex-1">
          <div className="space-y-2">
            {filteredNotifications.map((notification, index) => (
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
              
                {index < filteredNotifications.length - 1 && <Separator className="my-2" />}
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
