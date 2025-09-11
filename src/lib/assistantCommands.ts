// Assistant command processing and natural language understanding

import { ASSISTANT_CONFIG } from './config';
import { WeatherData, CalculationResult, TimeData, Task } from '@/types/assistant';

// Utility functions for different command types
const weatherCommands = {
  patterns: [
    /(?:qu[eé]|c[oó]mo)\s+(?:est[aá]|hace|hay)\s+(?:el\s+)?(?:tiempo|clima)/i,
    /(?:temperatura|lluvia|sol|nublado|fr[ií]o|calor)/i,
    /weather|temperature|rain|sunny|cloudy/i,
  ],
  
  async process(input: string): Promise<string> {
    // Mock weather data - in production, this would call a real API
    const mockWeather: WeatherData = {
      location: 'Madrid, España',
      temperature: Math.floor(Math.random() * 20) + 15,
      description: ['soleado', 'nublado', 'lluvioso', 'parcialmente nublado'][Math.floor(Math.random() * 4)],
      humidity: Math.floor(Math.random() * 40) + 40,
      windSpeed: Math.floor(Math.random() * 15) + 5,
      icon: '☀️'
    };

    return `El clima en ${mockWeather.location} está ${mockWeather.description} con ${mockWeather.temperature}°C. La humedad es del ${mockWeather.humidity}% y el viento sopla a ${mockWeather.windSpeed} km/h.`;
  }
};

