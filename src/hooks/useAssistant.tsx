'use client';

import { useState, useCallback } from 'react';
import { processAssistantCommand } from '@/lib/assistantCommands';

interface UseAssistantReturn {
  processCommand: (input: string) => Promise<string>;
  isProcessing: boolean;
  currentResponse: string;
  error: string | null;
}

export const useAssistant = (): UseAssistantReturn => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentResponse, setCurrentResponse] = useState('');
  const [error, setError] = useState<string | null>(null);

  const processCommand = useCallback(async (input: string): Promise<string> => {
    if (!input.trim()) {
      throw new Error('Comando vacío');
    }

    setIsProcessing(true);
    setError(null);
    setCurrentResponse('');

    try {
      const response = await processAssistantCommand(input.trim());
      setCurrentResponse(response);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return {
    processCommand,
    isProcessing,
    currentResponse,
    error,
  };
};