import { useState, useCallback, useRef } from "react";
import type {
  ERPChatMessage,
  ERPChatResponse,
  ERPSliderContext,
  ERPWidget,
} from "@/types/erp-chat";
import { ERP_SYSTEM_PROMPT } from "@/types/erp-chat";

interface UseERPChatOptions {
  /** Initial slider context */
  initialContext?: ERPSliderContext;
}

interface UseERPChatReturn {
  messages: ERPChatMessage[];
  isLoading: boolean;
  error: string | null;
  sliderContext: ERPSliderContext;
  setSliderContext: React.Dispatch<React.SetStateAction<ERPSliderContext>>;
  sendMessage: (text: string) => Promise<void>;
  clearHistory: () => void;
}

const INITIAL_MESSAGE: ERPChatMessage = {
  role: "assistant",
  content:
    "Parâmetros sincronizados. Sistema ERP LogicFlow operacional. Aguardando comando para renderizar análise de dados.",
  widgets: [
    {
      type: "insight",
      title: "Status do Sistema",
      content:
        "Todos os módulos estão ativos. Ajuste os sliders de Otimização e Risco para calibrar as simulações.",
    },
  ],
  suggested_actions: [
    "Analisar faturamento do mês",
    "Simular previsão de caixa",
    "Verificar risco de ruptura de estoque",
  ],
  timestamp: Date.now(),
};

/**
 * Attempts to extract a structured ERPChatResponse from the AI text.
 * Falls back to treating the entire text as a plain message.
 */
function parseAIResponse(raw: string): ERPChatResponse {
  const trimmed = raw.trim();

  // Try to find a JSON object in the response
  const jsonStart = trimmed.indexOf("{");
  const jsonEnd = trimmed.lastIndexOf("}");

  if (jsonStart !== -1 && jsonEnd > jsonStart) {
    try {
      const parsed = JSON.parse(trimmed.slice(jsonStart, jsonEnd + 1));
      if (typeof parsed.message === "string") {
        return {
          message: parsed.message,
          widgets: Array.isArray(parsed.widgets) ? parsed.widgets : undefined,
          suggested_actions: Array.isArray(parsed.suggested_actions)
            ? parsed.suggested_actions
            : undefined,
        };
      }
    } catch {
      // JSON parse failed — fall through to plain text
    }
  }

  return { message: trimmed };
}

export function useERPChat(
  options: UseERPChatOptions = {}
): UseERPChatReturn {
  const {
    initialContext = { optimization: 50, risk: 30 },
  } = options;

  const [messages, setMessages] = useState<ERPChatMessage[]>([INITIAL_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sliderContext, setSliderContext] =
    useState<ERPSliderContext>(initialContext);

  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      // Cancel any in-flight request
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const userMsg: ERPChatMessage = {
        role: "user",
        content: text.trim(),
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);
      setError(null);

      try {
        const API_BASE = (
          (typeof import.meta !== "undefined" &&
            import.meta.env?.VITE_API_BASE_URL) ||
          "/api"
        ).replace(/\/$/, "");

        const token = localStorage.getItem("azure_session_token") || "";

        // Build messages payload with system prompt including slider context
        const systemContent = `${ERP_SYSTEM_PROMPT}\n\nParâmetros atuais do frontend:\n- Otimização: ${sliderContext.optimization}%\n- Risco: ${sliderContext.risk}%`;

        const chatPayload = [
          { role: "system", content: systemContent },
          ...messages
            .filter((m) => m.role === "user" || m.role === "assistant")
            .slice(-10)
            .map((m) => ({ role: m.role, content: m.content })),
          { role: "user", content: text.trim() },
        ];

        const resp = await fetch(`${API_BASE}/gael-chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            messages: chatPayload,
            context: {
              optimization: sliderContext.optimization,
              risk: sliderContext.risk,
            },
          }),
          signal: controller.signal,
        });

        if (!resp.ok) {
          const ct = resp.headers.get("content-type") || "";
          let msg = "Falha ao conectar com a IA";
          if (ct.includes("application/json")) {
            const errorData = await resp.json();
            msg = errorData.error || msg;
          } else {
            const errText = await resp.text();
            msg = errText || msg;
          }
          throw new Error(msg);
        }

        if (!resp.body) throw new Error("Sem resposta do servidor");

        // Stream SSE response
        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let textBuffer = "";
        let assistantContent = "";
        let streamDone = false;

        while (!streamDone) {
          const { done, value } = await reader.read();
          if (done) break;

          textBuffer += decoder.decode(value, { stream: true });

          let newlineIndex: number;
          while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
            let line = textBuffer.slice(0, newlineIndex);
            textBuffer = textBuffer.slice(newlineIndex + 1);

            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (line.startsWith(":") || line.trim() === "") continue;
            if (!line.startsWith("data: ")) continue;

            const jsonStr = line.slice(6).trim();
            if (jsonStr === "[DONE]") {
              streamDone = true;
              break;
            }

            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content as
                | string
                | undefined;

              if (content) {
                assistantContent += content;
                setMessages((prev) => {
                  const last = prev[prev.length - 1];
                  if (last?.role === "assistant" && prev.length > 1) {
                    return prev.map((m, i) =>
                      i === prev.length - 1
                        ? { ...m, content: assistantContent }
                        : m
                    );
                  }
                  return [
                    ...prev,
                    {
                      role: "assistant",
                      content: assistantContent,
                      timestamp: Date.now(),
                    },
                  ];
                });
              }
            } catch {
              textBuffer = line + "\n" + textBuffer;
              break;
            }
          }
        }

        // Flush remaining
        if (textBuffer.trim()) {
          for (const raw of textBuffer.split("\n")) {
            if (!raw || raw.startsWith(":") || !raw.startsWith("data: "))
              continue;
            const jsonStr = raw.slice(6).trim();
            if (jsonStr === "[DONE]") continue;

            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content as
                | string
                | undefined;
              if (content) {
                assistantContent += content;
              }
            } catch {
              /* ignore */
            }
          }
        }

        // Parse the complete assistant response for structured data
        const structured = parseAIResponse(assistantContent);

        setMessages((prev) => {
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          if (lastIdx >= 0 && updated[lastIdx].role === "assistant") {
            updated[lastIdx] = {
              ...updated[lastIdx],
              content: structured.message,
              widgets: structured.widgets,
              suggested_actions: structured.suggested_actions,
              timestamp: Date.now(),
            };
          }
          return updated;
        });
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        const msg =
          err instanceof Error ? err.message : "Erro ao processar mensagem";
        setError(msg);
        console.error("useERPChat error:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, messages, sliderContext]
  );

  const clearHistory = useCallback(() => {
    setMessages([INITIAL_MESSAGE]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sliderContext,
    setSliderContext,
    sendMessage,
    clearHistory,
  };
}
