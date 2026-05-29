'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

const FLOW_DEFINITIONS = {
  birthday: {
    steps: [
      {
        title: 'Who is it for?',
        buttons: ['Girlfriend', 'Boyfriend', 'Friend', 'Kids', 'Family', 'Office'],
        key: 'recipient',
      },
      {
        title: 'What is your budget?',
        buttons: ['₹500', '₹1000', '₹2000', 'Custom'],
        key: 'budget',
      },
      {
        title: 'Flavor preference?',
        buttons: ['Chocolate', 'Red Velvet', 'Vanilla', 'Fruit', 'Surprise Me'],
        key: 'flavor',
      },
    ],
  },
  party: {
    steps: [
      {
        title: 'How many guests?',
        buttons: ['10 people', '20 people', '50 people', '100+ people'],
        key: 'guestCount',
      },
      {
        title: 'Event type?',
        buttons: ['Office Party', 'Birthday', 'Wedding', 'Casual', 'Corporate'],
        key: 'eventType',
      },
      {
        title: 'Preferred variety?',
        buttons: ['Cupcakes', 'Cakes', 'Brownies', 'Mixed Box', 'Customized'],
        key: 'variety',
      },
    ],
  },
  recommend: {
    steps: [
      {
        title: 'What mood are you in?',
        buttons: ['Sweet & Indulgent', 'Light & Fruity', 'Rich & Decadent', 'Healthy Option', 'Classic'],
        key: 'mood',
      },
    ],
  },
  comfort: {
    steps: [
      {
        title: 'What type of comfort are you seeking?',
        buttons: ['Chocolate Lover', 'Creamy & Rich', 'Warm & Cozy', 'Nostalgic', 'All of Above'],
        key: 'comfortType',
      },
    ],
  },
};

export default function GuidedFlow({ flow, state, onStepSubmit, onStateChange }) {
  const [currentStep, setCurrentStep] = useState(state.step || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const flowDef = FLOW_DEFINITIONS[flow];

  if (!flowDef) return null;

  const step = flowDef.steps[currentStep];
  const isLastStep = currentStep === flowDef.steps.length - 1;

  const handleButtonClick = async (buttonValue) => {
    setIsSubmitting(true);
    const newState = {
      ...state,
      [step.key]: buttonValue,
      step: currentStep + 1,
    };

    onStateChange(newState);

    if (isLastStep) {
      // Submit the entire flow - trigger AI recommendations
      try {
        const response = await fetch('/api/chat/recommendations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: flow,
            flowState: newState,
          }),
        });

        const data = await response.json();
        onStepSubmit(data.message, null, data.products, data.suggestions);
      } catch (error) {
        console.error('Flow submission error:', error);
        onStepSubmit(
          `Let me find the perfect ${flow} options for you...`,
          null
        );
      }
    } else {
      // Move to next step
      setCurrentStep(currentStep + 1);
    }

    setIsSubmitting(false);
  };

  const buttonVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    whileHover: { scale: 1.05, boxShadow: '0 5px 15px rgba(236, 72, 153, 0.2)' },
    whileTap: { scale: 0.95 },
  };

  const containerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-t bg-white p-4 max-h-56 overflow-y-auto"
    >
      {/* Step Title */}
      <motion.h4
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-semibold text-gray-800 mb-3 text-sm flex items-center gap-2"
      >
        Step {currentStep + 1}/{flowDef.steps.length}
        <span className="text-xs font-normal text-gray-500">
          {step.title}
        </span>
      </motion.h4>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 h-1 rounded-full mb-4 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${((currentStep + 1) / flowDef.steps.length) * 100}%` }}
          transition={{ duration: 0.4 }}
          className="h-full bg-gradient-to-r from-pink-500 to-rose-500"
        />
      </div>

      {/* Buttons */}
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="grid grid-cols-2 gap-2"
      >
        {step.buttons.map((button, idx) => (
          <motion.button
            key={idx}
            variants={buttonVariants}
            whileHover="whileHover"
            whileTap="whileTap"
            onClick={() => handleButtonClick(button)}
            disabled={isSubmitting}
            className="p-2 rounded-lg bg-gradient-to-r from-pink-50 to-rose-50 border-2 border-pink-200 hover:border-pink-500 hover:bg-pink-100 text-sm font-semibold text-gray-800 transition-all disabled:opacity-50"
          >
            {button}
          </motion.button>
        ))}
      </motion.div>

      {/* Step Indicator */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-xs text-gray-500 text-center mt-3"
      >
        {isSubmitting ? '⏳ Processing...' : isLastStep ? '🎯 Last step!' : 'Next →'}
      </motion.p>
    </motion.div>
  );
}
