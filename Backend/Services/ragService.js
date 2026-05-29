import ProductModels from '../Models/ProductModels.js';
import ReviewModels from '../Models/reveiwModel.js';

export const searchProductsByQuery = async (query, limit = 5) => {
  try {
    // Search in product name, description, and category
    const products = await ProductModels.find({
      $text: { $search: query },
    })
      .select('_id name price image category description rating reviews')
      .limit(limit)
      .lean();

    return products;
  } catch (error) {
    console.error('Product search error:', error);
    return [];
  }
};

export const searchProductsByCategory = async (category, limit = 5) => {
  try {
    const products = await ProductModels.find({
      category: { $regex: category, $options: 'i' },
    })
      .select('_id name price image category description rating reviews')
      .limit(limit)
      .lean();

    return products;
  } catch (error) {
    console.error('Category search error:', error);
    return [];
  }
};

export const searchProductsByPriceRange = async (minPrice, maxPrice, limit = 5) => {
  try {
    const products = await ProductModels.find({
      price: { $gte: minPrice, $lte: maxPrice },
    })
      .select('_id name price image category description rating reviews')
      .sort({ rating: -1 })
      .limit(limit)
      .lean();

    return products;
  } catch (error) {
    console.error('Price search error:', error);
    return [];
  }
};

export const getBestSellers = async (limit = 5) => {
  try {
    const products = await ProductModels.find({ isFeatured: true })
      .select('_id name price image category description rating reviews')
      .sort({ rating: -1, 'reviews.length': -1 })
      .limit(limit)
      .lean();

    return products;
  } catch (error) {
    console.error('Best sellers error:', error);
    return [];
  }
};

export const getTrendingProducts = async (limit = 5) => {
  try {
    // Products with highest ratings in the last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const products = await ProductModels.find({
      createdAt: { $gte: thirtyDaysAgo },
    })
      .select('_id name price image category description rating reviews')
      .sort({ rating: -1 })
      .limit(limit)
      .lean();

    return products;
  } catch (error) {
    console.error('Trending products error:', error);
    return [];
  }
};

export const getProductsByKeywords = async (keywords, limit = 5) => {
  try {
    const query = { $or: [] };
    
    keywords.forEach(keyword => {
      query.$or.push({
        name: { $regex: keyword, $options: 'i' },
      });
      query.$or.push({
        category: { $regex: keyword, $options: 'i' },
      });
      query.$or.push({
        description: { $regex: keyword, $options: 'i' },
      });
    });

    const products = await ProductModels.find(query)
      .select('_id name price image category description rating reviews')
      .sort({ rating: -1 })
      .limit(limit)
      .lean();

    return products;
  } catch (error) {
    console.error('Keyword search error:', error);
    return [];
  }
};

export const getProductReviews = async (productId, limit = 3) => {
  try {
    const reviews = await ReviewModels.find({ product: productId })
      .select('rating comment user')
      .limit(limit)
      .lean();

    return reviews;
  } catch (error) {
    console.error('Reviews fetch error:', error);
    return [];
  }
};

export const getProductsWithSimilarFlavors = async (flavor, limit = 5) => {
  try {
    const products = await ProductModels.find({
      $text: { $search: flavor },
    })
      .select('_id name price image category description rating reviews')
      .limit(limit)
      .lean();

    return products;
  } catch (error) {
    console.error('Flavor search error:', error);
    return [];
  }
};

// Build context string from products for LLM
export const buildProductContext = (products) => {
  if (!products || products.length === 0) {
    return 'No matching products found.';
  }

  return products
    .map(
      (p) => `
- ${p.name} (₹${p.price}) - ${p.category}
  Rating: ${p.rating}/5 (${p.reviews?.length || 0} reviews)
  ${p.description?.substring(0, 100) || ''}...
`
    )
    .join('\n');
};
