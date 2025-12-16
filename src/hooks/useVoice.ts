import { useState, useCallback, useRef, useEffect } from 'react';

type VoiceState = 'idle' | 'listening' | 'speaking';

interface UseVoiceReturn {
  voiceState: VoiceState;
  audioLevel: number;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  speak: (text: string) => void;
}

export function useVoice(onTranscript?: (text: string) => void): UseVoiceReturn {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [audioLevel, setAudioLevel] = useState(0);
  const [isSupported] = useState(() => {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  });

  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    if (isSupported) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (onTranscript) {
          onTranscript(transcript);
        }
        setVoiceState('idle');
      };

      recognitionRef.current.onerror = () => {
        setVoiceState('idle');
      };

      recognitionRef.current.onend = () => {
        setVoiceState('idle');
        stopAudioAnalysis();
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      stopAudioAnalysis();
    };
  }, [isSupported, onTranscript]);

  const startAudioAnalysis = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;

      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

      const updateLevel = () => {
        if (analyserRef.current && voiceState === 'listening') {
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setAudioLevel(average / 255);
          animationFrameRef.current = requestAnimationFrame(updateLevel);
        }
      };

      updateLevel();
    } catch (error) {
      console.warn('Microphone access denied:', error);
    }
  };

  const stopAudioAnalysis = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setAudioLevel(0);
  };

  const startListening = useCallback(() => {
    if (!isSupported || !recognitionRef.current) return;

    try {
      setVoiceState('listening');
      recognitionRef.current.start();
      startAudioAnalysis();
    } catch (error) {
      console.warn('Speech recognition error:', error);
      setVoiceState('idle');
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    stopAudioAnalysis();
    setVoiceState('idle');
  }, []);

  const speak = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) return;

    setVoiceState('speaking');
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onend = () => {
      setVoiceState('idle');
    };

    utterance.onerror = () => {
      setVoiceState('idle');
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  return {
    voiceState,
    audioLevel,
    isSupported,
    startListening,
    stopListening,
    speak,
  };
}
