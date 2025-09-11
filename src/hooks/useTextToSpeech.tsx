'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { VoiceSettings } from '@/types/assistant';
import { ASSISTANT_CONFIG } from '@/lib/config';

interface TextToSpeechHookReturn {
  speak: (text: string) => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  isSpeaking: boolean;
  isPaused: boolean;
  isSupported: boolean;
  voices: SpeechSynthesisVoice[];
  setVoiceSettings: (settings: Partial<VoiceSettings>) => void;
}

export const useTextToSpeech = (
  initialSettings?: Partial<VoiceSettings>
): TextToSpeechHookReturn => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceSettings, setVoiceSettingsState] = useState<VoiceSettings>({
    rate: initialSettings?.rate || ASSISTANT_CONFIG.textToSpeech.defaultRate,
    pitch: initialSettings?.pitch || ASSISTANT_CONFIG.textToSpeech.defaultPitch,
    volume: initialSettings?.volume || ASSISTANT_CONFIG.textToSpeech.defaultVolume,
    voice: initialSettings?.voice || null,
    language: initialSettings?.language || ASSISTANT_CONFIG.textToSpeech.defaultLanguage,
  });

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null);

  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);
      speechSynthesisRef.current = window.speechSynthesis;

      // Load available voices
      const loadVoices = () => {
        const availableVoices = speechSynthesisRef.current?.getVoices() || [];
        setVoices(availableVoices);

        // Auto-select Spanish voice if available
        const spanishVoice = availableVoices.find(
          voice => voice.lang.startsWith('es') || voice.lang.startsWith('ES')
        );
        
        if (spanishVoice && !voiceSettings.voice) {
          setVoiceSettingsState(prev => ({
            ...prev,
            voice: spanishVoice,
          }));
        }
      };

      // Load voices immediately
      loadVoices();

      // Also load voices when they become available
      if (speechSynthesisRef.current) {
        speechSynthesisRef.current.onvoiceschanged = loadVoices;
      }

      // Check speaking state periodically
      const checkSpeakingState = () => {
        if (speechSynthesisRef.current) {
          setIsSpeaking(speechSynthesisRef.current.speaking);
          setIsPaused(speechSynthesisRef.current.pending);
        }
      };

      const intervalId = setInterval(checkSpeakingState, 100);

      return () => {
        clearInterval(intervalId);
        if (speechSynthesisRef.current) {
          speechSynthesisRef.current.cancel();
        }
      };
    } else {
      setIsSupported(false);
    }
    
    return undefined;
  }, [voiceSettings.voice]);

  const speak = useCallback((text: string) => {
    if (!isSupported || !speechSynthesisRef.current || !text.trim()) {
      return;
    }

    // Cancel any ongoing speech
    speechSynthesisRef.current.cancel();

    try {
      // Create utterance
      const utterance = new SpeechSynthesisUtterance(text);
      utteranceRef.current = utterance;

      // Apply voice settings
      utterance.rate = voiceSettings.rate;
      utterance.pitch = voiceSettings.pitch;
      utterance.volume = voiceSettings.volume;
      utterance.lang = voiceSettings.language;

      if (voiceSettings.voice) {
        utterance.voice = voiceSettings.voice;
      }

      // Event handlers
      utterance.onstart = () => {
        setIsSpeaking(true);
        setIsPaused(false);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
      };

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event.error);
        setIsSpeaking(false);
        setIsPaused(false);
      };

      utterance.onpause = () => {
        setIsPaused(true);
      };

      utterance.onresume = () => {
        setIsPaused(false);
      };

      // Start speaking
      speechSynthesisRef.current.speak(utterance);
    } catch (error) {
      console.error('Error creating speech utterance:', error);
    }
  }, [isSupported, voiceSettings]);

  const stop = useCallback(() => {
    if (speechSynthesisRef.current) {
      speechSynthesisRef.current.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  }, []);

  const pause = useCallback(() => {
    if (speechSynthesisRef.current && isSpeaking && !isPaused) {
      speechSynthesisRef.current.pause();
      setIsPaused(true);
    }
  }, [isSpeaking, isPaused]);

  const resume = useCallback(() => {
    if (speechSynthesisRef.current && isPaused) {
      speechSynthesisRef.current.resume();
      setIsPaused(false);
    }
  }, [isPaused]);

  const setVoiceSettings = useCallback((settings: Partial<VoiceSettings>) => {
    setVoiceSettingsState(prev => ({
      ...prev,
      ...settings,
    }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (speechSynthesisRef.current) {
        speechSynthesisRef.current.cancel();
      }
    };
  }, []);

  return {
    speak,
    stop,
    pause,
    resume,
    isSpeaking,
    isPaused,
    isSupported,
    voices,
    setVoiceSettings,
  };
};