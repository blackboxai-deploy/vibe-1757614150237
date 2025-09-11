// TypeScript interfaces for the Personal Assistant

export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isVoice?: boolean;
}

export interface VoiceSettings {
  rate: number;
  pitch: number;
  volume: number;
  voice: SpeechSynthesisVoice | null;
  language: string;
}

export interface AssistantState {
  isListening: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  isInitialized: boolean;
  currentTranscript: string;
  confidence: number;
  error: string | null;
}

export interface WeatherData {
  location: string;
  temperature: number;
  description: string;
  humidity: number;
  windSpeed: number;
  icon: string;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high';
}

export interface AssistantCommand {
  pattern: RegExp;
  handler: (match: RegExpMatchArray, input: string) => Promise<string>;
  description: string;
  category: 'general' | 'weather' | 'time' | 'calculation' | 'tasks' | 'system';
}

export interface AssistantSettings {
  theme: 'light' | 'dark' | 'auto';
  voiceSettings: VoiceSettings;
  enableVoiceResponse: boolean;
  enableNotifications: boolean;
  defaultLanguage: 'es' | 'en';
  autoListen: boolean;
  wakeWord: string;
}

export interface AudioVisualizerData {
  frequencies: number[];
  amplitude: number;
  volume: number;
}

export interface CalculationResult {
  expression: string;
  result: number;
  isValid: boolean;
  error?: string;
}

export interface TimeData {
  currentTime: Date;
  timezone: string;
  formattedTime: string;
  formattedDate: string;
}

export interface SearchSuggestion {
  query: string;
  type: 'web' | 'local' | 'command';
  confidence: number;
}