import express from 'express';
import {
  handleChat,
  getRecommendations,
  searchProducts,
  clearChatHistory,
} from '../Controllers/chatController.js';

const router = express.Router();

// Main chat endpoint
router.post('/chat', handleChat);

// Get recommendations based on type
router.post('/recommendations', getRecommendations);

// Search products
router.post('/search', searchProducts);

// Clear chat history
router.post('/clear-history', clearChatHistory);

export default router;
