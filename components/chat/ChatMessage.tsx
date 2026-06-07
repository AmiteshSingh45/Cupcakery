"use client";

import { motion } from "framer-motion";
import { Bot, UserRound } from "lucide-react";
import ProductCardInChat from "./ProductCardInChat";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/utils";

export type ChatProduct = {
  _id?: string;
  id?: string;
  name: string;
  slug?: string;
  price?: number;
  category?: string;
  image?: string;
  rating?: number;
  reviews?: number;
  shortDescription?: string;
  whyPick?: string;
};

export type ChatMessageType = {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: string;
  products?: ChatProduct[];
  suggestions?: string[];
  provider?: string;
  isError?: boolean;
};

export default function ChatMessage({
  message,
  onSuggestion,
}: {
  message: ChatMessageType;
  onSuggestion?: (prompt: string) => void;
}) {
  const isUser = message.type === "user";
  const timeLabel = new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(message.timestamp));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex w-full gap-2", isUser ? "justify-end" : "justify-start")}
    >
      {!isUser && (
        <span className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-espresso-900 text-cream">
          <Bot className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
      )}

      <div className={cn("max-w-[84%] space-y-2", isUser && "items-end")}>
        <div
          className={cn(
            "rounded-lg px-3.5 py-3 shadow-card",
            isUser
              ? "bg-blush-rose text-white"
              : message.isError
                ? "border border-blush-rose/30 bg-blush-light text-espresso-900"
                : "border border-espresso-100 bg-white text-espresso-900"
          )}
        >
          <p className="whitespace-pre-wrap text-sm leading-6">{message.content}</p>
          <div
            className={cn(
              "mt-2 flex items-center gap-2 text-[11px]",
              isUser ? "text-white/75" : "text-ink-muted"
            )}
          >
            <span>{timeLabel}</span>
            {message.provider && <span>{message.provider}</span>}
          </div>
        </div>

        {!!message.products?.length && !isUser && (
          <div className="space-y-2">
            {message.products.slice(0, 3).map((product) => (
              <ProductCardInChat key={product._id ?? product.id ?? product.name} product={product} />
            ))}
          </div>
        )}

        {!!message.suggestions?.length && !isUser && (
          <div className="flex flex-wrap gap-2">
            {message.suggestions.slice(0, 4).map((suggestion) => (
              <Button
                key={suggestion}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onSuggestion?.(suggestion)}
                className="h-8 border-gold/30 bg-cream/70 text-xs"
              >
                {suggestion}
              </Button>
            ))}
          </div>
        )}
      </div>

      {isUser && (
        <span className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-blush-light text-blush-rose">
          <UserRound className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
      )}
    </motion.div>
  );
}
