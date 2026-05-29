import axios from 'axios';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function POST(request) {
  try {
    const { query } = await request.json();

    if (!query) {
      return Response.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    // Call backend search API
    const response = await axios.post(`${BACKEND_URL}/api/chat/search`, {
      query,
    });

    return Response.json(response.data);
  } catch (error) {
    console.error('Search API error:', error);

    return Response.json(
      {
        message: 'Let me search for that again... 🔍',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
