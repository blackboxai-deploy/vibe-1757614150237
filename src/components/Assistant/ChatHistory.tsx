'use client';

import { useEffect, useRef } from 'react';
import { ChatMessage } from '@/types/assistant';

interface ChatHistoryProps {
  messages: ChatMessage[];
  isListening: boolean;
  isProcessing: boolean;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({
  messages,
  isListening,
  isProcessing,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  };

  const getMessageIcon = (message: ChatMessage) => {
    if (message.type === 'user') {
      return message.isVoice ? '🎙️' : '💬';
    }
    return '🤖';
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-4 pb-3 border-b border-white/20">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          Conversación
        </h3>
        <div className="flex items-center gap-2 text-sm">
          <div className={`w-2 h-2 rounded-full ${
            isListening 
              ? 'bg-blue-500 animate-pulse' 
              : isProcessing 
                ? 'bg-yellow-500 animate-pulse'
                : 'bg-gray-400'
          }`} />
          <span className="text-gray-600 dark:text-gray-400">
            {isListening 
              ? 'Escuchando' 
              : isProcessing 
                ? 'Procesando'
                : 'Inactivo'}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
      >
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">🎤</div>
            <div className="text-gray-500 dark:text-gray-400 text-sm">
              No hay conversaciones aún.
              <br />
              Comienza hablando con el asistente.
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              {/* Avatar/Icon */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                message.type === 'user'
                  ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
                  : 'bg-purple-500/20 text-purple-600 dark:text-purple-400'
              }`}>
                {getMessageIcon(message)}
              </div>

              {/* Message Bubble */}
              <div className={`flex-1 max-w-[80%] ${
                message.type === 'user' ? 'text-right' : 'text-left'
              }`}>
                <div className={`inline-block px-4 py-2 rounded-2xl ${
                  message.type === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/30 dark:bg-black/30 text-gray-900 dark:text-white border border-white/20'
                }`}>
                  <div className="text-sm leading-relaxed">
                    {message.content}
                  </div>
                </div>
                
                {/* Timestamp and metadata */}
                <div className={`mt-1 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 ${
                  message.type === 'user' ? 'justify-end' : 'justify-start'
                }`}>
                  <span>{formatTime(message.timestamp)}</span>
                  {message.isVoice && (
                    <span className="text-blue-500 dark:text-blue-400">🎤</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}

        {/* Processing indicator */}
        {isProcessing && (
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center text-sm">
              🤖
            </div>
            <div className="flex-1">
              <div className="inline-block px-4 py-2 rounded-2xl bg-white/30 dark:bg-black/30 border border-white/20">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Pensando...
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer stats */}
      <div className="mt-4 pt-3 border-t border-white/20">
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          {messages.length} mensaje{messages.length !== 1 ? 's' : ''}
          {messages.length > 0 && (
            <>
              {' • '}
              {messages.filter(m => m.type === 'user').length} tuyos
              {' • '}
              {messages.filter(m => m.type === 'assistant').length} del asistente
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatHistory;