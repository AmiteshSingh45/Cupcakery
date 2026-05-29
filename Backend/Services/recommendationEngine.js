import {
  searchProductsByPriceRange,
  getProductsByKeywords,
  getBestSellers,
  getTrendingProducts,
  getProductsWithSimilarFlavors,
} from './ragService.js';

const BUDGET_RANGES = {
  '₹500': { min: 0, max: 500 },
  '₹1000': { min: 501, max: 1000 },
  '₹2000': { min: 1001, max: 2000 },
  'custom': { min: 0, max: 10000 },
};

const FLAVOR_KEYWORDS = {
  'Chocolate': ['chocolate', 'cocoa', 'brownie', 'fudge'],
  'Red Velvet': ['red velvet'],
  'Vanilla': ['vanilla', 'classic'],
  'Fruit': ['strawberry', 'blueberry', 'fruit', 'berry'],
  'Surprise Me': [],
};

const COMFORT_KEYWORDS = {
  'Chocolate Lover': ['chocolate', 'cocoa', 'fudge'],
  'Creamy & Rich': ['cream', 'cheesecake', 'mousse'],
  'Warm & Cozy': ['chocolate', 'brownie', 'warm'],
  'Nostalgic': ['classic', 'traditional'],
  'All of Above': [],
};

export const recommendBirthdayDesserts = async (flowState) => {
  try {
    const { recipient, budget, flavor } = flowState;
    const budgetRange = BUDGET_RANGES[budget] || BUDGET_RANGES['₹1000'];
    const flavorKeywords = FLAVOR_KEYWORDS[flavor] || [];

    let products = [];

    if (flavorKeywords.length > 0) {
      products = await getProductsByKeywords(flavorKeywords, 5);
    } else {
      // Surprise Me - get best sellers
      products = await getBestSellers(5);
    }

    // Filter by budget
    products = products.filter(
      (p) => p.price >= budgetRange.min && p.price <= budgetRange.max
    );

    // Add context
    const recommendations = products.slice(0, 3).map((p) => ({
      ...p,
      whyPick: `Perfect for ${recipient}'s birthday! ${
        flavor !== 'Surprise Me' ? `Delicious ${flavor.toLowerCase()} flavor.` : 'Our curated choice for surprise!'
      }`,
    }));

    return {
      message: `🎂 I found the perfect birthday treats for ${recipient}! These ${flavor || 'delicious'} options are within your ₹${budget} budget.\n\nEach one is handcrafted with love and perfect for making birthdays sweeter! 💖`,
      products: recommendations,
      suggestions: [
        'Show me other flavors',
        'Increase my budget',
        'Add to cart',
      ],
    };
  } catch (error) {
    console.error('Birthday recommendation error:', error);
    return {
      message: 'Let me find some amazing birthday options for you! 🎂',
      products: [],
    };
  }
};

export const recommendPartyDesserts = async (flowState) => {
  try {
    const { guestCount, eventType, variety } = flowState;

    let products = [];

    if (variety === 'Mixed Box') {
      // Get a mix of different types
      products = await getBestSellers(6);
    } else if (variety === 'Customized') {
      // Get trending/popular items
      products = await getTrendingProducts(6);
    } else {
      // Get by variety category
      products = await getProductsByKeywords([variety.toLowerCase()], 6);
    }

    const guestCountNum = parseInt(guestCount) || 10;
    const perPersonSuggestion = Math.ceil(2 / (guestCountNum / 10)); // 2 items per 10 people

    const recommendations = products.slice(0, 4).map((p) => ({
      ...p,
      whyPick: `Great for ${eventType} parties! Perfect for sharing with ${guestCountNum} guests.`,
    }));

    return {
      message: `🎉 Perfect party picks for your ${eventType} event with ${guestCountNum} guests!\n\nI recommend ordering 2-3 items per 10 people. These beauties will be the talk of the party! 🎊`,
      products: recommendations,
      suggestions: [
        'Increase quantity',
        'See more options',
        'Customize order',
      ],
    };
  } catch (error) {
    console.error('Party recommendation error:', error);
    return {
      message: 'Let me find some amazing party options for you! 🎉',
      products: [],
    };
  }
};

