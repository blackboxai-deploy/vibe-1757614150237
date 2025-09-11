// Configuration settings for the Personal Assistant

export const ASSISTANT_CONFIG = {
  // Voice Recognition Settings
  speechRecognition: {
    language: 'es-ES', // Default to Spanish
    continuous: true,
    interimResults: true,
    maxAlternatives: 1,
  },
  
  // Text-to-Speech Settings
  textToSpeech: {
    defaultRate: 0.9,
    defaultPitch: 1.0,
    defaultVolume: 0.8,
    defaultLanguage: 'es-ES',
  },

  // Assistant Personality
  personality: {
    name: 'Siri Personal',
    greetings: [
      '¡Hola! ¿En qué puedo ayudarte hoy?',
      'Buenos días, ¿qué necesitas?',
      '¡Hola! Estoy aquí para ayudarte.',
      '¿En qué puedo asistirte?',
    ],
    responses: {
      notUnderstood: [
        'Lo siento, no entendí tu solicitud. ¿Puedes repetirlo?',
        'No pude comprender eso. ¿Podrías ser más específico?',
        'Disculpa, ¿puedes reformular tu pregunta?',
      ],
      processing: [
        'Déjame pensar...',
        'Un momento, por favor...',
        'Procesando tu solicitud...',
        'Déjame verificar eso...',
      ],
      error: [
        'Ha ocurrido un error. Por favor, inténtalo de nuevo.',
        'Lo siento, algo salió mal.',
        'Disculpa, no pude completar esa acción.',
      ],
    },
  },

  // API Settings
  apis: {
    weather: {
      // Using OpenWeatherMap free tier
      baseUrl: 'https://api.openweathermap.org/data/2.5',
      // Note: In production, this should be in environment variables
      defaultCity: 'Madrid',
      units: 'metric',
    },
  },

  // UI Settings
  ui: {
    themes: {
      light: {
        primary: '#007AFF',
        secondary: '#5856D6',
        accent: '#FF9500',
        background: 'rgba(255, 255, 255, 0.95)',
        surface: 'rgba(255, 255, 255, 0.8)',
      },
      dark: {
        primary: '#0A84FF',
        secondary: '#5E5CE6',
        accent: '#FF9F0A',
        background: 'rgba(0, 0, 0, 0.95)',
        surface: 'rgba(28, 28, 30, 0.8)',
      },
    },
    animations: {
      duration: {
        short: 200,
        medium: 350,
        long: 500,
      },
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },

  // Audio Visualizer Settings
  audioVisualizer: {
    fftSize: 256,
    smoothingTimeConstant: 0.8,
    minDecibels: -90,
    maxDecibels: -10,
    updateInterval: 16, // ~60fps
  },

  // Local Storage Keys
  storageKeys: {
    settings: 'assistant_settings',
    chatHistory: 'assistant_chat_history',
    tasks: 'assistant_tasks',
    voiceSettings: 'assistant_voice_settings',
  },

  // Command Patterns (will be expanded in assistantCommands.ts)
  commands: {
    weather: /(?:clima|tiempo|temperatura|lluvia|sol)/i,
    time: /(?:hora|tiempo|fecha|día|calendario)/i,
    calculation: /(?:calcula|suma|resta|multiplica|divide|\d+[\+\-\*/]\d+)/i,
    tasks: /(?:recordar|tarea|pendiente|lista|agregar)/i,
    system: /(?:configuración|ajustes|ayuda|comandos)/i,
  },

  // Feature Flags
  features: {
    weatherIntegration: true,
    taskManager: true,
    calculator: true,
    webSearch: true,
    voiceVisualization: true,
    notifications: true,
  },
} as const;

// Type-safe configuration access
export type AssistantConfig = typeof ASSISTANT_CONFIG;