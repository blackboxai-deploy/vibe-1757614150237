'use client';

import { useEffect, useRef, useState } from 'react';
import { AudioVisualizerData } from '@/types/assistant';
import { ASSISTANT_CONFIG } from '@/lib/config';

interface VoiceVisualizerProps {
  isListening: boolean;
  isSpeaking: boolean;
  currentTranscript?: string;
}

const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({
  isListening,
  isSpeaking,
  currentTranscript
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const audioContextRef = useRef<AudioContext | undefined>(undefined);
  const analyserRef = useRef<AnalyserNode | undefined>(undefined);
  const [visualizerData, setVisualizerData] = useState<AudioVisualizerData>({
    frequencies: new Array(32).fill(0),
    amplitude: 0,
    volume: 0,
  });

  // Initialize audio context for visualization
  useEffect(() => {
    const initializeAudioContext = async () => {
      try {
        // Create audio context
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        // Create analyser node
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = ASSISTANT_CONFIG.audioVisualizer.fftSize;
        analyserRef.current.smoothingTimeConstant = ASSISTANT_CONFIG.audioVisualizer.smoothingTimeConstant;
        analyserRef.current.minDecibels = ASSISTANT_CONFIG.audioVisualizer.minDecibels;
        analyserRef.current.maxDecibels = ASSISTANT_CONFIG.audioVisualizer.maxDecibels;

        // Get user media if listening is active
        if (isListening) {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const source = audioContextRef.current.createMediaStreamSource(stream);
          source.connect(analyserRef.current);
        }
      } catch (error) {
        console.error('Error initializing audio context:', error);
      }
    };

    if (isListening && !audioContextRef.current) {
      initializeAudioContext();
    }

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = undefined;
      }
    };
  }, [isListening]);

  // Animation loop for voice visualization
  useEffect(() => {
    const animate = () => {
      if (!analyserRef.current || !canvasRef.current) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Get frequency data
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyserRef.current.getByteFrequencyData(dataArray);

      // Calculate average amplitude
      const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
      const amplitude = average / 255;

      // Update visualizer data
      setVisualizerData(prev => ({
        frequencies: Array.from(dataArray.slice(0, 32)),
        amplitude,
        volume: amplitude,
      }));

      animationRef.current = requestAnimationFrame(animate);
    };

    if (isListening || isSpeaking) {
      animationRef.current = requestAnimationFrame(animate);
    } else {
      // Simulate idle animation
      const idleAnimate = () => {
        setVisualizerData(prev => ({
          frequencies: prev.frequencies.map(() => Math.random() * 30 + 10),
          amplitude: Math.random() * 0.3 + 0.1,
          volume: Math.random() * 0.3 + 0.1,
        }));
        animationRef.current = requestAnimationFrame(idleAnimate);
      };
      animationRef.current = requestAnimationFrame(idleAnimate);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isListening, isSpeaking]);

  // Draw visualization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    // Create gradient
    const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width / 2);
    
    if (isListening) {
      gradient.addColorStop(0, 'rgba(59, 130, 246, 0.8)'); // Blue for listening
      gradient.addColorStop(1, 'rgba(59, 130, 246, 0.1)');
    } else if (isSpeaking) {
      gradient.addColorStop(0, 'rgba(139, 69, 193, 0.8)'); // Purple for speaking
      gradient.addColorStop(1, 'rgba(139, 69, 193, 0.1)');
    } else {
      gradient.addColorStop(0, 'rgba(107, 114, 128, 0.6)'); // Gray for idle
      gradient.addColorStop(1, 'rgba(107, 114, 128, 0.1)');
    }

    // Draw central circle
    const centerX = width / 2;
    const centerY = height / 2;
    const baseRadius = Math.min(width, height) / 6;
    const pulseRadius = baseRadius + (visualizerData.amplitude * 30);

    ctx.beginPath();
    ctx.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw frequency bars around the circle
    const barCount = visualizerData.frequencies.length;
    const angleStep = (Math.PI * 2) / barCount;

    visualizerData.frequencies.forEach((frequency, index) => {
      const angle = index * angleStep;
      const barHeight = (frequency / 255) * 60 + 10;
      const innerRadius = pulseRadius + 10;
      const outerRadius = innerRadius + barHeight;

      const startX = centerX + Math.cos(angle) * innerRadius;
      const startY = centerY + Math.sin(angle) * innerRadius;
      const endX = centerX + Math.cos(angle) * outerRadius;
      const endY = centerY + Math.sin(angle) * outerRadius;

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.lineWidth = 3;
      ctx.strokeStyle = isListening 
        ? `rgba(59, 130, 246, ${0.7 + frequency / 255 * 0.3})` 
        : isSpeaking 
          ? `rgba(139, 69, 193, ${0.7 + frequency / 255 * 0.3})`
          : `rgba(107, 114, 128, ${0.5 + frequency / 255 * 0.3})`;
      ctx.stroke();
    });

    // Draw status text
    ctx.font = 'bold 14px system-ui';
    ctx.textAlign = 'center';
    ctx.fillStyle = isListening 
      ? 'rgba(59, 130, 246, 1)' 
      : isSpeaking 
        ? 'rgba(139, 69, 193, 1)'
        : 'rgba(107, 114, 128, 1)';

    const statusText = isListening 
      ? 'Escuchando...' 
      : isSpeaking 
        ? 'Hablando...'
        : 'Toca para hablar';

    ctx.fillText(statusText, centerX, centerY + 5);

  }, [visualizerData, isListening, isSpeaking]);

  const getStatusMessage = () => {
    if (isListening) return 'Te estoy escuchando';
    if (isSpeaking) return 'Procesando respuesta';
    return 'Toca el micrófono para empezar';
  };

  return (
    <div className="text-center space-y-4">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={300}
          height={300}
          className="max-w-full h-auto mx-auto"
          style={{ filter: isListening || isSpeaking ? 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.5))' : 'none' }}
        />
        
        {/* Status overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className={`text-sm font-medium ${
              isListening 
                ? 'text-blue-600 dark:text-blue-400' 
                : isSpeaking 
                  ? 'text-purple-600 dark:text-purple-400'
                  : 'text-gray-600 dark:text-gray-400'
            }`}>
              {getStatusMessage()}
            </div>
          </div>
        </div>
      </div>

      {/* Current transcript display */}
      {currentTranscript && (
        <div className="bg-white/30 dark:bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Transcripción en vivo:</div>
          <div className="text-lg font-medium text-gray-900 dark:text-white">
            &quot;{currentTranscript}&quot;
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceVisualizer;