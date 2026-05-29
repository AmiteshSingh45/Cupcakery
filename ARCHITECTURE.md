# 🏗️ Bindi AI Chatbot - Architecture & Data Flow

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    WEB BROWSER (Client)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │            Next.js Frontend (Port 3000)                 │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  App Layout                                             │  │
│  │    ↓                                                    │  │
│  │  BindiChatButton (Floating Button)                      │  │
│  │    ↓                                                    │  │
│  │  ChatPanel                                              │  │
│  │    ├─ FirstScreen (9 Options)                           │  │
│  │    ├─ ChatMessage (Render Messages)                     │  │
│  │    ├─ ProductCardInChat (Product Display)               │  │
│  │    ├─ GuidedFlow (Multi-step)                           │  │
│  │    └─ Input/Send Area                                   │  │
│  │                                                         │  │
│  │  State Management: Zustand Store (chatStore.js)         │  │
│  └──────────────────────────────────────────────────────────┘  │
│              ↓                  ↓                               │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │        Next.js API Routes (Same Server)                │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  - /api/chat (Main)              ↓ HTTP                │  │
│  │  - /api/chat/recommendations                           │  │
│  │  - /api/chat/search                                    │  │
│  └──────────────────────────────────────────────────────────┘  │
│              ↓                  ↓                               │
└──────────────┼──────────────────┼──────────────────────────────┘
               │ Network Request  │ (Port 4000)
               ↓                  ↓
┌─────────────────────────────────────────────────────────────────┐
│           Express.js Backend Server (Port 4000)                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Routes (chatRoutes.js)                                         │
│    ├─ POST /api/chat/chat                                       │
│    ├─ POST /api/chat/recommendations                            │
│    ├─ POST /api/chat/search                                     │
│    └─ POST /api/chat/clear-history                              │
│       ↓                                                         │
│  Controller (chatController.js)                                 │
│    ├─ handleChat()                                              │
│    ├─ getRecommendations()                                      │
│    ├─ searchProducts()                                          │
│    └─ clearChatHistory()                                        │
│       ↓                                                         │
│  ┌─────────────────┐  ┌──────────────────┐  ┌────────────────┐│
│  │ LangChain       │  │ Recommendation   │  │ RAG Service   ││
│  │ Service         │  │ Engine           │  │               ││
│  │                 │  │                  │  │ - Search      ││
│  │ - getLLM()      │→ │ - recommendBday  │  │ - Filter      ││
│  │ - createMemory()│  │ - recommendParty │  │ - Retrieve    ││
│  │ - createChain() │  │ - recommendGifts │  │ - Context     ││
│  │                 │  │ - getComfort()   │  │               ││
│  │ Memory Store    │  │ - searchQuery()  │→ │ MongoDB Calls ││
│  │ (per session)   │  │                  │  │               ││
│  └────────┬────────┘  └──────────┬───────┘  └─────┬──────────┘│
│           │                      │                │           │
│           └──────────────────────┼────────────────┘           │
│                                  ↓                            │
│  ┌────────────────────────────────────────────────────────────┐
│  │         LLM APIs (External - OpenAI/Claude)               │
│  │                                                            │
│  │  OpenAI: https://api.openai.com/v1/chat/completions      │
│  │  Claude: https://api.anthropic.com/v1/messages           │
│  └────────────────────────────────────────────────────────────┘
│           ↑
│           │ (Uses LangChain)
└───────────┴─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│              MongoDB Atlas (Cloud Database)                      │
├─────────────────────────────────────────────────────────────────┤
│  Collections:                                                   │
│  - products (name, price, image, category, rating, reviews)    │
│  - reviews (product_id, user, rating, comment)                 │
│  - categories                                                  │
│  - [other collections for orders, users, etc.]                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Message Flow Diagram

### User Sends Message

```
1. User Type Message
   └─→ Input Field (ChatPanel.js)
       └─→ State: inputValue

2. User Clicks Send
   └─→ handleSendMessage()
       └─→ Add to messages state
       └─→ Disable input (loading)

3. Frontend → API
   └─→ POST /api/chat
       {
         message: "hello",
         sessionId: "session-123",
         flowState: {},
         activeFlow: null
       }

4. Next.js Routes
   └─→ app/api/chat/route.js
       └─→ Verify data
       └─→ Add headers
       └─→ Call Backend: POST http://localhost:4000/api/chat/chat

5. Express Backend (chatController.js)
   └─→ handleChat()
       ├─→ Check activeFlow
       │   ├─ If flow exists: Call recommendationEngine
       │   └─ If no flow: Use LangChain for free-form chat
       ├─→ Generate AI response
       ├─→ Search for relevant products (RAG)
       └─→ Return: { message, products, suggestions }

6. Response → Frontend
   └─→ app/api/chat/route.js (returns response)
       └─→ ChatPanel.js (handleSendMessage)
           └─→ Add AI message to state
           └─→ Render ChatMessage components
           └─→ Display ProductCardInChat if products
           └─→ Enable input again

7. UI Updates
   └─→ Framer Motion animations
       └─→ Messages fade in
       └─→ Products slide in
       └─→ Scroll to bottom
```

---

## Guided Flow Diagram

### Birthday Planning Example

```
User Click: "🎂 Birthday Planning"
         ↓
    setActiveFlow("birthday")
    setFlowState({})
         ↓
┌─────────────────────────────────┐
│   GuidedFlow Component          │
│   Step 1/3                      │
├─────────────────────────────────┤
│  Question: "Who is it for?"     │
│  Options:                       │
│  - Girlfriend  (user clicks)    │
│  - Boyfriend                    │
│  - Friend                       │
│  - Kids                         │
│  - Family                       │
│  - Office                       │
└─────────────────────────────────┘
         ↓
    flowState = { recipient: "Girlfriend", step: 1 }
    currentStep = 1
         ↓
┌─────────────────────────────────┐
│   GuidedFlow Component          │
│   Step 2/3                      │
├─────────────────────────────────┤
│  Question: "What budget?"       │
│  Options:                       │
│  - ₹500                         │
│  - ₹1000 (user clicks)          │
│  - ₹2000                        │
│  - Custom                       │
└─────────────────────────────────┘
         ↓
    flowState = { 
      recipient: "Girlfriend", 
      budget: "₹1000",
      step: 2 
    }
    currentStep = 2
         ↓
┌─────────────────────────────────┐
│   GuidedFlow Component          │
│   Step 3/3 (Last)               │
├─────────────────────────────────┤
│  Question: "Flavor?"            │
│  Options:                       │
│  - Chocolate (user clicks)      │
│  - Red Velvet                   │
│  - Vanilla                      │
│  - Fruit                        │
│  - Surprise Me                  │
└─────────────────────────────────┘
         ↓
    handleButtonClick("Chocolate")
         ↓
    POST /api/chat/recommendations
    {
      type: "birthday",
      flowState: {
        recipient: "Girlfriend",
        budget: "₹1000",
        flavor: "Chocolate",
        step: 3
      }
    }
         ↓
    Backend: recommendationEngine.recommendBirthdayDesserts()
    ├─ Filter products by budget (₹1000)
    ├─ Filter by flavor (Chocolate)
    ├─ Get top 3 products
    └─ Add "whyPick" explanation
         ↓
    Response:
    {
      message: "🎂 I found perfect treats for Girlfriend...",
      products: [
        { name: "Chocolate Cupcakes", price: 950, ... },
        { name: "Choco Cake", price: 899, ... },
        ...
      ],
      suggestions: ["Show more", "Change budget"]
    }
         ↓
    ChatPanel renders:
    ├─ AI message
    ├─ 3 ProductCardInChat components
    └─ Suggestion buttons
         ↓
    User can:
    - Click "Add to Cart" on any product
    - Click "Preview" to see product page
    - Click "Show more" to continue chatting
```

---

## Data Flow for Product Recommendations

```
User Message: "Chocolate cupcakes under ₹500"
         ↓
chatController.handleChat()
         ↓
No activeFlow → Use LLM + RAG
         ↓
┌────────────────────────────────────────┐
│  LangChain Integration                 │
├────────────────────────────────────────┤
│  1. Create memory (if not exists)      │
│  2. Get or create chat chain           │
│  3. Add user message to memory         │
│  4. Call LLM with context              │
└────────────────────────────────────────┘
         ↓
┌────────────────────────────────────────┐
│  RAG Service (ragService.js)           │
├────────────────────────────────────────┤
│  Extract intent from message:          │
│  - Detect "chocolate" keyword          │
│  - Detect "₹500" price                 │
│                                        │
│  Call appropriate search function:     │
│  searchProductsByKeywords(             │
│    ["chocolate"],                      │
│    limit: 5                            │
│  )                                     │
│           ↓                            │
│  MongoDB Query:                        │
│  db.products.find({                    │
│    $text: { $search: "chocolate" }     │
│  }).limit(5)                           │
│           ↓                            │
│  Filter by price range:                │
│  products.filter(p =>                  │
│    p.price >= 0 &&                     │
│    p.price <= 500                      │
│  )                                     │
│           ↓                            │
│  Results: [Product1, Product2, ...]    │
└────────────────────────────────────────┘
         ↓
┌────────────────────────────────────────┐
│  Build Context for LLM                 │
├────────────────────────────────────────┤
│  buildProductContext(products):        │
│                                        │
│  Context String:                       │
│  "- Chocolate Cupcakes (₹450)...       │
│   - Choco Cake (₹400)...               │
│   - Dark Choco Brownie (₹300)..."      │
│                                        │
│  This is passed to LLM prompt          │
└────────────────────────────────────────┘
         ↓
┌────────────────────────────────────────┐
│  LLM Generates Response                │
├────────────────────────────────────────┤
│  Prompt includes:                      │
│  - System prompt (personality)         │
│  - Conversation history                │
│  - Product context                     │
│  - User message                        │
│                                        │
│  Output:                               │
│  "🍰 Found chocolate cupcakes under    │
│   ₹500! The Chocolate Cupcakes are     │
│   perfect..."                          │
└────────────────────────────────────────┘
         ↓
Response to User:
{
  message: "AI generated message",
  products: [Product1, Product2, ...],
  suggestions: ["More options", "Different price"]
}
```

