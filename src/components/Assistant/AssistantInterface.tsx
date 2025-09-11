'use client';

import { useState, useEffect } from 'react';
import { ChatMessage, AssistantSettings } from '@/types/assistant';
import { ASSISTANT_CONFIG } from '@/lib/config';
import ChatHistory from './ChatHistory';
import VoiceControls from './VoiceControls';
import VoiceVisualizer from './VoiceVisualizer';
import ResponseDisplay from './ResponseDisplay';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { useAssistant } from '@/hooks/useAssistant';

const AssistantInterface = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [settings, setSettings] = useState<AssistantSettings>({
    theme: 'auto',
    voiceSettings: {
      rate: ASSISTANT_CONFIG.textToSpeech.defaultRate,
      pitch: ASSISTANT_CONFIG.textToSpeech.defaultPitch,
      volume: ASSISTANT_CONFIG.textToSpeech.defaultVolume,
      voice: null,
      language: ASSISTANT_CONFIG.textToSpeech.defaultLanguage,
    },
    enableVoiceResponse: true,
    enableNotifications: true,
    defaultLanguage: 'es',
    autoListen: false,
    wakeWord: 'Hey Siri',
  });

  // Custom hooks for speech functionality
  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
    error: speechError,
    isSupported: speechSupported,
  } = useSpeechRecognition();

  const {
    speak,
    isSpeaking,
    stop: stopSpeaking,
    isSupported: ttsSupported,
  } = useTextToSpeech(settings.voiceSettings);

  const {
    processCommand,
    isProcessing,
    currentResponse,
    error: assistantError,
  } = useAssistant();

  // Initialize greeting
  useEffect(() => {
    const initGreeting = () => {
      const greeting = ASSISTANT_CONFIG.personality.greetings[
        Math.floor(Math.random() * ASSISTANT_CONFIG.personality.greetings.length)
      ];
      
      const greetingMessage: ChatMessage = {
        id: `greeting-${Date.now()}`,
        type: 'assistant',
        content: greeting,
        timestamp: new Date(),
        isVoice: false,
      };

      setMessages([greetingMessage]);
      
      if (settings.enableVoiceResponse && ttsSupported) {
        speak(greeting);
      }
    };

    const timer = setTimeout(initGreeting, 1000);
    return () => clearTimeout(timer);
  }, [settings.enableVoiceResponse, ttsSupported, speak]);

  // Handle speech transcript changes
  useEffect(() => {
    if (transcript && transcript.trim()) {
      // Add user message when speech is detected
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        type: 'user',
        content: transcript,
        timestamp: new Date(),
        isVoice: true,
      };

      setMessages(prev => [...prev, userMessage]);
    }
  }, [transcript]);

  // Handle command processing
  useEffect(() => {
    const processUserCommand = async () => {
      if (transcript && transcript.trim() && !isListening) {
        try {
          const response = await processCommand(transcript);
          
          const assistantMessage: ChatMessage = {
            id: `assistant-${Date.now()}`,
            type: 'assistant',
            content: response,
            timestamp: new Date(),
            isVoice: false,
          };

          setMessages(prev => [...prev, assistantMessage]);
          
          if (settings.enableVoiceResponse && ttsSupported) {
            speak(response);
          }
        } catch (error) {
          console.error('Error processing command:', error);
          const errorMessage = ASSISTANT_CONFIG.personality.responses.error[
            Math.floor(Math.random() * ASSISTANT_CONFIG.personality.responses.error.length)
          ];
          
          const errorResponse: ChatMessage = {
            id: `error-${Date.now()}`,
            type: 'assistant',
            content: errorMessage,
            timestamp: new Date(),
            isVoice: false,
          };

          setMessages(prev => [...prev, errorResponse]);
        }
        
        resetTranscript();
      }
    };

    processUserCommand();
  }, [transcript, isListening, processCommand, settings.enableVoiceResponse, ttsSupported, speak, resetTranscript]);

  const handleStartListening = () => {
    if (!isListening && !isSpeaking) {
      startListening();
    }
  };

  const handleStopListening = () => {
    if (isListening) {
      stopListening();
    }
  };

  const handleToggleVoiceResponse = () => {
    setSettings(prev => ({
      ...prev,
      enableVoiceResponse: !prev.enableVoiceResponse,
    }));
  };

  const handleClearHistory = () => {
    setMessages([]);
    const greeting = ASSISTANT_CONFIG.personality.greetings[
      Math.floor(Math.random() * ASSISTANT_CONFIG.personality.greetings.length)
    ];
    
    const greetingMessage: ChatMessage = {
      id: `greeting-${Date.now()}`,
      type: 'assistant',
      content: greeting,
      timestamp: new Date(),
      isVoice: false,
    };

    setMessages([greetingMessage]);
  };

  if (!speechSupported || !ttsSupported) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
          <div className="text-red-600 dark:text-red-400 text-xl mb-2">⚠️</div>
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">
            Funcionalidad no soportada
          </h3>
          <p className="text-red-700 dark:text-red-400">
            Tu navegador no soporta las APIs de reconocimiento de voz necesarias para este asistente.
            Por favor, usa Chrome, Edge o Safari en un dispositivo compatible.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Assistant Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Voice Visualizer */}
          <div className="bg-white/20 dark:bg-black/20 backdrop-blur-sm rounded-3xl p-6 border border-white/30">
            <VoiceVisualizer 
              isListening={isListening}
              isSpeaking={isSpeaking}
              currentTranscript={transcript}
            />
          </div>

          {/* Voice Controls */}
          <div className="bg-white/20 dark:bg-black/20 backdrop-blur-sm rounded-3xl p-6 border border-white/30">
            <VoiceControls
              isListening={isListening}
              isSpeaking={isSpeaking}
              isProcessing={isProcessing}
              onStartListening={handleStartListening}
              onStopListening={handleStopListening}
              onToggleVoiceResponse={handleToggleVoiceResponse}
              enableVoiceResponse={settings.enableVoiceResponse}
              onClearHistory={handleClearHistory}
            />
          </div>

          {/* Current Response Display */}
          {(currentResponse || speechError || assistantError) && (
            <div className="bg-white/20 dark:bg-black/20 backdrop-blur-sm rounded-3xl p-6 border border-white/30">
              <ResponseDisplay
                response={currentResponse}
                isProcessing={isProcessing}
                error={speechError || assistantError}
              />
            </div>
          )}
        </div>

        {/* Chat History Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white/20 dark:bg-black/20 backdrop-blur-sm rounded-3xl p-6 border border-white/30 h-full">
            <ChatHistory 
              messages={messages}
              isListening={isListening}
              isProcessing={isProcessing}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssistantInterface;