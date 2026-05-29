# 🆘 Bindi AI Chatbot - Troubleshooting Guide

## Common Issues & Solutions

---

## 🔴 Chatbot Button Not Showing

### Issue
The floating button doesn't appear on the website.

### Solutions

**1. Check Import in Layout**
```javascript
// app/layout.js should have:
import BindiChatButton from "@/components/chat/BindiChatButton";
```
If missing, add it and restart dev server.

**2. Browser DevTools Check**
- Press F12 → Console
- Look for any errors about BindiChatButton
- Check Network tab for component file loading

**3. Restart Dev Server**
```bash
# Press Ctrl+C in terminal
# Then restart:
npm run dev
```

**4. Clear Cache**
```bash
# Delete Next.js cache
rm -rf .next

# Restart
npm run dev
```

---

## 🔴 "API Key Invalid" Error

### Issue
Chatbot works but shows API errors in console.

### Solutions

**1. Verify API Key Format**
```bash
# Should look like:
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxx

# NOT like:
OPENAI_API_KEY=sk-proj-  # Incomplete
OPENAI_API_KEY=my-key    # Wrong format
```

**2. Copy Key Correctly**
- Go to https://platform.openai.com/api-keys
- Click "Copy" button
- Make sure ENTIRE key copied (very long!)
- Paste to Backend/.env

**3. Check for Expiration**
- Log into OpenAI dashboard
- Verify API key hasn't been revoked
- Check usage isn't at quota limit

**4. Restart Backend**
```bash
# Ctrl+C in Backend terminal
npm run server
```

**5. Test API Key**
```bash
# In new terminal:
curl -H "Authorization: Bearer sk-your-key" \
  https://api.openai.com/v1/models
```

---

## 🔴 Chatbot Opens But No Response

### Issue
Clicking button works, but AI doesn't respond to messages.

### Solutions

**1. Check Backend Running**
```bash
# Terminal should show:
listening on PORT 4000
# or similar message

# If not running:
cd Backend
npm run server
```

**2. Verify Backend URL**
In `Frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
# NOT https for local development
```

**3. Check Browser Console**
- F12 → Console
- Send a message
- Look for error details
- Common: "Failed to fetch" = backend not running

**4. Check Backend Console**
- Look for error messages in Backend terminal
- Should show POST request logs

**5. Test Endpoint Directly**
```bash
curl -X POST http://localhost:4000/api/chat/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "hello",
    "sessionId": "test-123"
  }'
```

---

## 🔴 No Products Showing

### Issue
Chatbot responds but no product cards appear.

### Solutions

**1. Check MongoDB Connection**
```bash
# Backend terminal should show:
✓ MongoDB Connected
# or similar

# If not, verify MONGODB_URI in Backend/.env
```

**2. Verify Products Exist**
```bash
# Connect to MongoDB directly (in MongoDB Compass or via shell):
db.products.find().limit(5)

# Should return at least some products
```

**3. Create Text Index**
```javascript
// In MongoDB shell:
db.products.createIndex({ 
  name: "text", 
  description: "text",
  category: "text"
})
```

**4. Check Product Fields**
```javascript
// Each product should have:
{
  _id: ObjectId,
  name: "Product Name",
  price: 500,
  image: "url-or-path",
  category: "Cupcakes",
  description: "Product details",
  rating: 4.5,
  reviews: []
}
```

**5. Test Product Search**
```bash
curl -X POST http://localhost:4000/api/chat/search \
  -H "Content-Type: application/json" \
  -d '{"query": "chocolate"}'
```

---

## 🔴 Flows Not Working

### Issue
Click a flow option (like Birthday Planning) but nothing happens.

### Solutions

**1. Check Flow Definition**
In `components/chat/GuidedFlow.js`, verify the flow exists in `FLOW_DEFINITIONS`:
```javascript
const FLOW_DEFINITIONS = {
  birthday: { ... },  // Should have this
  // etc
}
```

**2. Check FirstScreen.js**
Verify flow name matches:
```javascript
// FirstScreen.js
{ label: '🎂 Birthday Planning', flow: 'birthday', ... }
//                                            ↑ must match
// GuidedFlow.js
FLOW_DEFINITIONS = {
  birthday: { ... }  // ← same name!
}
```

**3. Check Backend Recommendations**
```bash
curl -X POST http://localhost:4000/api/chat/recommendations \
  -H "Content-Type: application/json" \
  -d '{
    "type": "birthday",
    "flowState": {
      "recipient": "Girlfriend",
      "budget": "₹1000",
      "flavor": "Chocolate"
    }
  }'
```

**4. Debug Flow State**
- Open browser DevTools
- Go to Console
- Flows should log state at each step
- Look for any state-related errors

---

## 🔴 Animations Not Smooth

### Issue
Chatbot looks jerky or laggy.

### Solutions

**1. Check Hardware**
- Try on different computer
- Check CPU usage (Task Manager)
- Close other apps using GPU

**2. Reduce Animation Complexity**
Edit `BindiChatButton.js` - reduce animation delays:
```javascript
// Before: 0.3 second animations
// After: 0.15 second animations
transition: { duration: 0.15 }
```

**3. Check Browser**
- Try Chrome, Firefox, Safari
- Clear cache: Ctrl+Shift+Delete
- Disable extensions

**4. Update Framer Motion**
```bash
npm install framer-motion@latest
```

---

## 🔴 Build Errors

### Issue
`npm run build` fails

### Solutions

