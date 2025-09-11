'use client';

import { Button } from '@/components/ui/button';

interface VoiceControlsProps {
  isListening: boolean;
  isSpeaking: boolean;
  isProcessing: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
  onToggleVoiceResponse: () => void;
  onClearHistory: () => void;
  enableVoiceResponse: boolean;
}

const VoiceControls: React.FC<VoiceControlsProps> = ({
  isListening,
  isSpeaking,
  isProcessing,
  onStartListening,
  onStopListening,
  onToggleVoiceResponse,
  onClearHistory,
  enableVoiceResponse,
}) => {
  const handleMicrophoneClick = () => {
    if (isListening) {
      onStopListening();
    } else if (!isSpeaking && !isProcessing) {
      onStartListening();
    }
  };

  const getMicrophoneButtonState = () => {
    if (isListening) return 'listening';
    if (isSpeaking) return 'speaking';
    if (isProcessing) return 'processing';
    return 'idle';
  };

  const getMicrophoneIcon = () => {
    const state = getMicrophoneButtonState();
    switch (state) {
      case 'listening':
        return '🎤';
      case 'speaking':
        return '🔊';
      case 'processing':
        return '⏳';
      default:
        return '🎙️';
    }
  };

  const getMicrophoneText = () => {
    const state = getMicrophoneButtonState();
    switch (state) {
      case 'listening':
        return 'Detener';
      case 'speaking':
        return 'Hablando...';
      case 'processing':
        return 'Procesando...';
      default:
        return 'Hablar';
    }
  };

  const getMicrophoneStyles = () => {
    const state = getMicrophoneButtonState();
    const baseStyles = 'h-16 w-32 text-lg font-semibold transition-all duration-200 shadow-lg';
    
    switch (state) {
      case 'listening':
        return `${baseStyles} bg-blue-500 hover:bg-blue-600 text-white animate-pulse shadow-blue-500/50`;
      case 'speaking':
        return `${baseStyles} bg-purple-500 hover:bg-purple-600 text-white animate-pulse shadow-purple-500/50`;
      case 'processing':
        return `${baseStyles} bg-yellow-500 hover:bg-yellow-600 text-white animate-bounce shadow-yellow-500/50`;
      default:
        return `${baseStyles} bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-blue-500/50`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Microphone Button */}
      <div className="text-center">
        <Button
          onClick={handleMicrophoneClick}
          disabled={isSpeaking || isProcessing}
          className={getMicrophoneStyles()}
        >
          <span className="text-2xl mr-2">{getMicrophoneIcon()}</span>
          {getMicrophoneText()}
        </Button>
        
        {/* Status text */}
        <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
          {isListening && 'Presiona de nuevo para detener la grabación'}
          {isSpeaking && 'El asistente está respondiendo...'}
          {isProcessing && 'Procesando tu solicitud...'}
          {!isListening && !isSpeaking && !isProcessing && 'Mantén presionado o haz clic para hablar'}
        </div>
      </div>

      {/* Control Buttons */}
      <div className="grid grid-cols-2 gap-4">
        {/* Voice Response Toggle */}
        <Button
          onClick={onToggleVoiceResponse}
          variant="outline"
          className={`h-12 ${
            enableVoiceResponse
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300'
              : 'bg-gray-50 dark:bg-gray-800/20 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          <span className="text-lg mr-2">
            {enableVoiceResponse ? '🔊' : '🔇'}
          </span>
          {enableVoiceResponse ? 'Voz Activada' : 'Solo Texto'}
        </Button>

        {/* Clear History */}
        <Button
          onClick={onClearHistory}
          variant="outline"
          className="h-12 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30"
        >
          <span className="text-lg mr-2">🗑️</span>
          Limpiar
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Comandos rápidos:
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button 
            onClick={() => navigator.clipboard.writeText('¿Qué tiempo hace hoy?')}
            className="p-2 bg-white/20 dark:bg-black/20 rounded-lg text-left hover:bg-white/30 dark:hover:bg-black/30 transition-colors"
          >
            <div className="font-medium">Clima</div>
            <div className="text-gray-600 dark:text-gray-400">¿Qué tiempo hace?</div>
          </button>
          
          <button 
            onClick={() => navigator.clipboard.writeText('¿Qué hora es?')}
            className="p-2 bg-white/20 dark:bg-black/20 rounded-lg text-left hover:bg-white/30 dark:hover:bg-black/30 transition-colors"
          >
            <div className="font-medium">Hora</div>
            <div className="text-gray-600 dark:text-gray-400">¿Qué hora es?</div>
          </button>
          
          <button 
            onClick={() => navigator.clipboard.writeText('Calcula 15 más 25')}
            className="p-2 bg-white/20 dark:bg-black/20 rounded-lg text-left hover:bg-white/30 dark:hover:bg-black/30 transition-colors"
          >
            <div className="font-medium">Cálculo</div>
            <div className="text-gray-600 dark:text-gray-400">Suma, resta, etc.</div>
          </button>
          
          <button 
            onClick={() => navigator.clipboard.writeText('Recuérdame comprar leche')}
            className="p-2 bg-white/20 dark:bg-black/20 rounded-lg text-left hover:bg-white/30 dark:hover:bg-black/30 transition-colors"
          >
            <div className="font-medium">Tareas</div>
            <div className="text-gray-600 dark:text-gray-400">Recordatorios</div>
          </button>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
          Haz clic para copiar al portapapeles
        </div>
      </div>

      {/* Keyboard Shortcuts */}
      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Atajos de teclado:
        </div>
        <div className="grid grid-cols-1 gap-1 text-xs">
          <div className="flex justify-between items-center py-1">
            <span className="text-gray-600 dark:text-gray-400">Comenzar/Parar grabación</span>
            <kbd className="px-2 py-1 bg-white/30 dark:bg-black/30 rounded text-xs font-mono">Space</kbd>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="text-gray-600 dark:text-gray-400">Alternar respuestas de voz</span>
            <kbd className="px-2 py-1 bg-white/30 dark:bg-black/30 rounded text-xs font-mono">V</kbd>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="text-gray-600 dark:text-gray-400">Limpiar historial</span>
            <kbd className="px-2 py-1 bg-white/30 dark:bg-black/30 rounded text-xs font-mono">C</kbd>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceControls;