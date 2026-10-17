import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  analyser: AnalyserNode | null;
  isRecording: boolean;
  isPlaying?: boolean;
  barColor?: string;
  barCount?: number;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  analyser,
  isRecording,
  isPlaying = false,
  barColor = '#10B981', // Emerald 500
  barCount = 36,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      if (isRecording && analyser) {
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);

        const step = Math.floor(bufferLength / barCount);
        const barWidth = Math.max(3, (width / barCount) - 2);

        for (let i = 0; i < barCount; i++) {
          const index = Math.min(i * step, bufferLength - 1);
          const value = dataArray[index] / 255;
          const barHeight = Math.max(4, value * (height * 0.9));

          const x = i * (barWidth + 2);
          const y = (height - barHeight) / 2;

          // Gradient color: Emerald to Algerian Ruby Red accent
          const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
          gradient.addColorStop(0, '#34D399'); // emerald-400
          gradient.addColorStop(0.5, '#10B981'); // emerald-500
          gradient.addColorStop(1, '#059669'); // emerald-600

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, 3);
          ctx.fill();
        }
      } else if (isPlaying) {
        // Animated simulated sound waves for audio playback
        const time = Date.now() * 0.006;
        const barWidth = Math.max(3, (width / barCount) - 2);

        for (let i = 0; i < barCount; i++) {
          const wave = Math.sin(time + i * 0.3) * Math.cos(time * 0.5 + i * 0.2);
          const normalized = Math.max(0.15, (wave + 1) / 2);
          const barHeight = Math.max(4, normalized * (height * 0.8));

          const x = i * (barWidth + 2);
          const y = (height - barHeight) / 2;

          const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
          gradient.addColorStop(0, '#6EE7B7');
          gradient.addColorStop(1, '#047857');

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, 3);
          ctx.fill();
        }
      } else {
        // Idle subtle waveform
        const barWidth = Math.max(3, (width / barCount) - 2);
        for (let i = 0; i < barCount; i++) {
          const barHeight = 4;
          const x = i * (barWidth + 2);
          const y = (height - barHeight) / 2;

          ctx.fillStyle = 'rgba(74, 222, 128, 0.2)';
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, 2);
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [analyser, isRecording, isPlaying, barColor, barCount]);

  return (
    <canvas
      ref={canvasRef}
      width={360}
      height={64}
      className="w-full h-16 rounded-xl bg-slate-900/60 border border-emerald-500/20 shadow-inner"
    />
  );
};