**1. TypeScript Errors**
```bash
# If you see TypeScript errors:
# Add this to jsconfig.json:
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

**2. Missing Components**
```bash
# Build fails on missing import
# Verify all import paths:
import BindiChatButton from "@/components/chat/BindiChatButton"
//                         ↑ must exist
```

**3. Clear Cache**
```bash
rm -rf .next node_modules
npm install
npm run build
```

---

## 🔴 Performance Issues

### Issue
Website slow when chatbot loaded

### Solutions

**1. Reduce Memory Limit**
```env
# Backend/.env
CHAT_MEMORY_LIMIT=5  # Instead of 10
```

**2. Cache Products**
Add caching to `ragService.js`:
```javascript
// Cache results for 1 hour
const cache = new Map();
const CACHE_TTL = 3600000;
```

**3. Lazy Load Chatbot**
```javascript
// Delay chatbot loading slightly
const BindiChatButton = dynamic(
  () => import("@/components/chat/BindiChatButton"),
  { ssr: false, loading: () => null }
);
```

**4. Optimize Images**
```javascript
// In ProductCardInChat.js
<img 
  src={product.image}
  alt={product.name}
  loading="lazy"
/>
```

---

## 🔴 CORS Issues

### Issue
"CORS error" in browser console

### Solutions

**1. Check Backend CORS**
In `Backend/Server.js`:
```javascript
const allowedOrigins = [
  "http://localhost:3000",  // ← should have this
  "https://yourdomain.com"   // ← add production domain
];
```

**2. Verify Proxy**
In `app/api/chat/route.js`, API call should go through:
```
Frontend → app/api/chat/route.js → Backend
↑ Frontend to Next.js ✅ (same origin, no CORS)
                ↑ Next.js to Backend ✅ (server-to-server, no CORS)
```

**3. Check Request Headers**
Browser console should show:
```
Access-Control-Allow-Origin: http://localhost:3000
```

---

## 🔴 MongoDB Connection Issues

### Issue
"Failed to connect to MongoDB"

### Solutions

**1. Verify Connection String**
```env
# Should have this format:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
```

**2. Check IP Whitelist**
- Go to MongoDB Atlas
- Network Access
- Add your IP address
- Or add 0.0.0.0/0 (allow all)

**3. Test Connection**
```bash
# In Backend terminal, add debug logging:
console.log("MONGODB_URI:", process.env.MONGODB_URI);

# Should show your connection string
```

**4. Wait for Connection**
```javascript
// In Controllers, wait for DB ready:
await ConnectDb();  // Already in Server.js
```

---

## 🔴 Environment Variables Not Loading

### Issue
`process.env.OPENAI_API_KEY` is undefined

### Solutions

**1. Restart Dev Server**
```bash
# Changes to .env don't auto-reload
# Press Ctrl+C and restart:
npm run server
```

**2. Check File Location**
```
Backend/.env  ← for Node/Express
.env.local    ← for Next.js frontend
```

**3. Verify Format**
```env
# Correct:
OPENAI_API_KEY=sk-...
OPENAI_API_KEY = sk-...  # Spaces OK

# Wrong:
OPENAI_API_KEY=         # Empty
# OPENAI_API_KEY=sk-...  # Commented out
```

**4. Frontend vs Backend**
```env
# Frontend (.env.local) - NEXT_PUBLIC_ prefix:
NEXT_PUBLIC_API_URL=http://localhost:4000

# Backend (Backend/.env) - no prefix:
OPENAI_API_KEY=sk-...
```

---

## 🟡 Debugging Tips

### Enable Logging

**Backend Debug Logs:**
```javascript
// In chatController.js
console.log("Request:", req.body);
console.log("Response:", result);
```

**Frontend Debug Logs:**
```javascript
// In ChatPanel.js
console.log("Message sent:", userMessage);
console.log("Response:", data);
```

### Browser DevTools

**Network Tab:**
1. Open DevTools (F12)
2. Click "Network" tab
3. Send message in chatbot
4. Look for `/api/chat` request
5. Click it → check Response

**Console Tab:**
- All errors logged here
- Search for "Chat" errors
- Check CORS warnings

### Backend Logs

Watch terminal for:
```
POST /api/chat/chat <- incoming request
✓ Recommendation found  ← success
✗ Error: API key invalid ← failure
```

---

## 🟡 Performance Monitoring

```javascript
// Add timing to components
console.time("Chat API");
const response = await fetch('/api/chat', ...);
console.timeEnd("Chat API");
// Shows: Chat API: 1234ms
```

---

## 📞 Still Having Issues?

### Check These Files

1. **BINDI_AI_SETUP.md** - Detailed setup guide
2. **BINDI_QUICK_START.md** - Quick reference
3. **Component files** - Each has inline comments
4. **Backend Services** - Each service documented

### Common File Paths

```
Make sure these exist:
✓ components/chat/BindiChatButton.js
✓ components/chat/ChatPanel.js
✓ lib/chatStore.js
✓ app/api/chat/route.js
✓ Backend/Services/langchainService.js
✓ Backend/Controllers/chatController.js
```

### Verify Configuration

```bash
# Frontend
cat .env.local | grep NEXT_PUBLIC_API_URL

# Backend
cat Backend/.env | grep OPENAI_API_KEY
cat Backend/.env | grep MONGODB_URI
```

---

## 🎯 Quick Test Checklist

- [ ] Button appears on homepage
- [ ] Button has pulse animation
- [ ] Clicking button opens panel
- [ ] Panel has header "Bindi AI Dessert Concierge"
- [ ] 9 option cards visible
- [ ] Can click an option
- [ ] Guided flow steps appear
- [ ] Can submit flow
- [ ] AI responds with message
- [ ] Product cards show (if products in DB)
- [ ] Send text message works
- [ ] Typing indicator appears
- [ ] No console errors

If all ✓, you're good to go! 🚀

---

**Need help?** Check the inline code comments in each file!
