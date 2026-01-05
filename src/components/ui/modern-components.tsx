import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface ModernCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
  onClick?: () => void;
}

export function ModernCard({ children, className, hover = false, gradient = false, onClick }: ModernCardProps) {
  return (
    <Card 
      className={cn(
        "transition-all duration-300",
        hover && "hover:shadow-xl hover:-translate-y-1",
        gradient && "bg-gradient-to-br from-background to-muted/20",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {children}
    </Card>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatCard({ title, value, description, icon: Icon, trend, className }: StatCardProps) {
  return (
    <ModernCard hover className={cn("p-6", className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
          {trend && (
            <div className={cn(
              "flex items-center gap-1 text-sm font-medium",
              trend.isPositive ? "text-green-600" : "text-red-600"
            )}>
              <span>{trend.isPositive ? "↑" : "↓"}</span>
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
        <div className="bg-primary/10 p-3 rounded-lg">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </div>
    </ModernCard>
  );
}

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color?: "blue" | "green" | "purple" | "orange" | "red";
}

export function MetricCard({ label, value, icon: Icon, color = "blue" }: MetricCardProps) {
  const colorClasses = {
    blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
    green: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
    purple: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
    orange: "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400",
    red: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-background/50 rounded-lg border">
      <div className={cn("p-3 rounded-full", colorClasses[color])}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  breadcrumb?: ReactNode;
}

export function PageHeader({ title, description, action, breadcrumb }: PageHeaderProps) {
  return (
    <div className="mb-8">
      {breadcrumb && <div className="mb-4">{breadcrumb}</div>}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            {title}
          </h1>
          {description && (
            <p className="text-muted-foreground max-w-2xl">{description}</p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
    </div>
  );
}

interface SectionProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function Section({ title, description, children, className }: SectionProps) {
  return (
    <section className={cn("space-y-6", className)}>
      {(title || description) && (
        <div className="space-y-1">
          {title && <h2 className="text-2xl font-bold tracking-tight">{title}</h2>}
          {description && <p className="text-muted-foreground">{description}</p>}
        </div>
      )}
      {children}
    </section>
  );
}

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="bg-muted rounded-full p-6 mb-4">
        <Icon className="h-12 w-12 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-md">{description}</p>
      {action}
    </div>
  );
}
