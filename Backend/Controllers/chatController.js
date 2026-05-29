import {
  getLLM,
  createMemory,
  createChatChain,
  SYSTEM_PROMPT,
} from '../Services/langchainService.js';
import {
  recommendBirthdayDesserts,
  recommendPartyDesserts,
  recommendGiftDesserts,
  recommendComfortDesserts,
  handleSearchQuery,
  getTrendingRecommendations,
} from '../Services/recommendationEngine.js';
import {
  getBestSellers,
  getTrendingProducts,
} from '../Services/ragService.js';

// Store memory per session (in production, use Redis)
const chatMemories = new Map();

const getOrCreateMemory = (sessionId) => {
  if (!chatMemories.has(sessionId)) {
    chatMemories.set(sessionId, createMemory(sessionId));
  }
  return chatMemories.get(sessionId);
};

export const handleChat = async (req, res) => {
  try {
    const { message, sessionId, flowState, activeFlow } = req.body;

    if (!message || !sessionId) {
      return res.status(400).json({
        error: 'Missing message or sessionId',
      });
    }

    const memory = getOrCreateMemory(sessionId);

    // Handle guided flows first
    if (activeFlow && flowState) {
      let result = {};

      switch (activeFlow) {
        case 'birthday':
          result = await recommendBirthdayDesserts(flowState);
          break;
        case 'party':
          result = await recommendPartyDesserts(flowState);
          break;
        case 'gifts':
          result = await recommendGiftDesserts();
          break;
        case 'comfort':
          result = await recommendComfortDesserts(flowState);
          break;
        case 'bestsellers':
          result = {
            message: '⭐ Our best-selling favorites that customers absolutely love!',
            products: await getBestSellers(5),
          };
          break;
        case 'trending':
          result = await getTrendingRecommendations();
          break;
        case 'search':
          result = await handleSearchQuery(message);
          break;
        case 'recommend':
          // Mood-based recommendations
          result = await recommendComfortDesserts(flowState);
          break;
        case 'design':
          result = {
            message: '✨ Our beautifully designed cakes are perfect for custom occasions! Let me show you our most stunning creations. 🎂',
            products: await getBestSellers(5),
          };
          break;
        default:
          result = { message: 'Let me help you find the perfect dessert! 🍰' };
      }

      return res.status(200).json({
        message: result.message,
        products: result.products || [],
        suggestions: result.suggestions || [],
      });
    }

    // Handle free-form conversation using LLM
    const chain = createChatChain(memory, SYSTEM_PROMPT);

    // Detect intent from user message
    const lowerMessage = message.toLowerCase();
    let detectedProducts = [];

    // Extract context
    if (
      lowerMessage.includes('chocolate') ||
      lowerMessage.includes('cocoa')
    ) {
      detectedProducts = await getBestSellers(4);
    } else if (
      lowerMessage.includes('trending') ||
      lowerMessage.includes('popular')
    ) {
      detectedProducts = await getTrendingProducts(4);
    }

    // Generate AI response
    const response = await chain.call({ input: message });

    // Build final message - extract output from response
    const aiMessage = response.output || response.text || response.response || response;

    res.status(200).json({
      message: aiMessage,
      products: detectedProducts,
      suggestions: [
        '🍰 Show me cupcakes',
        '💝 Gift suggestions',
        '🎂 Birthday planning',
      ],
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      error: 'Failed to process chat',
      message: 'Sorry, I encountered an issue. Please try again! 🍰',
    });
  }
};

export const getRecommendations = async (req, res) => {
  try {
    const { type, flowState } = req.body;

    let result = {};

    switch (type) {
      case 'birthday':
        result = await recommendBirthdayDesserts(flowState);
        break;
      case 'party':
        result = await recommendPartyDesserts(flowState);
        break;
      case 'gifts':
        result = await recommendGiftDesserts();
        break;
      case 'comfort':
        result = await recommendComfortDesserts(flowState);
        break;
      case 'bestsellers':
        result = {
          message: '⭐ Our best-selling favorites!',
          products: await getBestSellers(5),
        };
        break;
      case 'trending':
        result = await getTrendingRecommendations();
        break;
      case 'recommend':
        result = await recommendComfortDesserts(flowState);
        break;
      case 'design':
        result = {
          message: '✨ Our beautifully designed cakes are perfect for custom occasions!',
          products: await getBestSellers(5),
        };
        break;
      case 'search':
        result = await handleSearchQuery(flowState?.query || '');
        break;
      default:
        result = {
          message: 'Let me help you find something special! 🍰',
          products: await getBestSellers(5),
        };
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Recommendation error:', error);
    res.status(500).json({
      error: 'Failed to get recommendations',
      message: 'Let me try again... 🍰',
    });
  }
};

export const searchProducts = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Missing search query' });
    }

    const result = await handleSearchQuery(query);

    res.status(200).json(result);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      error: 'Failed to search products',
      message: 'Let me search for that again... 🔍',
    });
  }
};

export const clearChatHistory = async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (sessionId) {
      chatMemories.delete(sessionId);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Clear history error:', error);
    res.status(500).json({ error: 'Failed to clear chat history' });
  }
};
