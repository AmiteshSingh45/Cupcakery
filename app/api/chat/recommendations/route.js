const AI_BACKEND_URL = process.env.AI_BACKEND_URL || 'http://localhost:8000';

export async function POST(request) {
  try {
    const { type, flowState } = await request.json();

    if (!type) {
      return Response.json(
        { error: 'Recommendation type is required' },
        { status: 400 }
      );
    }

    const response = await fetch(`${AI_BACKEND_URL}/graphql`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          query Recommendations($input: RecommendationInput!) {
            recommendations(input: $input) {
              message
              products { id name slug category price image rating reviews shortDescription whyPick }
              suggestions
              provider
            }
          }
        `,
        variables: { input: { type, flowState } },
      }),
      cache: 'no-store',
    });

    const data = await response.json();
    if (!response.ok || data.errors?.length) {
      throw new Error(data.errors?.[0]?.message || 'Recommendation service failed');
    }

    return Response.json(data.data.recommendations);
  } catch (error) {
    console.error('Recommendations API error:', error);

    return Response.json(
      {
        message: 'Let me find something special for you: Belgian Chocolate Cloud Cupcake, Vanilla Bean Confetti Cupcake, or a mixed cupcake box are reliable crowd-pleasers.',
        products: [],
        suggestions: ['Chocolate cupcakes', 'Birthday cake', 'Eggless cupcakes'],
        error: error.message,
      },
      { status: 200 }
    );
  }
}
