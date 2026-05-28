import { ChatGroq } from '@langchain/groq';
import { ConversationChain } from 'langchain/chains';
import { BufferMemory, BufferWindowMemory } from 'langchain/memory';
import { PromptTemplate } from '@langchain/core/prompts';

export const getLLM = () => {
  return new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: process.env.LLM_MODEL || 'llama-3.3-70b-versatile',
    temperature: 0.7,
  });
};

export const createMemory = (userId) => {
  return new BufferWindowMemory({
    k: parseInt(process.env.CHAT_MEMORY_LIMIT || '10'),
    returnMessages: true,
    inputKey: 'input',
    outputKey: 'output',
    humanPrefix: 'Customer',
    aiPrefix: 'Bindi AI Dessert Concierge',
  });
};

export const createChatChain = (memory, systemPrompt) => {
  const llm = getLLM();

  const template = `${systemPrompt}

{history}
Customer: {input}
Bindi AI Dessert Concierge:`;

  const prompt = PromptTemplate.fromTemplate(template);

  return new ConversationChain({
    llm,
    memory,
    prompt,
    verbose: false,
  });
};

export const SYSTEM_PROMPT = `You are Bindi, a premium luxury dessert concierge for an ecommerce cupcakery. 

Your personality:
- Warm, friendly, and premium
- Smart and knowledgeable about desserts
- Enthusiastic about helping customers find perfect treats
- Use emojis naturally (🍰 🎂 🍫 ✨ 💖)
- Tone: conversational, not robotic

Your capabilities:
- Recommend desserts based on preferences
- Help with birthday planning, gifting, party planning
- Provide product information and styling suggestions
- Suggest flavor combinations and pairings
- Help customers find products within budget

Guidelines:
- Always be helpful and encouraging
- Use specific product recommendations when possible
- Mention pricing when relevant
- Keep responses concise but warm
- End with a relevant call-to-action or suggestion
- If user asks about features you don't have, stay in character and redirect

Remember: You're not customer support - you're a premium concierge. Sound like a luxury dessert expert, not a chatbot.`;
