'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiSend } from 'react-icons/fi';
import FirstScreen from './FirstScreen';
import ChatMessage from './ChatMessage';
import GuidedFlow from './GuidedFlow';
import { useChatStore } from '@/lib/chatStore';

export default function ChatPanel({ onClose }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeFlow, setActiveFlow] = useState(null);
  const [flowState, setFlowState] = useState({});
  const [sessionId, setSessionId] = useState('');
  const messagesEndRef = useRef(null);

  // Initialize session
  useEffect(() => {
    const newSessionId = `session-${Date.now()}-${Math.random()}`;
    setSessionId(newSessionId);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleOptionSelect = (option) => {
    // User selected an option
    setMessages([
      ...messages,
      { type: 'user', content: option.label, timestamp: new Date() }
    ]);
    setActiveFlow(option.flow);
    setFlowState(option.initialState || {});
  };

  const handleFlowStep = (response, nextFlow = null, products = [], suggestions = []) => {
    setMessages([
      ...messages,
      { 
        type: 'ai', 
        content: response, 
        products: products || [],
        suggestions: suggestions || [],
        timestamp: new Date() 
      }
    ]);
    // Exit the flow after completion
    setActiveFlow(null);
    setFlowState({});
    if (nextFlow) {
      setActiveFlow(nextFlow);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = inputValue;
    setInputValue('');
    
    setMessages([
      ...messages,
      { type: 'user', content: userMessage, timestamp: new Date() }
    ]);

    setLoading(true);
    try {
      // Call frontend API which proxies to backend
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': sessionId,
        },
        body: JSON.stringify({
          message: userMessage,
          flowState,
          activeFlow
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Chat failed');
      }

      setMessages((prev) => [
        ...prev,
        {
          type: 'ai',
          content: data.message,
          products: data.products,
          suggestions: data.suggestions,
          timestamp: new Date()
        }
      ]);

      if (data.nextFlow) {
        setActiveFlow(data.nextFlow);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        {
          type: 'ai',
          content: 'Sorry, I encountered an issue. Please try again! 🍰',
          timestamp: new Date()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const panelVariants = {
    initial: { opacity: 0, x: 400 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.3, ease: 'easeOut' } },
    exit: { opacity: 0, x: 400, transition: { duration: 0.2, ease: 'easeIn' } }
  };

  return (
    <motion.div
      variants={panelVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="fixed bottom-8 right-8 z-50 w-96 max-w-[95vw] h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white p-4 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-lg">Bindi AI Dessert Concierge</h3>
          <p className="text-xs text-pink-100">Your sweet shopping assistant ✨</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/20 rounded-full transition-colors"
        >
          <FiX className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        <AnimatePresence mode="wait">
          {messages.length === 0 ? (
            <FirstScreen onOptionSelect={handleOptionSelect} />
          ) : (
            messages.map((msg, idx) => (
              <ChatMessage key={idx} message={msg} />
            ))
          )}
        </AnimatePresence>

        {/* Loading indicator */}
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-gray-600 text-sm"
          >
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
              <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            </div>
            <span>Bindi is thinking...</span>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Active Flow */}
      {activeFlow && (
        <GuidedFlow
          flow={activeFlow}
          state={flowState}
          onStepSubmit={handleFlowStep}
          onStateChange={setFlowState}
        />
      )}

      {/* Input Area */}
      {!activeFlow && (
        <div className="p-4 border-t bg-white">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about desserts... 🍰"
              className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:bg-white transition-all"
              disabled={loading}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={loading || !inputValue.trim()}
              className="p-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full hover:shadow-lg transition-all disabled:opacity-50"
            >
              <FiSend className="w-5 h-5" />
            </motion.button>
          </form>
        </div>
      )}
    </motion.div>
  );
}
