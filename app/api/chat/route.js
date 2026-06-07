const AI_BACKEND_URL = process.env.AI_BACKEND_URL || 'http://localhost:8000';
const FALLBACK_SUGGESTIONS = [
  'Best chocolate cupcake?',
  'Custom birthday cake',
  'Cupcake prices',
  'Eggless cupcakes',
];

function fallbackReply(message) {
  const lower = String(message || '').toLowerCase();
  const bakeryWords = ['cupcake', 'cake', 'bakery', 'dessert', 'order', 'delivery', 'price', 'eggless', 'flavor', 'flavour'];
  const allowed = bakeryWords.some((word) => lower.includes(word));

  if (!allowed) {
    return {
      message: 'I specialize in cupcakes and bakery assistance. Ask me about our cupcakes, flavors, custom cakes, delivery, or orders!',
      products: [],
      suggestions: FALLBACK_SUGGESTIONS,
      provider: 'local-domain-guard',
    };
  }

  return {
    message: 'I can help with Bindi Cupcakery cupcakes, custom cakes, eggless desserts, delivery, prices, and order planning. Try asking for a flavor or occasion recommendation.',
    products: [],
    suggestions: FALLBACK_SUGGESTIONS,
    provider: 'local-bakery-fallback',
  };
}

async function postGraphQL(payload) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 18000);
  try {
    const response = await fetch(`${AI_BACKEND_URL}/graphql`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
      cache: 'no-store',
    });

    const data = await response.json();
    if (!response.ok || data.errors?.length) {
      throw new Error(data.errors?.[0]?.message || 'AI backend failed');
    }
    return data;
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(request) {
  let incomingMessage = '';
  try {
    const { message, flowState, activeFlow } = await request.json();
    incomingMessage = message;
    const sessionId = request.headers.get('x-session-id') || `session-${Date.now()}`;

    if (!message) {
      return Response.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const data = await postGraphQL({
      query: `
        mutation SendMessage($input: ChatInput!) {
          sendMessage(input: $input) {
            message
            products { id name slug category price image rating reviews shortDescription whyPick }
            suggestions
            provider
          }
        }
      `,
      variables: {
        input: { message, sessionId, flowState, activeFlow },
      },
    });

    return Response.json(data.data.sendMessage);
  } catch (error) {
    console.error('Chat API error:', error);

    return Response.json(
      fallbackReply(typeof incomingMessage === 'string' ? incomingMessage : ''),
      { status: 200 }
    );
  }
}
