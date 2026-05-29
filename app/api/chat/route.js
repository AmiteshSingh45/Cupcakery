import axios from 'axios';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function POST(request) {
  try {
    const { message, flowState, activeFlow } = await request.json();
    const sessionId = request.headers.get('x-session-id') || `session-${Date.now()}`;

    if (!message) {
      return Response.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Call backend chat API
    const response = await axios.post(`${BACKEND_URL}/api/chat/chat`, {
      message,
      sessionId,
      flowState,
      activeFlow,
    });

    return Response.json(response.data);
  } catch (error) {
    console.error('Chat API error:', error);

    return Response.json(
      {
        message: 'Sorry, I encountered an issue. Please try again! 🍰',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
