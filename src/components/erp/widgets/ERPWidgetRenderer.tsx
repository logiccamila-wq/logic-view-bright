import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  TrendingUp,
  TrendingDown,
  Lightbulb,
  BarChart3,
  TableIcon,
} from "lucide-react";
import type { ERPWidget } from "@/types/erp-chat";

interface ERPWidgetRendererProps {
  widgets: ERPWidget[];
}

function KpiWidget({ widget }: { widget: Extract<ERPWidget, { type: "kpi" }> }) {
  const isPositive = widget.positive !== false;
  return (
    <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/80 border border-slate-700/50 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-400 text-xs font-medium truncate">
            {widget.title}
          </span>
          <div className="w-7 h-7 rounded-lg bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
            {isPositive ? (
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-red-400" />
            )}
          </div>
        </div>
        <p className="text-xl font-bold text-white">{widget.value}</p>
        {widget.change && (
          <p
            className={`text-xs mt-1 font-medium ${
              isPositive ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {isPositive ? "▲" : "▼"} {widget.change}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function InsightWidget({
  widget,
}: {
  widget: Extract<ERPWidget, { type: "insight" }>;
}) {
  return (
    <Card className="bg-gradient-to-br from-indigo-900/30 to-slate-900/80 border border-indigo-700/30 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Lightbulb className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-indigo-300 mb-1">
              {widget.title}
            </p>
            <p className="text-sm text-slate-300 leading-relaxed">
              {widget.content}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TableWidget({
  widget,
}: {
  widget: Extract<ERPWidget, { type: "table" }>;
}) {
  return (
    <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/80 border border-slate-700/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm text-white">
          <TableIcon className="w-4 h-4 text-indigo-400" />
          {widget.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-700/50 hover:bg-transparent">
              {widget.columns.map((col) => (
                <TableHead key={col} className="text-slate-400 text-xs">
                  {col}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {widget.rows.map((row, rowIdx) => (
              <TableRow
                key={rowIdx}
                className="border-slate-700/30 hover:bg-slate-700/20"
              >
                {row.map((cell, cellIdx) => (
                  <TableCell
                    key={cellIdx}
                    className="text-slate-300 text-sm py-2"
                  >
                    {cell}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function ChartWidget({
  widget,
}: {
  widget: Extract<ERPWidget, { type: "chart" }>;
}) {
  const maxVal = Math.max(...widget.data.map((d) => d.value), 1);

  return (
    <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/80 border border-slate-700/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm text-white">
          <BarChart3 className="w-4 h-4 text-indigo-400" />
          {widget.title}
          <Badge className="ml-auto bg-slate-700/50 text-slate-400 text-[10px]">
            {widget.chartType}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {widget.data.map((d, idx) => {
            const pct = Math.round((d.value / maxVal) * 100);
            return (
              <div key={idx} className="flex items-center gap-3">
                <span className="text-xs text-slate-400 w-24 truncate">
                  {d.label}
                </span>
                <div className="flex-1 h-5 bg-slate-700/40 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-400 transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs text-slate-300 font-medium w-16 text-right">
                  {d.value.toLocaleString("pt-BR")}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export function ERPWidgetRenderer({ widgets }: ERPWidgetRendererProps) {
  if (!widgets || widgets.length === 0) return null;

  const kpis = widgets.filter((w) => w.type === "kpi");
  const others = widgets.filter((w) => w.type !== "kpi");

  return (
    <div className="space-y-3">
      {kpis.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {kpis.map((w, i) => (
            <KpiWidget
              key={`kpi-${i}`}
              widget={w as Extract<ERPWidget, { type: "kpi" }>}
            />
          ))}
        </div>
      )}
      {others.map((w, i) => {
        switch (w.type) {
          case "insight":
            return (
              <InsightWidget
                key={`insight-${i}`}
                widget={w as Extract<ERPWidget, { type: "insight" }>}
              />
            );
          case "table":
            return (
              <TableWidget
                key={`table-${i}`}
                widget={w as Extract<ERPWidget, { type: "table" }>}
              />
            );
          case "chart":
            return (
              <ChartWidget
                key={`chart-${i}`}
                widget={w as Extract<ERPWidget, { type: "chart" }>}
              />
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
