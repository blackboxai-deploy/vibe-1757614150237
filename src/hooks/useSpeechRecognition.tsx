'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ASSISTANT_CONFIG } from '@/lib/config';

interface SpeechRecognitionHookReturn {
  isListening: boolean;
  transcript: string;
  confidence: number;
  error: string | null;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

declare var SpeechRecognition: {
  prototype: SpeechRecognition;
  new(): SpeechRecognition;
};

export const useSpeechRecognition = (): SpeechRecognitionHookReturn => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const finalTranscriptRef = useRef('');

  // Check if speech recognition is supported
  useEffect(() => {
    const SpeechRecognitionConstructor = 
      window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognitionConstructor) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognitionConstructor();
      
      if (recognitionRef.current) {
        // Configure speech recognition
        recognitionRef.current.continuous = ASSISTANT_CONFIG.speechRecognition.continuous;
        recognitionRef.current.interimResults = ASSISTANT_CONFIG.speechRecognition.interimResults;
        recognitionRef.current.lang = ASSISTANT_CONFIG.speechRecognition.language;
        recognitionRef.current.maxAlternatives = ASSISTANT_CONFIG.speechRecognition.maxAlternatives;

        // Event handlers
        recognitionRef.current.onstart = () => {
          setIsListening(true);
          setError(null);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
          setError(`Error de reconocimiento de voz: ${event.error}`);
          setIsListening(false);
          
          // Handle specific error cases
          switch (event.error) {
            case 'no-speech':
              setError('No se detectó habla. Intenta hablar más claro.');
              break;
            case 'audio-capture':
              setError('No se pudo acceder al micrófono. Verifica los permisos.');
              break;
            case 'not-allowed':
              setError('Permiso denegado para usar el micrófono.');
              break;
            case 'network':
              setError('Error de conexión. Verifica tu conexión a internet.');
              break;
            default:
              setError(`Error desconocido: ${event.error}`);
          }
        };

        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
          let interimTranscript = '';
          let finalTranscript = finalTranscriptRef.current;

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            const transcript = result[0].transcript;
            const confidence = result[0].confidence;

            if (result.isFinal) {
              finalTranscript += transcript;
              setConfidence(confidence);
            } else {
              interimTranscript += transcript;
            }
          }

          finalTranscriptRef.current = finalTranscript;
          setTranscript(finalTranscript + interimTranscript);
        };
      }
    } else {
      setIsSupported(false);
      setError('El reconocimiento de voz no está soportado en este navegador.');
    }

    // Cleanup
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const startListening = useCallback(() => {
    if (recognitionRef.current && isSupported && !isListening) {
      try {
        setError(null);
        setTranscript('');
        finalTranscriptRef.current = '';
        recognitionRef.current.start();
      } catch (err) {
        setError('Error al iniciar el reconocimiento de voz');
        console.error('Speech recognition error:', err);
      }
    }
  }, [isSupported, isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    finalTranscriptRef.current = '';
    setConfidence(0);
  }, []);

  // Auto-stop after period of silence
  useEffect(() => {
    let timeoutId: number;
    
    if (isListening && transcript) {
      timeoutId = window.setTimeout(() => {
        stopListening();
      }, 3000); // Stop after 3 seconds of silence
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isListening, transcript, stopListening]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === 'Space' && !event.repeat) {
        event.preventDefault();
        if (isListening) {
          stopListening();
        } else {
          startListening();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [isListening, startListening, stopListening]);

  return {
    isListening,
    transcript,
    confidence,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  };
};