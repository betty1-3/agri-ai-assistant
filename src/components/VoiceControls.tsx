import { Mic, MicOff, Send } from 'lucide-react';
import { useState } from 'react';

interface VoiceControlsProps {
  isListening: boolean;
  isProcessing: boolean;
  voiceSupported: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
  onSendText: (text: string) => void;
}

export default function VoiceControls({
  isListening,
  isProcessing,
  voiceSupported,
  onStartListening,
  onStopListening,
  onSendText,
}: VoiceControlsProps) {
  const [textInput, setTextInput] = useState('');

  const handleSend = () => {
    if (textInput.trim() && !isProcessing) {
      onSendText(textInput.trim());
      setTextInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-green-500/20 shadow-2xl p-6">
        <div className="flex items-center gap-4">
          {voiceSupported && (
            <button
              onClick={isListening ? onStopListening : onStartListening}
              disabled={isProcessing}
              className={`flex-shrink-0 p-4 rounded-2xl transition-all duration-300 ${
                isListening
                  ? 'bg-red-500/80 hover:bg-red-600/80 text-white'
                  : 'bg-green-500/80 hover:bg-green-600/80 text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl`}
              aria-label={isListening ? 'Stop listening' : 'Start listening'}
            >
              {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>
          )}

          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isProcessing}
            placeholder="Type your response..."
            className="flex-1 bg-white/5 border border-green-500/30 rounded-2xl px-6 py-4 text-green-50 placeholder-green-300/40 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          />

          <button
            onClick={handleSend}
            disabled={!textInput.trim() || isProcessing}
            className="flex-shrink-0 p-4 rounded-2xl bg-green-500/80 hover:bg-green-600/80 text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-300"
            aria-label="Send message"
          >
            <Send className="w-6 h-6" />
          </button>
        </div>

        {!voiceSupported && (
          <p className="mt-3 text-xs text-green-300/60 text-center">
            Voice input not supported in this browser. Use text input instead.
          </p>
        )}
      </div>
    </div>
  );
}
