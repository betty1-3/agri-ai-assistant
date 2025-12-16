import { useState, useCallback } from 'react';
import { ChatMessage } from '../components/ChatPanel';

interface CollectedData {
  crop_type: string;
  land_size_hectares: string;
  start_date: string;
  location: { lat: number; lon: number; region: string };
  language: string;
}

type ChatStep = 0 | 1 | 2 | 3 | 4 | 5 | 6;

interface UseChatflowReturn {
  messages: ChatMessage[];
  currentStep: ChatStep;
  collectedData: Partial<CollectedData>;
  isProcessing: boolean;
  processUserInput: (input: string) => void;
  initializeChat: (location: { lat: number; lon: number; region: string }, language: string) => void;
}

const STEP_QUESTIONS = {
  1: 'What crop do you want to grow?',
  2: 'What is your land size in hectares?',
  3: 'What is the starting date of cultivation?',
};

export function useChatflow(): UseChatflowReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentStep, setCurrentStep] = useState<ChatStep>(0);
  const [collectedData, setCollectedData] = useState<Partial<CollectedData>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  const addMessage = useCallback((role: 'system' | 'user', message: string) => {
    const newMessage: ChatMessage = {
      id: `${Date.now()}-${Math.random()}`,
      role,
      message,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
    return newMessage;
  }, []);

  const initializeChat = useCallback(
    (location: { lat: number; lon: number; region: string }, language: string) => {
      setCollectedData({ location, language });
      addMessage('system', 'Welcome to AGRI AI.');
      setTimeout(() => {
        setCurrentStep(1);
        addMessage('system', STEP_QUESTIONS[1]);
      }, 1000);
    },
    [addMessage]
  );

  const processUserInput = useCallback(
    async (input: string) => {
      if (isProcessing || currentStep === 0 || currentStep > 5) return;

      setIsProcessing(true);
      addMessage('user', input);

      await new Promise((resolve) => setTimeout(resolve, 500));

      if (currentStep === 1) {
        setCollectedData((prev) => ({ ...prev, crop_type: input }));
        setTimeout(() => {
          setCurrentStep(2);
          addMessage('system', STEP_QUESTIONS[2]);
          setIsProcessing(false);
        }, 800);
      } else if (currentStep === 2) {
        const landSize = parseFloat(input);
        if (isNaN(landSize) || landSize <= 0) {
          addMessage('system', 'Please provide a valid land size in hectares (e.g., 2.5).');
          setIsProcessing(false);
          return;
        }
        setCollectedData((prev) => ({ ...prev, land_size_hectares: input }));
        setTimeout(() => {
          setCurrentStep(3);
          addMessage('system', STEP_QUESTIONS[3]);
          setIsProcessing(false);
        }, 800);
      } else if (currentStep === 3) {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(input)) {
          addMessage('system', 'Please provide a valid date in YYYY-MM-DD format (e.g., 2024-01-15).');
          setIsProcessing(false);
          return;
        }
        setCollectedData((prev) => ({ ...prev, start_date: input }));
        setTimeout(() => {
          setCurrentStep(4);
          confirmAndPredict({ ...collectedData, start_date: input } as CollectedData);
        }, 800);
      }
    },
    [currentStep, isProcessing, collectedData, addMessage]
  );

  const confirmAndPredict = async (data: CollectedData) => {
    const confirmationMsg = `Let me confirm:\n• Crop: ${data.crop_type}\n• Land size: ${data.land_size_hectares} hectares\n• Start date: ${data.start_date}\n\nGenerating AI-powered recommendations...`;
    addMessage('system', confirmationMsg);

    setCurrentStep(5);

    try {
      const response = await fetch('http://localhost:3001/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to get prediction');
      }

      const result = await response.json();

      setTimeout(() => {
        setCurrentStep(6);
        const resultMessage = formatPredictionResult(result);
        addMessage('system', resultMessage);
        setIsProcessing(false);
      }, 2000);
    } catch (error) {
      addMessage(
        'system',
        'Sorry, I encountered an error while generating predictions. Please try again later.'
      );
      setIsProcessing(false);
    }
  };

  const formatPredictionResult = (result: any): string => {
    const pred = result.prediction;
    return `${result.message}\n\n📊 Estimated Yield: ${pred.estimated_yield}\n💧 Water Requirement: ${pred.water_requirement}\n🌱 Fertilizer: ${pred.recommended_fertilizer}\n📅 Optimal Harvest: ${pred.optimal_harvest_date}\n✅ Success Probability: ${pred.success_probability}\n\nRecommendations:\n${pred.recommendations.map((r: string, i: number) => `${i + 1}. ${r}`).join('\n')}`;
  };

  return {
    messages,
    currentStep,
    collectedData,
    isProcessing,
    processUserInput,
    initializeChat,
  };
}
