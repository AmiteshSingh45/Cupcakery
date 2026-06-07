"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CakeSlice,
  ExternalLink,
  Loader2,
  Mail,
  Maximize2,
  Menu,
  Minus,
  Phone,
  SendHorizontal,
  ShoppingBag,
  X,
} from "lucide-react";
import ChatMessage, { ChatMessageType, ChatProduct } from "./ChatMessage";
import FirstScreen, { Suggestion } from "./FirstScreen";
import GuidedFlow from "./GuidedFlow";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/components/ui/utils";

type StreamPayload = {
  type?: "meta" | "token" | "final" | "error";
  text?: string;
  message?: string;
  products?: ChatProduct[];
  suggestions?: string[];
  provider?: string;
};

const SESSION_KEY = "bindi-chat-session";
const MESSAGES_KEY = "bindi-chat-messages";

const defaultSuggestions = [
  "Best chocolate cupcake?",
  "Custom birthday cake",
  "Cupcake prices",
  "Today's special",
  "Eggless cupcakes",
  "Delivery options",
];

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getSessionId() {
  if (typeof window === "undefined") return createId("session");
  const existing = window.localStorage.getItem(SESSION_KEY);
  if (existing) return existing;
  const next = createId("session");
  window.localStorage.setItem(SESSION_KEY, next);
  return next;
}

