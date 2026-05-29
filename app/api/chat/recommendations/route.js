import axios from 'axios';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function POST(request) {
  try {
    const { type, flowState } = await request.json();

    if (!type) {
      return Response.json(
        { error: 'Recommendation type is required' },
        { status: 400 }
      );
    }

    // Call backend recommendations API
    const response = await axios.post(`${BACKEND_URL}/api/chat/recommendations`, {
      type,
      flowState,
    });

    return Response.json(response.data);
  } catch (error) {
    console.error('Recommendations API error:', error);

    return Response.json(
      {
        message: 'Let me find something special for you! 🍰',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
