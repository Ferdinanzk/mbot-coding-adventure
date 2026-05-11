'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import type { Pose } from '@/lib/simulator/engine';

export interface SimulatorCanvasProps {
  level: { start: { x: number; y: number; heading: number }; goal: { x: number; y: number }; walls: { x1: number; y1: number; x2: number; y2: number }[]; groundLines?: { x1: number; y1: number; x2: number; y2: number }[]; cellSize: number; width: number; height: number };
  isPlaying: boolean;
  onWin?: () => void;
  onLose?: (reason: string) => void;
  onCollision?: () => void;
  onFrame?: (frameCount: number, pose: Pose) => void;
}

export default function SimulatorCanvas({ level, isPlaying, onWin, onLose, onCollision, onFrame }: SimulatorCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pose, setPose] = useState<Pose>({
    x: level.start.x * level.cellSize + level.cellSize / 2,
    y: level.start.y * level.cellSize + level.cellSize / 2,
    theta: (level.start.heading * Math.PI) / 180,
  });
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const runningRef = useRef(false);
  const frameCountRef = useRef(0);
  const lastFrameRef = useRef(0);
  const elapsedRef = useRef(0);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    // Grid
    ctx.strokeStyle = '#eee';
    ctx.lineWidth = 1;
    for (let x = 0; x <= w; x += level.cellSize) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y <= h; y += level.cellSize) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    // Walls
    ctx.strokeStyle = '#2C3E50';
    ctx.lineWidth = 4;
    ctx.lineCap = 'square';
    ctx.beginPath();
    for (const wall of level.walls) {
      ctx.moveTo(wall.x1, wall.y1);
      ctx.lineTo(wall.x2, wall.y2);
    }
    ctx.stroke();

    // Ground lines
    if (level.groundLines) {
      ctx.strokeStyle = '#3498DB';
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (const l of level.groundLines) {
        ctx.moveTo(l.x1, l.y1);
        ctx.lineTo(l.x2, l.y2);
      }
      ctx.stroke();
    }

    // Goal
    const gs = level.cellSize * 0.8;
    const gx = level.goal.x * level.cellSize + (level.cellSize - gs) / 2;
    const gy = level.goal.y * level.cellSize + (level.cellSize - gs) / 2;
    ctx.fillStyle = 'rgba(46, 204, 113, 0.3)';
    ctx.strokeStyle = '#27AE60';
    ctx.lineWidth = 2;
    ctx.fillRect(gx, gy, gs, gs);
    ctx.strokeRect(gx, gy, gs, gs);

    // Robot
    const r = pose;
    ctx.save();
    ctx.translate(r.x, r.y);
    ctx.rotate(r.theta);

    ctx.fillStyle = '#4ECDC4';
    ctx.strokeStyle = '#2C9E96';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-17, -13, 34, 26, 4);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#FF6B6B';
    ctx.beginPath();
    ctx.moveTo(17, 0);
    ctx.lineTo(10, -5);
    ctx.lineTo(10, 5);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#333';
    ctx.fillRect(-19, -13, 4, 10);
    ctx.fillRect(-19, 3, 4, 10);

    ctx.fillStyle = '#555';
    ctx.beginPath();
    ctx.arc(14, 0, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = isRunning ? '#2ECC71' : '#EB5757';
    ctx.beginPath(); ctx.arc(-8, -6, 3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(-8, 6, 3, 0, Math.PI * 2); ctx.fill();

    ctx.restore();

    ctx.restore();
  }, [level, pose, isRunning]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.scale(dpr, dpr);
    render();
  }, [render]);

  useEffect(() => {
    if (isPlaying && !isRunning) {
      setIsRunning(true);
      runningRef.current = true;
      lastFrameRef.current = performance.now();
      requestAnimationFrame(gameLoop);
    } else if (!isPlaying && isRunning) {
      setIsRunning(false);
      runningRef.current = false;
    }
  }, [isPlaying, isRunning]);

  const gameLoop = useCallback((timestamp: number) => {
    if (!runningRef.current) return;
    render();
    requestAnimationFrame(gameLoop);
  }, [render]);

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="w-full h-full block rounded-lg"
        style={{ width: '100%', height: '100%' }}
      />
      <div className="absolute top-2 left-2 bg-black/60 text-white px-3 py-2 rounded text-xs font-mono pointer-events-none">
        <div>Time: {elapsed.toFixed(1)}s</div>
        <div>Pose: ({pose.x.toFixed(0)}, {pose.y.toFixed(0)}) θ{((pose.theta * 180) / Math.PI).toFixed(0)}°</div>
      </div>
    </div>
  );
}
