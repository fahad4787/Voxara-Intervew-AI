"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils/cn";

export function AudioVisualizer({
  active,
  className,
}: {
  active: boolean;
  className?: string;
}) {
  const bars = Array.from({ length: 5 }, (_, i) => i);

  return (
    <div className={cn("flex h-8 items-end gap-1", className)}>
      {bars.map((bar) => (
        <span
          key={bar}
          className={cn(
            "w-1.5 rounded-full bg-[var(--accent)]",
            active ? "opacity-100" : "h-2 opacity-40",
          )}
          style={{
            height: active ? `${10 + bar * 4 + (bar % 2) * 6}px` : undefined,
          }}
        />
      ))}
    </div>
  );
}

export function WaveCanvas({
  stream,
  active,
}: {
  stream: MediaStream | null;
  active: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!stream || !active || !canvasRef.current) return;

    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 64;
    source.connect(analyser);

    const data = new Uint8Array(analyser.frequencyBinCount);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let frame = 0;

    const draw = () => {
      frame = requestAnimationFrame(draw);
      if (!ctx) return;
      analyser.getByteFrequencyData(data);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = canvas.width / data.length;
      data.forEach((value, index) => {
        const height = (value / 255) * canvas.height;
        ctx.fillStyle = "#0f766e";
        ctx.fillRect(
          index * barWidth,
          canvas.height - height,
          barWidth - 2,
          height,
        );
      });
    };

    draw();

    return () => {
      cancelAnimationFrame(frame);
      source.disconnect();
      void audioContext.close();
    };
  }, [stream, active]);

  return (
    <canvas
      ref={canvasRef}
      width={180}
      height={36}
      className="rounded-lg bg-[var(--surface-muted)]"
    />
  );
}