export const recommendGiftDesserts = async () => {
  try {
    const products = await getBestSellers(5);

    const recommendations = products.slice(0, 4).map((p) => ({
      ...p,
      whyPick: 'A premium gift that shows you care! Perfect for any occasion.',
    }));

    return {
      message: `💝 Gift-worthy desserts that show you care!\n\nEach of these is beautifully packaged and perfect for gifting. Your loved ones will adore them! 🎁✨`,
      products: recommendations,
      suggestions: [
        'Add a gift message',
        'See more designs',
        'Check premium packaging',
      ],
    };
  } catch (error) {
    console.error('Gift recommendation error:', error);
    return {
      message: 'Let me find some beautiful gift options for you! 💝',
      products: [],
    };
  }
};

export const recommendComfortDesserts = async (flowState) => {
  try {
    const { comfortType } = flowState;
    const keywords = COMFORT_KEYWORDS[comfortType] || COMFORT_KEYWORDS['Chocolate Lover'];

    const products = keywords.length > 0 
      ? await getProductsByKeywords(keywords, 5)
      : await getBestSellers(5);

    const recommendations = products.slice(0, 3).map((p) => ({
      ...p,
      whyPick: `Perfect comfort treat! Nothing says comfort like this ${comfortType.toLowerCase()}.`,
    }));

    return {
      message: `🍫 Comfort desserts to warm your soul!\n\nThese treats are perfect for those moments when you need a little sweetness in your life. Sending comfort your way! 💖`,
      products: recommendations,
      suggestions: [
        'Make it a combo',
        'Suggest other comfort treats',
        'Pre-order for tomorrow',
      ],
    };
  } catch (error) {
    console.error('Comfort recommendation error:', error);
    return {
      message: 'Let me find some comforting treats for you! 🍫',
      products: [],
    };
  }
};

export const handleSearchQuery = async (query) => {
  try {
    // Extract keywords and price hints from query
    const priceMatch = query.match(/₹(\d+)/);
    const keywords = query.toLowerCase().split(' ').filter((w) => w.length > 3);

    let products = [];

    if (priceMatch) {
      // Price-based search
      const price = parseInt(priceMatch[1]);
      products = await searchProductsByPriceRange(price - 200, price + 200, 5);
    } else {
      // Keyword-based search
      products = await getProductsByKeywords(keywords, 5);
    }

    const recommendations = products.slice(0, 4).map((p) => ({
      ...p,
      whyPick: 'Matches your search criteria perfectly!',
    }));

    return {
      message: `🔍 Found ${recommendations.length} amazing matches for "${query}"!\n\nThese are exactly what you're looking for. Let me know if you'd like more options! ✨`,
      products: recommendations,
      suggestions: ['Refine search', 'See more', 'Apply filters'],
    };
  } catch (error) {
    console.error('Search error:', error);
    return {
      message: 'Let me search for that for you... 🔍',
      products: [],
    };
  }
};

export const getTrendingRecommendations = async () => {
  try {
    const products = await getTrendingProducts(5);

    const recommendations = products.map((p) => ({
      ...p,
      whyPick: '🔥 Currently trending and customers love this!',
    }));

    return {
      message: `🔥 These are our hottest trending treats right now!\n\nCustomers are absolutely loving these! Don't miss out on the sweetness trend! 🍰`,
      products: recommendations.slice(0, 4),
      suggestions: ['See all trending', 'Personalize for me', 'Quick add to cart'],
    };
  } catch (error) {
    console.error('Trending error:', error);
    return {
      message: 'Let me show you our trending favorites! 🔥',
      products: [],
    };
  }
};
