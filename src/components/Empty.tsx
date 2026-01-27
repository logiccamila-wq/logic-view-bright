import { cn } from '@/lib/utils';
import { LucideIcon, Inbox } from 'lucide-react';

interface EmptyProps {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

/**
 * Empty state component for displaying when there's no data
 */
export default function Empty({
  icon: Icon = Inbox,
  title = 'Nenhum dado encontrado',
  description = 'Não há informações para exibir no momento.',
  action,
  className
}: EmptyProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center p-12 text-center', className)}>
      <div className="mb-4 rounded-full bg-muted p-6">
        <Icon className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="mb-4 max-w-md text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
