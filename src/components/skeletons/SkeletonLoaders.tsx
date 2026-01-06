import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

/**
 * Skeleton de Card com animação de pulse
 */
export function SkeletonCard() {
  return (
    <Card>
      <CardHeader>
        <motion.div
          className="h-6 bg-muted rounded w-3/4"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <motion.div
          className="h-4 bg-muted rounded w-1/2 mt-2"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
        />
      </CardHeader>
      <CardContent>
        <motion.div
          className="h-24 bg-muted rounded"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
        />
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton de Stat Card (KPI)
 */
export function SkeletonStatCard() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <motion.div
            className="h-4 bg-muted rounded w-1/2"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <motion.div
            className="h-10 w-10 bg-muted rounded-full"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
          />
        </div>
        <motion.div
          className="h-8 bg-muted rounded w-2/3 mb-2"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
        />
        <motion.div
          className="h-3 bg-muted rounded w-1/2"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
        />
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton de Tabela
 */
export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="grid grid-cols-4 gap-4 pb-3 border-b">
        {[1, 2, 3, 4].map((col) => (
          <motion.div
            key={col}
            className="h-4 bg-muted rounded"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: col * 0.1 }}
          />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={rowIdx} className="grid grid-cols-4 gap-4 py-3">
          {[1, 2, 3, 4].map((col) => (
            <motion.div
              key={col}
              className="h-4 bg-muted rounded"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: (rowIdx * 0.1) + (col * 0.05),
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton de Chart
 */
export function SkeletonChart() {
  return (
    <Card>
      <CardHeader>
        <motion.div
          className="h-6 bg-muted rounded w-1/3"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </CardHeader>
      <CardContent>
        <div className="h-64 bg-muted rounded-lg flex items-end justify-around p-4 gap-2">
          {[40, 70, 50, 90, 60, 80].map((height, idx) => (
            <motion.div
              key={idx}
              className="bg-muted-foreground/20 rounded-t"
              style={{ width: '100%', height: `${height}%` }}
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: idx * 0.1,
              }}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton de Lista
 */
export function SkeletonList({ items = 3 }: { items?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: items }).map((_, idx) => (
        <div key={idx} className="flex items-center gap-4">
          <motion.div
            className="h-12 w-12 bg-muted rounded-full flex-shrink-0"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: idx * 0.1 }}
          />
          <div className="flex-1 space-y-2">
            <motion.div
              className="h-4 bg-muted rounded w-3/4"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: idx * 0.1 + 0.2 }}
            />
            <motion.div
              className="h-3 bg-muted rounded w-1/2"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: idx * 0.1 + 0.4 }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton de Dashboard completo
 */
export function SkeletonDashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <motion.div
          className="h-8 bg-muted rounded w-1/3"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <motion.div
          className="h-4 bg-muted rounded w-1/4"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
        />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <SkeletonStatCard key={i} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <SkeletonChart key={i} />
        ))}
      </div>

      {/* Table */}
      <SkeletonTable rows={5} />
    </div>
  );
}

/**
 * Skeleton de Página simples
 */
export function SkeletonPage() {
  return (
    <div className="space-y-6">
      <motion.div
        className="h-10 bg-muted rounded w-1/4"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      <div className="grid gap-6">
        {[1, 2, 3].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
