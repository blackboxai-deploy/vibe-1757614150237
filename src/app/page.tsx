'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the Assistant Interface to avoid SSR issues with speech APIs
const AssistantInterface = dynamic(
  () => import('@/components/Assistant/AssistantInterface'),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto">
            <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse" />
          </div>
          <div className="text-xl font-semibold text-gray-700 dark:text-gray-300">
            Iniciando Asistente Personal...
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Preparando reconocimiento de voz
          </div>
        </div>
      </div>
    )
  }
);

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="relative z-20 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Siri Personal
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Tu asistente personal inteligente
            </p>
          </div>
        </div>
      </header>

      {/* Main Assistant Interface */}
      <section className="relative z-10 px-4">
        <Suspense fallback={
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
          </div>
        }>
          <AssistantInterface />
        </Suspense>
      </section>

      {/* Footer */}
      <footer className="relative z-20 mt-16 p-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="backdrop-blur-sm bg-white/20 dark:bg-black/20 rounded-2xl p-4 border border-white/20">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Usa comandos de voz para interactuar • Pregunta por el clima • Realiza cálculos • Gestiona tareas
            </p>
            <div className="mt-2 flex flex-wrap justify-center gap-4 text-xs text-gray-500 dark:text-gray-500">
              <span>🎙️ Reconocimiento de voz</span>
              <span>🌤️ Información del clima</span>
              <span>🧮 Calculadora</span>
              <span>📝 Gestión de tareas</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}