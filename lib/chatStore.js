import { create } from 'zustand';

export const useChatStore = create((set) => ({
  messages: [],
  isOpen: false,
  activeFlow: null,
  flowState: {},

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, { ...message, id: Date.now() }],
    })),

  clearMessages: () => set({ messages: [] }),

  setOpen: (isOpen) => set({ isOpen }),

  setActiveFlow: (flow) => set({ activeFlow: flow }),

  setFlowState: (state) => set({ flowState: state }),

  resetChat: () =>
    set({
      messages: [],
      activeFlow: null,
      flowState: {},
    }),
}));