const timeCommands = {
  patterns: [
    /(?:qu[eé]|cu[aá]l|dime)\s+(?:hora|tiempo|d[ií]a|fecha)/i,
    /what\s+time|current\s+time|date/i,
  ],
  
  process(input: string): string {
    const now = new Date();
    const timeData: TimeData = {
      currentTime: now,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      formattedTime: now.toLocaleTimeString('es-ES'),
      formattedDate: now.toLocaleDateString('es-ES', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    };

    if (input.toLowerCase().includes('fecha') || input.toLowerCase().includes('día')) {
      return `Hoy es ${timeData.formattedDate}.`;
    } else {
      return `Son las ${timeData.formattedTime} del ${timeData.formattedDate}.`;
    }
  }
};

const calculationCommands = {
  patterns: [
    /(?:calcula|calicular|suma|resta|multiplica|divide|cu[aá]nto|operaci[oó]n)/i,
    /\d+\s*[\+\-\*/]\s*\d+/,
    /calculate|math|plus|minus|times|divided/i,
  ],
  
  process(input: string): string {
    try {
      // Extract mathematical expressions
      const mathExpression = input.match(/(\d+(?:\.\d+)?)\s*([\+\-\*/])\s*(\d+(?:\.\d+)?)/);
      
      if (mathExpression) {
        const [, num1, operator, num2] = mathExpression;
        const a = parseFloat(num1);
        const b = parseFloat(num2);
        let result: number;
        let operatorText: string;

        switch (operator) {
          case '+':
            result = a + b;
            operatorText = 'suma';
            break;
          case '-':
            result = a - b;
            operatorText = 'resta';
            break;
          case '*':
            result = a * b;
            operatorText = 'multiplicación';
            break;
          case '/':
            if (b === 0) throw new Error('División por cero');
            result = a / b;
            operatorText = 'división';
            break;
          default:
            throw new Error('Operador no válido');
        }

        const calculationResult: CalculationResult = {
          expression: `${a} ${operator} ${b}`,
          result,
          isValid: true
        };

        return `La ${operatorText} de ${a} ${operator === '*' ? 'por' : operator === '/' ? 'entre' : 'y'} ${b} es ${result}.`;
      }

      // Handle word-based math
      if (input.match(/suma|sumar/i)) {
        const numbers = input.match(/\d+(?:\.\d+)?/g);
        if (numbers && numbers.length >= 2) {
          const sum = numbers.reduce((acc, num) => acc + parseFloat(num), 0);
          return `La suma es ${sum}.`;
        }
      }

      throw new Error('No se pudo interpretar la operación matemática');
    } catch (error) {
      return `Lo siento, no pude realizar ese cálculo. ${error instanceof Error ? error.message : 'Error desconocido.'}`;
    }
  }
};

const taskCommands = {
  patterns: [
    /(?:recordar|tarea|pendiente|lista|agregar|a[ñn]adir)/i,
    /(?:remember|task|todo|remind)/i,
  ],
  
  process(input: string): string {
    // Extract task content
    const taskContent = input
      .replace(/(?:recordar|tarea|pendiente|agregar|a[ñn]adir|que|de|me)/gi, '')
      .trim();

    if (taskContent) {
      // In a real app, this would save to localStorage or a database
      const task: Task = {
        id: `task-${Date.now()}`,
        title: taskContent,
        completed: false,
        createdAt: new Date(),
        priority: 'medium'
      };

      return `He añadido "${taskContent}" a tu lista de tareas pendientes.`;
    }

    return 'Por favor, dime qué tarea quieres que recuerde.';
  }
};

const systemCommands = {
  patterns: [
    /(?:ayuda|help|comandos|qu[eé]\s+puedes|funciones)/i,
    /(?:configuraci[oó]n|ajustes|settings)/i,
  ],
  
  process(input: string): string {
    if (input.match(/ayuda|help|comandos|funciones/i)) {
      return `Puedo ayudarte con:

🌤️ **Clima**: "¿Qué tiempo hace?" o "¿Cómo está el clima?"
⏰ **Hora y fecha**: "¿Qué hora es?" o "¿Qué día es hoy?"
🧮 **Cálculos**: "Calcula 15 más 25" o "¿Cuánto es 100 dividido entre 4?"
📝 **Tareas**: "Recuérdame comprar leche" o "Agregar tarea estudiar"
❓ **Ayuda**: "¿Qué puedes hacer?" o "Ayuda"

Simplemente háblame de forma natural y yo entenderé tu solicitud.`;
    }

    if (input.match(/configuraci[oó]n|ajustes/i)) {
      return `Configuraciones disponibles:
- Activar/desactivar respuestas de voz
- Cambiar idioma de reconocimiento
- Ajustar velocidad y tono de voz
- Limpiar historial de conversación

Usa los controles en la interfaz para ajustar estas opciones.`;
    }

    return 'No reconocí ese comando del sistema. Di "ayuda" para ver qué puedo hacer.';
  }
};

const generalCommands = {
  patterns: [
    /(?:hola|hi|hello|saludos|buenos|buenas)/i,
    /(?:gracias|thank|thanks|merci)/i,
    /(?:adi[oó]s|bye|hasta\s+luego|chao)/i,
  ],
  
  process(input: string): string {
    if (input.match(/(?:hola|hi|hello|saludos|buenos|buenas)/i)) {
      const greetings = [
        '¡Hola! ¿En qué puedo ayudarte?',
        '¡Buenos días! ¿Qué necesitas?',
        '¡Hola! Estoy aquí para asistirte.',
        '¡Saludos! ¿Cómo puedo ayudarte hoy?'
      ];
      return greetings[Math.floor(Math.random() * greetings.length)];
    }

    if (input.match(/(?:gracias|thank|thanks)/i)) {
      const responses = [
        '¡De nada! Estoy aquí para ayudarte.',
        '¡Un placer ayudarte!',
        'No hay de qué. ¿Necesitas algo más?',
        '¡Encantado de ayudar!'
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    if (input.match(/(?:adi[oó]s|bye|hasta\s+luego|chao)/i)) {
      const farewells = [
        '¡Hasta luego! Que tengas un buen día.',
        '¡Adiós! Vuelve cuando necesites ayuda.',
        '¡Nos vemos! Estaré aquí cuando me necesites.',
        '¡Hasta pronto!'
      ];
      return farewells[Math.floor(Math.random() * farewells.length)];
    }

    return '¡Hola! ¿En qué puedo ayudarte?';
  }
};

// Main command processor
export async function processAssistantCommand(input: string): Promise<string> {
  const normalizedInput = input.toLowerCase().trim();

  if (!normalizedInput) {
    return 'No escuché nada. ¿Puedes repetir tu pregunta?';
  }

  try {
    // Check each command type in order of specificity
    
    // Weather commands
    if (weatherCommands.patterns.some(pattern => pattern.test(normalizedInput))) {
      return await weatherCommands.process(input);
    }

    // Time commands
    if (timeCommands.patterns.some(pattern => pattern.test(normalizedInput))) {
      return timeCommands.process(input);
    }

    // Calculation commands
    if (calculationCommands.patterns.some(pattern => pattern.test(normalizedInput))) {
      return calculationCommands.process(input);
    }

    // Task commands
    if (taskCommands.patterns.some(pattern => pattern.test(normalizedInput))) {
      return taskCommands.process(input);
    }

    // System commands
    if (systemCommands.patterns.some(pattern => pattern.test(normalizedInput))) {
      return systemCommands.process(input);
    }

    // General commands (greetings, thanks, etc.)
    if (generalCommands.patterns.some(pattern => pattern.test(normalizedInput))) {
      return generalCommands.process(input);
    }

    // Default response for unrecognized commands
    const notUnderstoodResponses = ASSISTANT_CONFIG.personality.responses.notUnderstood;
    const randomResponse = notUnderstoodResponses[Math.floor(Math.random() * notUnderstoodResponses.length)];
    
    return `${randomResponse} 

Puedes preguntarme sobre:
• El clima y temperatura
• La hora y fecha actual
• Realizar cálculos matemáticos
• Gestionar tareas y recordatorios
• Obtener ayuda sobre mis funciones

¿En qué más puedo ayudarte?`;

  } catch (error) {
    console.error('Error processing assistant command:', error);
    const errorResponses = ASSISTANT_CONFIG.personality.responses.error;
    return errorResponses[Math.floor(Math.random() * errorResponses.length)];
  }
}