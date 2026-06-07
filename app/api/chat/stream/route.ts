const AI_BACKEND_URL = process.env.AI_BACKEND_URL || "http://localhost:8000";

const encoder = new TextEncoder();

function bakeryFallbackLine(message: string) {
  const lower = message.toLowerCase();
  const bakeryWords = [
    "cupcake",
    "cake",
    "bakery",
    "dessert",
    "order",
    "delivery",
    "price",
    "eggless",
    "flavor",
    "flavour",
    "allergen",
  ];
  const isBakery = bakeryWords.some((word) => lower.includes(word));
  const fallbackMessage = isBakery
    ? "I can help with Bindi Cupcakery cupcakes, custom cakes, eggless desserts, prices, delivery, and order planning. Tell me your flavor, occasion, budget, or dietary preference."
    : "I specialize in cupcakes and bakery assistance. Ask me about our cupcakes, flavors, custom cakes, delivery, allergens, or orders!";

  return JSON.stringify({
    type: "final",
    message: fallbackMessage,
    products: [],
    suggestions: [
      "Best chocolate cupcake?",
      "Custom birthday cake",
      "Cupcake prices",
      "Eggless cupcakes",
    ],
    provider: "next-fallback",
  }) + "\n";
}

export async function POST(request: Request) {
  let message = "";
  try {
    const body = await request.json();
    message = String(body.message || "");
    const sessionId = request.headers.get("x-session-id") || `session-${Date.now()}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 24000);

    const upstream = await fetch(`${AI_BACKEND_URL}/api/chat/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-session-id": sessionId,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
      cache: "no-store",
    }).finally(() => clearTimeout(timeout));

    if (!upstream.ok || !upstream.body) {
      throw new Error("AI stream unavailable");
    }

    return new Response(upstream.body, {
      headers: {
        "Content-Type": "application/x-ndjson; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch {
    return new Response(encoder.encode(bakeryFallbackLine(message)), {
      headers: {
        "Content-Type": "application/x-ndjson; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
      },
    });
  }
}
