import { useEffect, useState } from 'react';
import Header from './components/Header';
import VoiceOrb from './components/VoiceOrb';
import ChatPanel from './components/ChatPanel';
import VoiceControls from './components/VoiceControls';
import { useChatflow } from './hooks/useChatflow';
import { useVoice } from './hooks/useVoice';
import { useLocation, getDefaultLanguage } from './hooks/useLocation';

function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const { location, loading: locationLoading } = useLocation();
  const {
    messages,
    currentStep,
    isProcessing,
    processUserInput,
    initializeChat,
  } = useChatflow();

  const handleTranscript = (transcript: string) => {
    if (!isProcessing && currentStep >= 1 && currentStep <= 3) {
      processUserInput(transcript);
    }
  };

  const { voiceState, audioLevel, isSupported, startListening, stopListening, speak } =
    useVoice(handleTranscript);

  useEffect(() => {
    if (!locationLoading && location && !isInitialized) {
      const language = getDefaultLanguage(location.region);
      setTimeout(() => {
        initializeChat(location, language);
        setIsInitialized(true);
      }, 1000);
    }
  }, [location, locationLoading, isInitialized, initializeChat]);

  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'system' && voiceState === 'idle') {
        speak(lastMessage.message);
      }
    }
  }, [messages, speak, voiceState]);

  const handleSendText = (text: string) => {
    if (!isProcessing && currentStep >= 1 && currentStep <= 3) {
      processUserInput(text);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-green-950 text-green-50 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,197,94,0.1),transparent_50%)]" />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />

        <main className="flex-1 flex flex-col items-center justify-center gap-8 px-4 py-8">
          {locationLoading ? (
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent" />
              <p className="mt-4 text-green-300/60">Initializing AGRI AI...</p>
            </div>
          ) : (
            <>
              <VoiceOrb state={voiceState} audioLevel={audioLevel} />

              <div className="w-full max-w-4xl space-y-6">
                <ChatPanel messages={messages} />

                {currentStep >= 1 && currentStep <= 3 && (
                  <VoiceControls
                    isListening={voiceState === 'listening'}
                    isProcessing={isProcessing}
                    voiceSupported={isSupported}
                    onStartListening={startListening}
                    onStopListening={stopListening}
                    onSendText={handleSendText}
                  />
                )}

                {currentStep === 6 && (
                  <div className="text-center">
                    <p className="text-green-300/70 text-sm">
                      Thank you for using AGRI AI. Refresh to start a new consultation.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </main>

        <footer className="py-6 text-center text-green-400/40 text-sm">
          <p>AGRI AI - Your intelligent farming assistant</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
