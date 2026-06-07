const AI_BACKEND_URL = process.env.AI_BACKEND_URL || 'http://localhost:8000';

export async function POST(request) {
  try {
    const { query } = await request.json();

    if (!query) {
      return Response.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    const response = await fetch(`${AI_BACKEND_URL}/graphql`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          query MenuSearch($query: String!) {
            cupcakes(query: $query) {
              id name slug category price image rating reviews shortDescription whyPick
            }
          }
        `,
        variables: { query },
      }),
      cache: 'no-store',
    });

    const data = await response.json();
    if (!response.ok || data.errors?.length) {
      throw new Error(data.errors?.[0]?.message || 'Search service failed');
    }

    return Response.json({
      message: data.data.cupcakes.length
        ? 'Here are the closest cupcake matches from Bindi Cupcakery.'
        : 'I could not find a close cupcake match. Try chocolate, vanilla, red velvet, or eggless.',
      products: data.data.cupcakes,
      suggestions: ['Chocolate cupcakes', 'Eggless cupcakes', 'Custom cake'],
    });
  } catch (error) {
    console.error('Search API error:', error);

    return Response.json(
      {
        message: 'Let me search for that again. Try a flavor like chocolate, vanilla, red velvet, or Biscoff.',
        products: [],
        suggestions: ['Chocolate cupcakes', 'Vanilla cupcakes', 'Red velvet cake'],
        error: error.message,
      },
      { status: 200 }
    );
  }
}
