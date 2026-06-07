"use client";

import { motion } from "framer-motion";
import { CakeSlice, Gift, HeartHandshake, Search, Sparkles, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";

export type Suggestion = {
  label: string;
  prompt: string;
  flow?: string;
  initialState?: Record<string, unknown>;
};

const OPTIONS: Suggestion[] = [
  { label: "Recommendations", prompt: "Recommend cupcakes for me", flow: "recommend" },
  { label: "Birthday cake", prompt: "I need a custom birthday cake", flow: "birthday", initialState: { step: 0 } },
  { label: "Eggless options", prompt: "Which eggless cupcakes do you recommend?" },
  { label: "Delivery", prompt: "What delivery options are available?" },
  { label: "Menu prices", prompt: "Show me cupcake prices" },
  { label: "Gift box", prompt: "Suggest a dessert gift box" },
];

const icons = [Sparkles, CakeSlice, HeartHandshake, Truck, Search, Gift];

export default function FirstScreen({
  onSuggestion,
}: {
  onSuggestion: (suggestion: Suggestion) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="rounded-lg border border-gold/25 bg-cream p-4 shadow-card">
        <p className="text-sm font-semibold text-espresso-900">
          Hi, I am Bindi&apos;s bakery assistant.
        </p>
        <p className="mt-1 text-xs leading-5 text-ink-muted">
          I can help with cupcakes, custom cakes, eggless desserts, allergens, delivery, prices, and order planning.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {OPTIONS.map((option, index) => {
          const Icon = icons[index] ?? Sparkles;
          return (
            <motion.button
              key={option.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => onSuggestion(option)}
              className="min-h-[68px] rounded-lg border border-espresso-100 bg-white p-3 text-left shadow-card transition hover:border-blush-rose/60 hover:bg-blush-light"
            >
              <Icon className="mb-2 h-4 w-4 text-blush-rose" aria-hidden="true" />
              <span className="block text-xs font-semibold leading-4 text-espresso-900">
                {option.label}
              </span>
            </motion.button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        {["Best chocolate cupcake?", "Today's special", "Nut-free?", "Order help"].map((prompt) => (
          <Button
            key={prompt}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onSuggestion({ label: prompt, prompt })}
            className="h-8 border-gold/30 text-xs"
          >
            {prompt}
          </Button>
        ))}
      </div>
    </motion.div>
  );
}