---

## Component Interaction Diagram

```
app/layout.js (Root)
    │
    ├─→ BindiChatButton.js
    │       │
    │       ├─→ State: isOpen
    │       │
    │       ├─→ Render: Floating Button
    │       │   - Pulse animation
    │       │   - Click handler
    │       │
    │       └─→ Conditional: ChatPanel
    │           {isOpen && <ChatPanel />}
    │
    └─→ [Other app components...]

ChatPanel.js
    │
    ├─→ State:
    │   - messages: []
    │   - inputValue: ""
    │   - loading: false
    │   - activeFlow: null
    │   - flowState: {}
    │   - sessionId: "session-..."
    │
    ├─→ useEffect: Initialize sessionId
    │
    ├─→ Header
    │   └─→ Title + Close Button
    │
    ├─→ Message Container (Conditional)
    │   │
    │   ├─ if messages.length === 0
    │   │   └─→ FirstScreen.js
    │   │       - 9 Option cards
    │   │       - onOptionSelect → handleOptionSelect
    │   │
    │   └─ else
    │       └─→ map messages.map((msg) =>
    │           ChatMessage.js
    │           ├─ If msg.type === "user"
    │           │   - Pink gradient bubble
    │           │
    │           ├─ If msg.type === "ai"
    │           │   - Gray bubble
    │           │
    │           └─ If msg.products
    │               └─→ ProductCardInChat.js (multiple)
    │
    ├─→ GuidedFlow.js (Conditional)
    │   {activeFlow && <GuidedFlow ... />}
    │   - Shows current step
    │   - Option buttons
    │   - Progress bar
    │   - onStepSubmit → handleFlowStep
    │
    └─→ Input Area (Conditional)
        {!activeFlow && (
          <form onSubmit={handleSendMessage}>
            <input value={inputValue} />
            <button type="submit" />
          </form>
        )}

FirstScreen.js (Menu)
    │
    ├─→ OPTIONS array
    │   ├─ 🍰 Recommend Desserts
    │   ├─ 🎂 Birthday Planning
    │   ├─ 💝 Gift Suggestions
    │   ├─ 🍫 Comfort Desserts
    │   ├─ 🎉 Party Planning
    │   ├─ ✨ Cake Design
    │   ├─ 🔍 Search Products
    │   ├─ ⭐ Best Sellers
    │   └─ 🔥 Trending Desserts
    │
    └─→ onClick: onOptionSelect(option)
        └─→ setActiveFlow(option.flow)

GuidedFlow.js (Flow Handler)
    │
    ├─→ FLOW_DEFINITIONS
    │   ├─ birthday: [ step1, step2, step3 ]
    │   ├─ party: [ step1, step2, step3 ]
    │   ├─ recommend: [ step1 ]
    │   └─ comfort: [ step1 ]
    │
    ├─→ State: currentStep
    │
    ├─→ Display current step
    │   ├─ Title
    │   ├─ Progress bar
    │   └─ Option buttons
    │
    └─→ handleButtonClick(value)
        ├─ Update flowState
        ├─ if lastStep: POST /api/chat/recommendations
        └─ else: nextStep

ChatMessage.js (Individual Message)
    │
    ├─→ Props: message (user or ai)
    │
    ├─→ If user message
    │   └─ Pink gradient bubble, right-aligned
    │
    ├─→ If AI message
    │   └─ Gray bubble, left-aligned
    │
    └─→ If products: ProductCardInChat.js (multiple)

ProductCardInChat.js (Product Card)
    │
    ├─→ Props: product data
    │
    ├─→ Image with hover zoom
    ├─→ Rating stars
    ├─→ Price and discount
    ├─→ Category tag
    ├─→ Why pick explanation
    │
    └─→ Buttons:
        ├─ "Add to Cart" → handleAddToCart
        └─ "Preview" → Link to /products/{slug}
```

