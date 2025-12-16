import { useEffect, useRef } from 'react';

export interface ChatMessage {
  id: string;
  role: 'system' | 'user';
  message: string;
  timestamp: Date;
}

interface ChatPanelProps {
  messages: ChatMessage[];
}

export default function ChatPanel({ messages }: ChatPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-green-500/20 shadow-2xl p-6 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-green-500/30 scrollbar-track-transparent">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-green-200/50 py-8">
              <p className="text-sm">Waiting for conversation to begin...</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                    msg.role === 'user'
                      ? 'bg-white/10 backdrop-blur-sm text-green-50 rounded-br-none'
                      : 'bg-green-500/20 backdrop-blur-sm text-green-100 rounded-bl-none border border-green-400/30'
                  }`}
                >
                  <p className="text-sm md:text-base leading-relaxed">{msg.message}</p>
                  <span className="text-xs text-green-200/60 mt-1 block">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
}
