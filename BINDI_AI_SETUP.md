# 🍰 Bindi AI Dessert Concierge - Setup Guide

## Overview

This is a premium floating AI chatbot widget integrated into your Cupcakery ecommerce website. It provides personalized dessert recommendations through guided flows and LLM-powered conversations.

## Components Created

### Frontend Components
- ✅ `BindiChatButton.js` - Floating button with pulse animation
- ✅ `ChatPanel.js` - Main chat panel with session management
- ✅ `FirstScreen.js` - Initial menu with 9 predefined options
- ✅ `ChatMessage.js` - Message display component
- ✅ `ProductCardInChat.js` - Rich product recommendation cards
- ✅ `GuidedFlow.js` - Multi-step guided conversation flows

### Backend Services
- ✅ `langchainService.js` - LangChain setup and LLM integration
- ✅ `ragService.js` - MongoDB retrieval for product context
- ✅ `recommendationEngine.js` - Specialized recommendation flows
- ✅ `chatController.js` - Main chat logic
- ✅ `chatRoutes.js` - API endpoint definitions

### API Routes
- ✅ `/api/chat` - Main chat endpoint (Next.js)
- ✅ `/api/chat/recommendations` - Flow-based recommendations
- ✅ `/api/chat/search` - Product search

## Guided Flows Implemented

1. **🎂 Birthday Planning** - Multi-step flow for recipient, budget, flavor
2. **🎉 Party Planning** - Guest count, event type, variety selection
3. **💝 Gift Suggestions** - Curated gift-worthy desserts
4. **🍫 Comfort Desserts** - Mood-based comfort food recommendations
5. **⭐ Best Sellers** - Top-rated products
6. **🔥 Trending** - Recently popular items
7. **🍰 Recommend** - General recommendations
8. **🔍 Search** - Natural language product search

## Setup Instructions

### 1. Install Dependencies

```bash
# Frontend
cd Cupcakery
npm install zustand

# Backend
cd Backend
npm install @langchain/core @langchain/openai @langchain/anthropic @langchain/community langchain
```

### 2. Configure Environment Variables

**Backend** (`Backend/.env`):
```env
# Existing config...

# AI Configuration
OPENAI_API_KEY=sk-your-openai-key-here
CLAUDE_API_KEY=sk-ant-your-claude-key-here
LLM_MODEL=gpt-4-turbo
CHAT_MEMORY_LIMIT=10
USE_CLAUDE=false  # Set to true to use Claude instead of OpenAI
```

