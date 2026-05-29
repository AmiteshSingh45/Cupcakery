# 🍰 Bindi AI Dessert Concierge - Quick Start

## 5-Minute Setup

### Step 1: Get API Keys (2 min)

**OpenAI (Recommended):**
1. Visit https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Copy the key

**Optional - Claude:**
1. Visit https://console.anthropic.com/api/keys
2. Create API key

### Step 2: Update Backend Configuration (1 min)

Edit `Backend/.env` and add:
```env
OPENAI_API_KEY=sk-your-key-here
# Optional:
# CLAUDE_API_KEY=sk-ant-your-key-here
# USE_CLAUDE=false
```

### Step 3: Install Dependencies (1 min)

```bash
# Frontend
cd Cupcakery
npm install zustand

# Backend
cd Backend
npm install
```

### Step 4: Run the Project (1 min)

**Option A - Single Command:**
```bash
npm run bindi
```

**Option B - Two Terminals:**
```bash
# Terminal 1
cd Backend && npm run server

# Terminal 2
cd Cupcakery && npm run dev
```

### Step 5: Test It! (Instantly)

1. Open http://localhost:3000
2. Look for the 🍰 button in bottom-right
3. Click it!
4. Try "🎂 Birthday Planning"
5. Follow the flow → See product recommendations!

---

## What Just Happened?

You now have a premium AI chatbot with:

✅ **Beautiful UI**
- Floating button with pulse animation
- Smooth side panel that slides in
- Luxury pink/rose gradient theme

✅ **9 Smart Flows**
- Birthday Planning
- Party Planning
- Gift Suggestions
- Comfort Desserts
- And 5 more!

✅ **AI-Powered Recommendations**
- Natural language understanding
- Context-aware product suggestions
- Rich product cards with images/ratings
- Add-to-cart functionality

✅ **Premium Experience**
- Smooth animations
- Loading indicators
- Multi-step guided conversations
- Premium luxury feel

---

## Customization Ideas

### Change Colors
Edit `components/chat/BindiChatButton.js` and replace:
- `from-pink-500` → your primary color
- `from-rose-500` → your secondary color

### Add More Flows
1. Open `components/chat/FirstScreen.js`
2. Add to OPTIONS array:
```javascript
{ label: '🎁 Your Label', flow: 'your_flow', icon: '🎁' }
```

3. Add flow definition in `components/chat/GuidedFlow.js`
4. Add recommendation logic in `Backend/Services/recommendationEngine.js`

### Change AI Personality
Edit `Backend/Services/langchainService.js` - modify `SYSTEM_PROMPT`:
```javascript
export const SYSTEM_PROMPT = `You are Bindi, a...
// Change this to customize tone/behavior
```

---

## Troubleshooting

### "Chatbot button not showing?"
- Verify import in `app/layout.js` includes `BindiChatButton`
- Check browser console for errors
- Restart dev server

### "API Key Error?"
- Verify key in `Backend/.env` is correct
- Make sure it's not expired or invalid
- Check you copied entire key (including `sk-` prefix)

### "No products showing?"
- Verify MongoDB is running
- Check Backend logs for connection errors
- Ensure products exist in `products` collection

### "Recommendations aren't working?"
- Check Backend terminal for error messages
- Verify LLM API key is working
- Try a simpler flow first (Best Sellers)

---

## Next Steps

1. **Test with your products**: Add real products to MongoDB
2. **Deploy**: Push to Vercel (frontend) + Render (backend)
3. **Enhance**: Add authentication, analytics, human handoff
4. **Scale**: Add Redis for session persistence

---

## File Overview

```
Cupcakery/
├── components/chat/          ← Chatbot UI components
│   ├── BindiChatButton.js    (floating button)
│   ├── ChatPanel.js          (main panel)
│   ├── FirstScreen.js        (menu options)
│   ├── GuidedFlow.js         (multi-step flows)
│   ├── ChatMessage.js        (message display)
│   └── ProductCardInChat.js  (product cards)
├── lib/chatStore.js           ← Zustand state
├── app/api/chat/              ← Next.js APIs
│   ├── route.js              (main chat)
│   ├── recommendations/route.js
│   └── search/route.js

Backend/
├── Services/
│   ├── langchainService.js   (LLM setup)
│   ├── ragService.js         (product retrieval)
│   └── recommendationEngine.js (recommendations)
├── Controllers/chatController.js
└── Routes/chatRoutes.js
```

---

## Common Questions

**Q: Can I use Claude instead of OpenAI?**
A: Yes! Set `USE_CLAUDE=true` and add `CLAUDE_API_KEY` in `.env`

**Q: Will my chat history be saved?**
A: Currently only last 10 messages in memory. For persistence, upgrade to Redis in production.

**Q: Can I customize the flows?**
A: Absolutely! Edit flow definitions in `GuidedFlow.js` and `recommendationEngine.js`

**Q: Does it work on mobile?**
A: Yes! Fully responsive - becomes a bottom-sheet modal on mobile.

**Q: Can customers add to cart from the chatbot?**
A: Yes! Each product card has an "Add to Cart" button.

---

## Deployment Checklist

- [ ] Update `NEXT_PUBLIC_API_URL` for production backend
- [ ] Add real API keys (not test keys)
- [ ] Test all flows with real products
- [ ] Add authentication if needed
- [ ] Enable CORS for production domain
- [ ] Set up error logging
- [ ] Test on mobile devices
- [ ] Deploy frontend to Vercel
- [ ] Deploy backend to Render/Railway

---

## Support Resources

- Setup guide: `BINDI_AI_SETUP.md`
- Component docs: Inside each component file
- LangChain docs: https://js.langchain.com
- Framer Motion: https://www.framer.com/motion

---

**You're all set! Enjoy your premium AI chatbot! 🍰✨**

Questions? Check the setup guide or component files for detailed comments.
