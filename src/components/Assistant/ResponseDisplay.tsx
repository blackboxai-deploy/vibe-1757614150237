'use client';

interface ResponseDisplayProps {
  response?: string;
  isProcessing: boolean;
  error?: string | null;
}

const ResponseDisplay: React.FC<ResponseDisplayProps> = ({
  response,
  isProcessing,
  error,
}) => {
  if (error) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">❌</span>
          <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">
            Error
          </h3>
        </div>
        
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <p className="text-red-700 dark:text-red-300 text-sm">
            {error}
          </p>
        </div>
        
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Intenta reformular tu pregunta o verifica tu conexión a internet.
        </div>
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🤔</span>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            Procesando...
          </h3>
        </div>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            </div>
            <span className="text-blue-700 dark:text-blue-300 text-sm">
              Analizando tu solicitud y preparando una respuesta...
            </span>
          </div>
        </div>
        
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Esto puede tomar unos segundos dependiendo de la complejidad de la consulta.
        </div>
      </div>
    );
  }

  if (response) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">✅</span>
          <h3 className="text-lg font-semibold text-green-600 dark:text-green-400">
            Respuesta
          </h3>
        </div>
        
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
          <div className="text-green-800 dark:text-green-200 text-sm leading-relaxed whitespace-pre-wrap">
            {response}
          </div>
        </div>
        
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Respuesta generada con éxito</span>
          <button 
            onClick={() => navigator.clipboard.writeText(response)}
            className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <span>📋</span>
            <span>Copiar</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-xl">💤</span>
        <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400">
          Esperando...
        </h3>
      </div>
      
      <div className="bg-gray-50 dark:bg-gray-800/20 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Habla con el asistente para obtener una respuesta.
        </p>
      </div>
      
      <div className="text-xs text-gray-500 dark:text-gray-400">
        Puedes preguntarme sobre el clima, hacer cálculos, gestionar tareas y más.
      </div>
    </div>
  );
};

export default ResponseDisplay;