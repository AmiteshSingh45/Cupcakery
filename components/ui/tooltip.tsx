"use client";

import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "./utils";

export function TooltipProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <TooltipPrimitive.Provider delayDuration={180}>{children}</TooltipPrimitive.Provider>;
}

export function Tooltip({
  children,
  content,
}: {
  children: React.ReactNode;
  content: string;
}) {
  return (
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          sideOffset={8}
          className={cn(
            "z-[80] rounded-md bg-espresso-900 px-3 py-2 text-xs font-medium text-cream shadow-luxury"
          )}
        >
          {content}
          <TooltipPrimitive.Arrow className="fill-espresso-900" />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}
