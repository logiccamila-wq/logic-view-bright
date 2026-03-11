/**
 * Shared AI provider abstraction for Azure OpenAI and Google AI Studio (Gemini).
 *
 * Environment variables:
 *   AI_PROVIDER           – "azure" | "google" | "auto" (default "auto")
 *
 *   Azure OpenAI:
 *     AZURE_OPENAI_ENDPOINT
 *     AZURE_OPENAI_API_KEY
 *     AZURE_OPENAI_DEPLOYMENT
 *     AZURE_OPENAI_API_VERSION  (default "2024-10-21")
 *
 *   Google AI Studio (Gemini):
 *     GOOGLE_AI_API_KEY
 *     GOOGLE_AI_MODEL          (default "gemini-2.0-flash")
 */

// ── Types ──────────────────────────────────────────────────────────────

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatCompletionOptions {
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface ChatCompletionResult {
  content: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  provider: "azure-openai" | "google-ai";
}

export type AIProviderName = "azure" | "google" | "auto";

// ── Config helpers ─────────────────────────────────────────────────────

function env(key: string, fallback = ""): string {
  // Works in both Deno (edge functions) and Node (api/runtime)
  if (typeof Deno !== "undefined") return Deno.env.get(key) ?? fallback;
  return (typeof process !== "undefined" ? process.env[key] : undefined) ?? fallback;
}

export function getProviderName(): AIProviderName {
  const v = env("AI_PROVIDER", "auto").toLowerCase().trim();
  if (v === "google" || v === "gemini") return "google";
  if (v === "azure" || v === "azure-openai") return "azure";
  return "auto";
}

function isAzureConfigured(): boolean {
  return !!(env("AZURE_OPENAI_ENDPOINT") && env("AZURE_OPENAI_API_KEY") && env("AZURE_OPENAI_DEPLOYMENT"));
}

function isGoogleConfigured(): boolean {
  return !!env("GOOGLE_AI_API_KEY");
}

// ── Azure OpenAI ───────────────────────────────────────────────────────

async function azureChat(opts: ChatCompletionOptions): Promise<ChatCompletionResult> {
  const endpoint = env("AZURE_OPENAI_ENDPOINT").replace(/\/$/, "");
  const apiKey = env("AZURE_OPENAI_API_KEY");
  const deployment = env("AZURE_OPENAI_DEPLOYMENT");
  const apiVersion = env("AZURE_OPENAI_API_VERSION", "2024-10-21");

  const url = `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;

  const body: Record<string, unknown> = {
    messages: opts.messages,
    temperature: opts.temperature ?? 0.7,
    stream: false,
  };
  if (opts.maxTokens) body.max_tokens = opts.maxTokens;

  const resp = await fetch(url, {
    method: "POST",
    headers: { "api-key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new AIProviderError(`Azure OpenAI error ${resp.status}: ${text}`, resp.status);
  }

  const data: any = await resp.json();
  const content = data.choices?.[0]?.message?.content ?? "";
  const usage = data.usage ?? {};

  return {
    content,
    usage: {
      prompt_tokens: usage.prompt_tokens ?? 0,
      completion_tokens: usage.completion_tokens ?? 0,
      total_tokens: usage.total_tokens ?? 0,
    },
    provider: "azure-openai",
  };
}

async function azureChatStream(opts: ChatCompletionOptions): Promise<Response> {
  const endpoint = env("AZURE_OPENAI_ENDPOINT").replace(/\/$/, "");
  const apiKey = env("AZURE_OPENAI_API_KEY");
  const deployment = env("AZURE_OPENAI_DEPLOYMENT");
  const apiVersion = env("AZURE_OPENAI_API_VERSION", "2024-10-21");

  const url = `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;

  const body: Record<string, unknown> = {
    messages: opts.messages,
    temperature: opts.temperature ?? 0.7,
    stream: true,
  };
  if (opts.maxTokens) body.max_tokens = opts.maxTokens;

  const resp = await fetch(url, {
    method: "POST",
    headers: { "api-key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new AIProviderError(`Azure OpenAI error ${resp.status}: ${text}`, resp.status);
  }

  return resp;
}

// ── Google AI Studio (Gemini) ──────────────────────────────────────────

function convertMessagesToGemini(messages: ChatMessage[]): {
  systemInstruction?: { parts: { text: string }[] };
  contents: { role: string; parts: { text: string }[] }[];
} {
  let systemText = "";
  const contents: { role: string; parts: { text: string }[] }[] = [];

  for (const msg of messages) {
    if (msg.role === "system") {
      systemText += (systemText ? "\n\n" : "") + msg.content;
    } else {
      contents.push({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      });
    }
  }

  // Gemini API requires at least one user message in `contents`;
  // when only system messages are provided, add a minimal placeholder.
  if (contents.length === 0) {
    contents.push({ role: "user", parts: [{ text: "." }] });
  }

  const result: {
    systemInstruction?: { parts: { text: string }[] };
    contents: { role: string; parts: { text: string }[] }[];
  } = { contents };

  if (systemText) {
    result.systemInstruction = { parts: [{ text: systemText }] };
  }

  return result;
}

async function googleChat(opts: ChatCompletionOptions): Promise<ChatCompletionResult> {
  const apiKey = env("GOOGLE_AI_API_KEY");
  const model = env("GOOGLE_AI_MODEL", "gemini-2.0-flash");

  const { systemInstruction, contents } = convertMessagesToGemini(opts.messages);

  const body: Record<string, unknown> = {
    contents,
    generationConfig: {
      temperature: opts.temperature ?? 0.7,
      ...(opts.maxTokens ? { maxOutputTokens: opts.maxTokens } : {}),
    },
  };
  if (systemInstruction) body.systemInstruction = systemInstruction;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new AIProviderError(`Google AI error ${resp.status}: ${text}`, resp.status);
  }

  const data: any = await resp.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  const meta = data.usageMetadata ?? {};

  return {
    content,
    usage: {
      prompt_tokens: meta.promptTokenCount ?? 0,
      completion_tokens: meta.candidatesTokenCount ?? 0,
      total_tokens: meta.totalTokenCount ?? 0,
    },
    provider: "google-ai",
  };
}

/**
 * Google AI streaming returns SSE in a different format than Azure OpenAI.
 * This function converts the Google SSE stream into an OpenAI-compatible SSE
 * stream so the frontend can parse both identically.
 */
async function googleChatStream(opts: ChatCompletionOptions): Promise<Response> {
  const apiKey = env("GOOGLE_AI_API_KEY");
  const model = env("GOOGLE_AI_MODEL", "gemini-2.0-flash");

  const { systemInstruction, contents } = convertMessagesToGemini(opts.messages);

  const body: Record<string, unknown> = {
    contents,
    generationConfig: {
      temperature: opts.temperature ?? 0.7,
      ...(opts.maxTokens ? { maxOutputTokens: opts.maxTokens } : {}),
    },
  };
  if (systemInstruction) body.systemInstruction = systemInstruction;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`;

  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new AIProviderError(`Google AI error ${resp.status}: ${text}`, resp.status);
  }

  // Transform Google SSE stream → OpenAI-compatible SSE stream
  const reader = resp.body!.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async pull(controller) {
      const { done, value } = await reader.read();
      if (done) {
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
        return;
      }

      const text = decoder.decode(value, { stream: true });
      // Google SSE lines: "data: {...}\n\n"
      const lines = text.split("\n");
      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const jsonStr = line.slice(6).trim();
        if (!jsonStr) continue;
        try {
          const chunk: any = JSON.parse(jsonStr);
          const partText = chunk.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
          if (partText) {
            // Emit in OpenAI-compatible delta format
            const openAIChunk = {
              choices: [{ delta: { content: partText }, index: 0, finish_reason: null }],
            };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(openAIChunk)}\n\n`));
          }
        } catch {
          // skip malformed chunks
        }
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream" },
  });
}