export default function ChatPanel({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeFlow, setActiveFlow] = useState<string | null>(null);
  const [flowState, setFlowState] = useState<Record<string, unknown>>({});
  const [isMinimized, setIsMinimized] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setSessionId(getSessionId());
    const saved = window.localStorage.getItem(MESSAGES_KEY);
    if (saved) {
      try {
        setMessages(JSON.parse(saved).slice(-20));
      } catch {
        window.localStorage.removeItem(MESSAGES_KEY);
      }
    }
  }, []);

  useEffect(() => {
    if (messages.length) {
      window.localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages.slice(-20)));
    }
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const panelSize = useMemo(
    () =>
      isExpanded
        ? "bottom-4 right-4 h-[min(760px,calc(100dvh-2rem))] w-[min(680px,calc(100vw-2rem))]"
        : "bottom-20 right-4 h-[min(640px,calc(100dvh-6.5rem))] w-[min(420px,calc(100vw-2rem))] sm:bottom-24 sm:right-6",
    [isExpanded]
  );

  const appendMessage = (message: ChatMessageType) => {
    setMessages((current) => [...current, message]);
  };

  const updateMessage = (id: string, patch: Partial<ChatMessageType>) => {
    setMessages((current) =>
      current.map((message) => (message.id === id ? { ...message, ...patch } : message))
    );
  };

  const sendPrompt = async (
    prompt: string,
    options: { keepFlow?: string; nextFlowState?: Record<string, unknown> } = {}
  ) => {
    const cleanPrompt = prompt.trim();
    if (!cleanPrompt || loading) return;

    const userMessage: ChatMessageType = {
      id: createId("user"),
      type: "user",
      content: cleanPrompt,
      timestamp: new Date().toISOString(),
    };
    const assistantId = createId("ai");

    appendMessage(userMessage);
    setInputValue("");
    setLoading(true);
    setActiveFlow(options.keepFlow || null);
    if (options.nextFlowState) {
      setFlowState(options.nextFlowState);
    }

    appendMessage({
      id: assistantId,
      type: "ai",
      content: "",
      timestamp: new Date().toISOString(),
    });

    try {
      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-session-id": sessionId || getSessionId(),
        },
        body: JSON.stringify({
          message: cleanPrompt,
          flowState,
          activeFlow,
        }),
      });

      if (!response.ok || !response.body) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.message || "Chat service is unavailable");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let streamedText = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.trim()) continue;
          const payload: StreamPayload = JSON.parse(line);
          if (payload.type === "token" && payload.text) {
            streamedText += payload.text;
            updateMessage(assistantId, { content: streamedText });
          }
          if (payload.type === "final") {
            updateMessage(assistantId, {
              content: payload.message || streamedText || "I can help with cupcakes, cakes, orders, and bakery recommendations.",
              products: payload.products || [],
              suggestions: payload.suggestions || defaultSuggestions,
              provider: payload.provider,
            });
          }
          if (payload.type === "error") {
            updateMessage(assistantId, {
              content: payload.message || "I hit a bakery-side hiccup. Please try once more.",
              suggestions: defaultSuggestions.slice(0, 4),
              isError: true,
            });
          }
        }
      }
    } catch (error) {
      updateMessage(assistantId, {
        content:
          "I could not reach the bakery assistant service just now. You can still ask about cupcakes, cakes, delivery, or custom orders and I will try again.",
        suggestions: defaultSuggestions.slice(0, 4),
        isError: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendPrompt(inputValue);
  };

  const handleSuggestion = (suggestion: Suggestion) => {
    void sendPrompt(suggestion.prompt, {
      keepFlow: suggestion.flow,
      nextFlowState: suggestion.initialState || {},
    });
  };

  const handleFlowStep = (response: string, nextFlow = null, products: ChatProduct[] = [], suggestions: string[] = []) => {
    appendMessage({
      id: createId("ai"),
      type: "ai",
      content: response,
      products,
      suggestions,
      timestamp: new Date().toISOString(),
    });
    setActiveFlow(nextFlow);
    setFlowState({});
  };

  return (
    <motion.section
      role="dialog"
      aria-label="Bindi Cupcakery bakery assistant"
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.97 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
      className={cn(
        "fixed z-[65] overflow-hidden rounded-lg border border-gold/30 bg-cream shadow-luxury-lg",
        panelSize,
        isMinimized && "h-[76px]"
      )}
    >
      <div className="flex h-full flex-col">
        <header className="flex min-h-[76px] items-center justify-between border-b border-gold/20 bg-espresso-900 px-4 text-cream">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-cream text-espresso-900">
              <CakeSlice className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h3 className="truncate font-display text-lg font-semibold leading-6">
                Bindi Bakery Assistant
              </h3>
              <p className="truncate text-xs text-cream/75">
                Cupcakes, cakes, orders, delivery, allergens
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Tooltip content={isMinimized ? "Maximize" : "Minimize"}>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setIsMinimized((current) => !current)}
                className="h-9 w-9 text-cream hover:bg-white/10 hover:text-cream"
              >
                <Minus className="h-4 w-4" aria-hidden="true" />
              </Button>
            </Tooltip>
            <Tooltip content={isExpanded ? "Compact view" : "Expanded view"}>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setIsExpanded((current) => !current)}
                className="hidden h-9 w-9 text-cream hover:bg-white/10 hover:text-cream sm:inline-flex"
              >
                <Maximize2 className="h-4 w-4" aria-hidden="true" />
              </Button>
            </Tooltip>
            <Tooltip content="Close">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-9 w-9 text-cream hover:bg-white/10 hover:text-cream"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </Button>
            </Tooltip>
          </div>
        </header>

        {!isMinimized && (
          <>
            <div className="flex gap-2 border-b border-gold/20 bg-cream-warm/80 px-3 py-2">
              {[
                { label: "Order", icon: ShoppingBag, href: "/products" },
                { label: "Menu", icon: Menu, href: "/products" },
                { label: "Contact", icon: Phone, href: "/Contact_Us" },
                { label: "Email", icon: Mail, href: "/Contact_Us" },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="inline-flex h-8 flex-1 items-center justify-center gap-1 rounded-md border border-gold/25 bg-white text-[11px] font-semibold text-espresso-800 transition hover:bg-cream"
                >
                  <item.icon className="h-3.5 w-3.5" aria-hidden="true" />
                  {item.label}
                </a>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto bg-[linear-gradient(180deg,#FDF6EC_0%,#FCE8E8_100%)] p-4">
              <AnimatePresence initial={false}>
                {messages.length === 0 ? (
                  <FirstScreen onSuggestion={handleSuggestion} />
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <ChatMessage
                        key={message.id}
                        message={message}
                        onSuggestion={(prompt) => void sendPrompt(prompt)}
                      />
                    ))}
                    {loading && (
                      <div className="flex items-center gap-2 pl-9 text-xs font-medium text-ink-muted">
                        <Loader2 className="h-4 w-4 animate-spin text-blush-rose" aria-hidden="true" />
                        Mixing a thoughtful bakery answer...
                      </div>
                    )}
                  </div>
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {activeFlow && (
              <GuidedFlow
                flow={activeFlow}
                state={flowState}
                onStepSubmit={handleFlowStep}
                onStateChange={setFlowState}
              />
            )}

            <div className="border-t border-gold/20 bg-white p-3">
              {messages.length > 0 && (
                <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
                  {defaultSuggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => void sendPrompt(suggestion)}
                      className="shrink-0 rounded-md border border-gold/25 bg-cream px-3 py-1.5 text-xs font-semibold text-espresso-800 transition hover:bg-blush-light"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(event) => setInputValue(event.target.value)}
                  placeholder="Ask about cupcakes, cakes, prices..."
                  className="h-11 min-w-0 flex-1 rounded-md border border-espresso-100 bg-cream px-3 text-sm text-espresso-900 outline-none transition placeholder:text-ink-muted focus:border-blush-rose focus:bg-white focus:ring-2 focus:ring-blush-rose/20"
                  disabled={loading}
                  maxLength={700}
                />
                <Button
                  type="submit"
                  variant="blush"
                  size="icon"
                  disabled={loading || !inputValue.trim()}
                  className="h-11 w-11 shrink-0"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <SendHorizontal className="h-4 w-4" aria-hidden="true" />
                  )}
                </Button>
              </form>
              <p className="mt-2 flex items-center gap-1 text-[11px] text-ink-muted">
                Bakery-focused only
                <ExternalLink className="h-3 w-3" aria-hidden="true" />
              </p>
            </div>
          </>
        )}
      </div>
    </motion.section>
  );
}