---

## State Management Flow

```
Zustand Store (lib/chatStore.js)
│
├─→ messages: []
├─→ isOpen: false
├─→ activeFlow: null
├─→ flowState: {}
│
├─→ addMessage(message)
├─→ clearMessages()
├─→ setOpen(isOpen)
├─→ setActiveFlow(flow)
├─→ setFlowState(state)
└─→ resetChat()

Usage in Components:
─────────────────────

ChatPanel.js:
  const { messages, addMessage } = useChatStore()
  // Component state takes precedence for UI
  // Store can be used for persistence

BindiChatButton.js:
  // Uses local state for isOpen
  // Could migrate to Zustand for persistence
```

---

## API Contract

### POST `/api/chat`

**Request:**
```json
{
  "message": "Show me chocolate cupcakes",
  "sessionId": "session-123456-abc",
  "flowState": {},
  "activeFlow": null
}
```

**Response Success:**
```json
{
  "message": "🍰 Found amazing chocolate cupcakes!",
  "products": [
    {
      "_id": "ObjectId",
      "name": "Chocolate Cupcakes",
      "price": 450,
      "image": "url",
      "category": "Cupcakes",
      "rating": 4.8,
      "reviews": 45,
      "whyPick": "Perfect match for your search!"
    }
  ],
  "suggestions": ["Show more", "Different flavor"]
}
```

**Response Error:**
```json
{
  "error": "Failed to process chat",
  "message": "Sorry, I encountered an issue. Please try again! 🍰"
}
```

---

## Deployment Architecture

### Production Setup

```
                           Internet
                              ↓
                   ┌──────────────────┐
                   │  Domain/DNS      │
                   │  example.com     │
                   └────────┬─────────┘
                            ↓
                  ┌─────────────────────┐
                  │   CDN (Vercel)      │
                  │                     │
                  │ Next.js Frontend    │
                  │ (Static + API)      │
                  │ - Port 443 (HTTPS)  │
                  └──────────┬──────────┘
                             │
                    ┌────────┴────────┐
                    │                 │
                    ↓                 ↓
            Static Files      API Routes
            (JS/CSS/Images)   /api/chat/*
                                   │
                                   │ HTTPS
                                   ↓
                  ┌──────────────────────────┐
                  │   Render/Railway Backend │
                  │                          │
                  │   Express.js Server      │
                  │   - Port 443 (HTTPS)     │
                  │   - Environment vars     │
                  │   - Rate limiting        │
                  │   - Error logging        │
                  └────────┬─────────────────┘
                           │
                    ┌──────┴──────┐
                    ↓             ↓
            MongoDB Atlas    LLM APIs
            (Database)       (OpenAI/Claude)
```

---

## Performance Optimization

```
Frontend Optimizations:
─────────────────────
- Framer Motion GPU acceleration
- Lazy component loading
- Message virtualization (for long chats)
- Product image lazy loading
- Zustand state batching

Backend Optimizations:
─────────────────────
- Connection pooling (MongoDB)
- Chat memory limit (10 messages)
- Product query limits (5 results)
- LLM response caching
- Text index on MongoDB

Deployment Optimizations:
────────────────────────
- CDN for static files (Vercel)
- GZIP compression
- HTTP/2 support
- ETag caching
- Rate limiting (express-rate-limit)
```

---

## Security Considerations

```
Frontend:
─────────
✓ No sensitive data in code
✓ API keys only in Backend
✓ HTTPS for all requests
✓ Input validation

Backend:
────────
✓ Environment variables for secrets
✓ CORS whitelist
✓ Rate limiting
✓ Input sanitization
✓ Error message sanitization

Database:
────────
✓ MongoDB Atlas with IP whitelist
✓ Connection string in env vars
✓ User roles and permissions
✓ Encrypted connections

Third-party:
────────────
✓ OpenAI API keys secured
✓ Unique per environment
✓ Rate limited per plan
✓ Monitored usage
```

---

This architecture is:
- ✅ Scalable (can add more products/features)
- ✅ Maintainable (clear separation of concerns)
- ✅ Performant (optimized queries, caching)
- ✅ Secure (API keys protected, CORS configured)
- ✅ Production-ready (error handling, logging)
