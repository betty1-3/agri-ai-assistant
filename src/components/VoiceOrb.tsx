import { useEffect, useRef } from 'react';

type OrbState = 'idle' | 'listening' | 'speaking';

interface VoiceOrbProps {
  state: OrbState;
  audioLevel?: number;
}

export default function VoiceOrb({ state, audioLevel = 0 }: VoiceOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const baseRadius = Math.min(rect.width, rect.height) * 0.35;

    const animate = () => {
      timeRef.current += 0.016;
      ctx.clearRect(0, 0, rect.width, rect.height);

      const time = timeRef.current;

      if (state === 'idle') {
        const pulse = Math.sin(time * 1.5) * 0.1 + 1;
        drawOrb(ctx, centerX, centerY, baseRadius * pulse, 0.6, time);
      } else if (state === 'listening') {
        const rippleIntensity = audioLevel * 0.5 + 0.3;
        drawOrb(ctx, centerX, centerY, baseRadius, 0.8, time);
        drawRipples(ctx, centerX, centerY, baseRadius, time, rippleIntensity);
      } else if (state === 'speaking') {
        const wave = Math.sin(time * 3) * 0.15 + 1;
        drawOrb(ctx, centerX, centerY, baseRadius * wave, 0.9, time);
        drawGlowWaves(ctx, centerX, centerY, baseRadius, time);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [state, audioLevel]);

  const drawOrb = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
    opacity: number,
    time: number
  ) => {
    const gradient = ctx.createRadialGradient(
      x - radius * 0.3,
      y - radius * 0.3,
      radius * 0.2,
      x,
      y,
      radius
    );

    gradient.addColorStop(0, `rgba(134, 239, 172, ${opacity * 0.9})`);
    gradient.addColorStop(0.4, `rgba(74, 222, 128, ${opacity * 0.7})`);
    gradient.addColorStop(0.7, `rgba(34, 197, 94, ${opacity * 0.4})`);
    gradient.addColorStop(1, `rgba(22, 163, 74, ${opacity * 0.1})`);

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.shadowColor = 'rgba(74, 222, 128, 0.6)';
    ctx.shadowBlur = 30;
    ctx.strokeStyle = `rgba(134, 239, 172, ${opacity * 0.5})`;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.shadowBlur = 0;

    const shimmer = Math.sin(time * 2) * 0.3 + 0.7;
    const shimmerGradient = ctx.createRadialGradient(
      x - radius * 0.5,
      y - radius * 0.5,
      0,
      x - radius * 0.5,
      y - radius * 0.5,
      radius * 0.6
    );
    shimmerGradient.addColorStop(0, `rgba(255, 255, 255, ${shimmer * 0.3})`);
    shimmerGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = shimmerGradient;
    ctx.fill();
  };

  const drawRipples = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    baseRadius: number,
    time: number,
    intensity: number
  ) => {
    for (let i = 0; i < 3; i++) {
      const offset = (time * 2 + i * 0.8) % 2;
      const rippleRadius = baseRadius + offset * baseRadius * 0.5;
      const opacity = (1 - offset / 2) * intensity;

      ctx.beginPath();
      ctx.arc(x, y, rippleRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(134, 239, 172, ${opacity * 0.4})`;
      ctx.lineWidth = 3;
      ctx.stroke();
    }
  };

  const drawGlowWaves = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    baseRadius: number,
    time: number
  ) => {
    for (let i = 0; i < 5; i++) {
      const angle = (time + i * 0.4) % (Math.PI * 2);
      const waveRadius = baseRadius * (1 + Math.sin(angle) * 0.2);
      const opacity = (Math.sin(angle) + 1) * 0.3;

      ctx.beginPath();
      ctx.arc(x, y, waveRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(74, 222, 128, ${opacity})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  };

  return (
    <div className="flex items-center justify-center">
      <canvas
        ref={canvasRef}
        className="w-64 h-64 md:w-80 md:h-80"
        style={{ width: '320px', height: '320px' }}
      />
    </div>
  );
}