// ── Error class ────────────────────────────────────────────────────────

export class AIProviderError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "AIProviderError";
    this.status = status;
  }
}

// ── Public API ─────────────────────────────────────────────────────────

/**
 * Send a non-streaming chat completion request to the configured AI provider.
 *
 * In "auto" mode: tries Azure OpenAI first, then Google AI.
 */
export async function chatCompletion(opts: ChatCompletionOptions): Promise<ChatCompletionResult> {
  const provider = getProviderName();

  if (provider === "azure") {
    if (!isAzureConfigured()) throw new Error("Azure OpenAI is not configured");
    return azureChat(opts);
  }

  if (provider === "google") {
    if (!isGoogleConfigured()) throw new Error("Google AI is not configured");
    return googleChat(opts);
  }

  // auto – try Azure first, fall back to Google
  if (isAzureConfigured()) {
    try {
      return await azureChat(opts);
    } catch (err) {
      console.warn("Azure OpenAI failed, falling back to Google AI:", (err as Error).message);
      if (isGoogleConfigured()) return googleChat(opts);
      throw err;
    }
  }

  if (isGoogleConfigured()) return googleChat(opts);

  throw new Error("No AI provider configured. Set AZURE_OPENAI_* or GOOGLE_AI_API_KEY environment variables.");
}

/**
 * Send a streaming chat completion request.
 *
 * Returns a raw Response whose body is an OpenAI-compatible SSE stream,
 * regardless of the underlying provider.
 */
export async function chatCompletionStream(opts: ChatCompletionOptions): Promise<Response> {
  const provider = getProviderName();

  if (provider === "azure") {
    if (!isAzureConfigured()) throw new Error("Azure OpenAI is not configured");
    return azureChatStream(opts);
  }

  if (provider === "google") {
    if (!isGoogleConfigured()) throw new Error("Google AI is not configured");
    return googleChatStream(opts);
  }

  // auto – try Azure first, fall back to Google
  if (isAzureConfigured()) {
    try {
      return await azureChatStream(opts);
    } catch (err) {
      console.warn("Azure OpenAI streaming failed, falling back to Google AI:", (err as Error).message);
      if (isGoogleConfigured()) return googleChatStream(opts);
      throw err;
    }
  }

  if (isGoogleConfigured()) return googleChatStream(opts);

  throw new Error("No AI provider configured. Set AZURE_OPENAI_* or GOOGLE_AI_API_KEY environment variables.");
}
