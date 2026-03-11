import React, { useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Send,
  Sparkles,
  Trash2,
  AlertCircle,
  SlidersHorizontal,
} from "lucide-react";
import { useERPChat } from "@/hooks/useERPChat";
import { ERPWidgetRenderer } from "@/components/erp/widgets/ERPWidgetRenderer";

export function ERPChatPanel() {
  const {
    messages,
    isLoading,
    error,
    sliderContext,
    setSliderContext,
    sendMessage,
    clearHistory,
  } = useERPChat();

  const [input, setInput] = React.useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const text = input.trim();
    setInput("");
    await sendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestedAction = (action: string) => {
    if (isLoading) return;
    sendMessage(action);
  };

  const getOptimizationLabel = (val: number) => {
    if (val < 30) return { label: "Baixa", color: "text-red-400" };
    if (val < 60) return { label: "Moderada", color: "text-yellow-400" };
    if (val < 80) return { label: "Alta", color: "text-emerald-400" };
    return { label: "Máxima", color: "text-cyan-400" };
  };

  const getRiskLabel = (val: number) => {
    if (val < 30) return { label: "Baixo", color: "text-emerald-400" };
    if (val < 60) return { label: "Moderado", color: "text-yellow-400" };
    if (val < 80) return { label: "Alto", color: "text-orange-400" };
    return { label: "Crítico", color: "text-red-400" };
  };

  const optInfo = getOptimizationLabel(sliderContext.optimization);
  const riskInfo = getRiskLabel(sliderContext.risk);

  return (
    <div className="space-y-4">
      {/* Slider Controls */}
      <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/80 border border-slate-700/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm text-white">
            <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
            Parâmetros de Simulação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 text-xs">Otimização</span>
              <span className={`text-xs font-bold ${optInfo.color}`}>
                {sliderContext.optimization}% — {optInfo.label}
              </span>
            </div>
            <Slider
              value={[sliderContext.optimization]}
              onValueChange={(v) =>
                setSliderContext((prev) => ({ ...prev, optimization: v[0] }))
              }
              min={0}
              max={100}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>0 — Mínima</span>
              <span>100 — Máxima</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 text-xs">
                Risco Operacional
              </span>
              <span className={`text-xs font-bold ${riskInfo.color}`}>
                {sliderContext.risk}% — {riskInfo.label}
              </span>
            </div>
            <Slider
              value={[sliderContext.risk]}
              onValueChange={(v) =>
                setSliderContext((prev) => ({ ...prev, risk: v[0] }))
              }
              min={0}
              max={100}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>0 — Sem risco</span>
              <span>100 — Risco máximo</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chat Area */}
      <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/80 border border-slate-700/50 backdrop-blur-sm flex flex-col h-[520px]">
        <CardHeader className="pb-2 flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm text-white">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              ERP Pilot — Chat IA
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearHistory}
              className="text-slate-400 hover:text-slate-200 h-7 px-2"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              Limpar
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
          <ScrollArea ref={scrollRef} className="flex-1 px-4">
            <div className="space-y-4 py-3">
              {messages.map((msg, idx) => (
                <div key={idx}>
                  <div
                    className={`flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-xl p-3 ${
                        msg.role === "user"
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-700/50 border border-slate-600/30"
                      }`}
                    >
                      {msg.role === "assistant" && (
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                          <span className="text-xs font-semibold text-indigo-300">
                            ERP Pilot
                          </span>
                        </div>
                      )}
                      <p className="text-sm whitespace-pre-wrap text-slate-200 leading-relaxed">
                        {msg.content}
                      </p>
                    </div>
                  </div>

                  {/* Render widgets below assistant messages */}
                  {msg.role === "assistant" && msg.widgets && msg.widgets.length > 0 && (
                    <div className="mt-3">
                      <ERPWidgetRenderer widgets={msg.widgets} />
                    </div>
                  )}

                  {/* Suggested actions */}
                  {msg.role === "assistant" &&
                    msg.suggested_actions &&
                    msg.suggested_actions.length > 0 &&
                    idx === messages.length - 1 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {msg.suggested_actions.map((action, actionIdx) => (
                          <Button
                            key={actionIdx}
                            variant="outline"
                            size="sm"
                            onClick={() => handleSuggestedAction(action)}
                            disabled={isLoading}
                            className="text-xs border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10 hover:text-indigo-200 h-7"
                          >
                            {action}
                          </Button>
                        ))}
                      </div>
                    )}
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-700/50 rounded-xl p-3 border border-slate-600/30">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                      <span className="text-xs text-slate-400">
                        Renderizando análise...
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="flex justify-start">
                  <div className="bg-red-900/20 rounded-xl p-3 border border-red-700/30">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                      <span className="text-xs text-red-300">{error}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-3 border-t border-slate-700/50 flex-shrink-0">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Analise faturamento, estoque, margem, fluxo de caixa..."
                disabled={isLoading}
                className="flex-1 bg-slate-700/40 border-slate-600/50 text-slate-200 placeholder:text-slate-500 text-sm"
              />
              <Button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                size="icon"
                className="bg-indigo-600 hover:bg-indigo-700 flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