**Frontend** (`.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
# For production: https://your-backend-url.com
```

### 3. Get API Keys

**OpenAI** (Recommended for GPT-4):
1. Go to [platform.openai.com](https://platform.openai.com)
2. Create account or login
3. Navigate to API keys
4. Create new secret key
5. Copy to `OPENAI_API_KEY`

**Anthropic** (Optional - Claude):
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create account
3. Get API key
4. Copy to `CLAUDE_API_KEY`

### 4. Start Development

**Terminal 1 - Backend:**
```bash
cd Backend
npm run server
# Listens on http://localhost:4000
```

**Terminal 2 - Frontend:**
```bash
cd Cupcakery
npm run dev
# Listens on http://localhost:3000
```

**Or run both together:**
```bash
npm run bindi
```

### 5. Test the Chatbot

1. Visit http://localhost:3000
2. Click the floating button in bottom-right (🍰)
3. Try clicking "🎂 Birthday Planning"
4. Follow the guided flow
5. Get AI-powered recommendations with products!

## Features

### 🎨 UI/UX
- Premium gradient design with pink/rose theme
- Smooth animations using Framer Motion
- Responsive design (desktop + mobile)
- Loading indicators and typing effects
- Toast notifications for actions

### 🤖 AI Intelligence
- LangChain-powered conversations
- MongoDB RAG for product context
- Memory management (last 10 messages)
- Smart intent detection
- Price-aware recommendations

### 📦 Product Integration
- Rich product cards with images
- Ratings and reviews display
- Quick add-to-cart
- Product preview links
- "Why this pick" explanations

### 🎯 Guided Flows
- Multi-step conversational UX
- Progress indicators
- Context-aware recommendations
- Flow-specific messages

## Key Code Files

### Frontend
- [BindiChatButton.js](../components/chat/BindiChatButton.js) - Entry point
- [ChatPanel.js](../components/chat/ChatPanel.js) - Main container
- [GuidedFlow.js](../components/chat/GuidedFlow.js) - Flow definitions
- [lib/chatStore.js](../lib/chatStore.js) - Zustand state management

### Backend
- [langchainService.js](../Backend/Services/langchainService.js) - LLM setup
- [ragService.js](../Backend/Services/ragService.js) - Product retrieval
- [recommendationEngine.js](../Backend/Services/recommendationEngine.js) - Flow logic
- [chatController.js](../Backend/Controllers/chatController.js) - Main logic
- [chatRoutes.js](../Backend/Routes/chatRoutes.js) - Endpoints

## Customization

### Change Theme Colors
Edit Tailwind classes in components. Currently using `pink-500` and `rose-500`.

### Add New Flows
1. Add flow definition to `GuidedFlow.js`
2. Create recommendation function in `recommendationEngine.js`
3. Add case in `chatController.js`
4. Update `FirstScreen.js` with new option

### Modify AI Personality
Edit `SYSTEM_PROMPT` in `langchainService.js` to change tone/behavior.

### Add Chat History Persistence
Currently stores in memory. For production:
1. Use Redis or MongoDB for sessions
2. Update `chatMemories` Map in `chatController.js`

## API Endpoints

### POST `/api/chat/chat`
Main chat endpoint
```json
{
  "message": "User message",
  "sessionId": "session-unique-id",
  "flowState": {},
  "activeFlow": "birthday"
}
```

### POST `/api/chat/recommendations`
Get flow-based recommendations
```json
{
  "type": "birthday",
  "flowState": {
    "recipient": "Girlfriend",
    "budget": "₹1000",
    "flavor": "Chocolate"
  }
}
```

### POST `/api/chat/search`
Search products
```json
{
  "query": "chocolate cupcakes under 500"
}
```

## Troubleshooting

**"API key not working"**
- Verify key is correct in `.env`
- Check API key has proper permissions
- Ensure API key isn't expired/revoked

**"Products not showing"**
- Verify MongoDB is connected (Backend logs)
- Check `ProductModels` has text index
- Ensure products exist in database

**"Chat not responding"**
- Check backend logs: `npm run server`
- Verify `BACKEND_URL` in frontend `.env.local`
- Check CORS settings allow frontend origin

**"Guided flows not working"**
- Verify flow definitions in `GuidedFlow.js`
- Check flow state is being passed correctly
- Monitor API response in browser DevTools

## Performance Notes

- Chat memory limited to 10 messages (configure with `CHAT_MEMORY_LIMIT`)
- Product retrieval capped at 5 items per query
- Recommendations generated on-demand
- All animations GPU-accelerated with Framer Motion

## Security Considerations

- API keys are backend-only (never expose to frontend)
- Session IDs are generated client-side (use auth tokens in production)
- Input validation on both frontend and backend
- Rate limiting recommended for production (add express-rate-limit)

## Next Steps for Production

1. ✅ Migrate chat memory to Redis/MongoDB
2. ✅ Add authentication check
3. ✅ Implement rate limiting
4. ✅ Add error logging/monitoring
5. ✅ Create admin dashboard for chat analytics
6. ✅ Add chat handoff to human support
7. ✅ Implement chat export/save functionality
8. ✅ Add multi-language support

## Support

For issues or questions, check:
- Backend logs: Terminal running `npm run server`
- Frontend logs: Browser DevTools Console
- Recommendation engine debug: Check `recommendationEngine.js`

---

**Made with ❤️ for Bindi's Cupcakery** 🍰✨
