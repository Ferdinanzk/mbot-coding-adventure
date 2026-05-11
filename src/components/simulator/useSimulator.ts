'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { Kinematics, CollisionEngine, SensorSystem, CommandProcessor, type Pose, type Command } from '@/lib/simulator/engine';

export interface UseSimulatorOptions {
  level: { start: { x: number; y: number; heading: number }; goal: { x: number; y: number }; walls: { x1: number; y1: number; x2: number; y2: number }[]; groundLines?: { x1: number; y1: number; x2: number; y2: number }[]; cellSize: number; width: number; height: number };
  onWin?: () => void;
  onLose?: (reason: string) => void;
  onCollision?: () => void;
  onFrame?: (frameCount: number, pose: Pose) => void;
  timeScale?: number;
}

export interface UseSimulatorReturn {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isRunning: boolean;
  start: () => void;
  stop: () => void;
  reset: () => void;
  sendCommand: (cmd: Command) => Promise<void>;
  pose: Pose;
  elapsed: number;
  getUltrasonicDistance: () => number;
  getLineSensorValue: (sensor: 'LEFT' | 'RIGHT') => number;
}

export function useSimulator(options: UseSimulatorOptions): UseSimulatorReturn {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [pose, setPose] = useState<Pose>({ x: options.level.start.x * options.level.cellSize + options.level.cellSize / 2, y: options.level.start.y * options.level.cellSize + options.level.cellSize / 2, theta: (options.level.start.heading * Math.PI) / 180 });
  const [elapsed, setElapsed] = useState(0);

  const robotRef = useRef({
    pose: { ...pose },
    motorL: 0, motorR: 0, vL: 0, vR: 0,
    speed: 60, turnSpeed: 30,
  });

  const runningRef = useRef(false);
  const frameRef = useRef(0);
  const lastFrameRef = useRef(0);
  const elapsedRef = useRef(0);
  const processorRef = useRef<CommandProcessor | null>(null);
  const kinematicsRef = useRef(new Kinematics());
  const collisionRef = useRef(new CollisionEngine(34, 26));
  const sensorRef = useRef(new SensorSystem());

  const scaleCanvas = useCallback((canvas: HTMLCanvasElement) => {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.scale(dpr, dpr);
    return ctx;
  }, []);

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

    const { level } = options;

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
    ctx.lineCap = 'square' as CanvasLineCap;
    ctx.beginPath();
    for (const w of level.walls) {
      ctx.moveTo(w.x1, w.y1);
      ctx.lineTo(w.x2, w.y2);
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
    const r = robotRef.current.pose;
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

    // Front marker
    ctx.fillStyle = '#FF6B6B';
    ctx.beginPath();
    ctx.moveTo(17, 0);
    ctx.lineTo(10, -5);
    ctx.lineTo(10, 5);
    ctx.closePath();
    ctx.fill();

    // Wheels
    ctx.fillStyle = '#333';
    ctx.fillRect(-19, -13, 4, 10);
    ctx.fillRect(-19, 3, 4, 10);

    // Ultrasonic mount
    ctx.fillStyle = '#555';
    ctx.beginPath();
    ctx.arc(14, 0, 4, 0, Math.PI * 2);
    ctx.fill();

    // LEDs
    const robot = robotRef.current;
    ctx.fillStyle = (robot.motorL !== 0 || robot.motorR !== 0) ? '#2ECC71' : '#EB5757';
    ctx.beginPath(); ctx.arc(-8, -6, 3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(-8, 6, 3, 0, Math.PI * 2); ctx.fill();

    ctx.restore();

    // Sensor rays
    const sensorX = r.x + 14 * Math.cos(r.theta);
    const sensorY = r.y + 14 * Math.sin(r.theta);
    const maxRange = 200;
    const beamAngle = 15 * (Math.PI / 180);
    ctx.strokeStyle = 'rgba(255, 165, 0, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(sensorX, sensorY);
    ctx.lineTo(sensorX + maxRange * Math.cos(r.theta - beamAngle / 2), sensorY + maxRange * Math.sin(r.theta - beamAngle / 2));
    ctx.arc(sensorX, sensorY, maxRange, r.theta - beamAngle / 2, r.theta + beamAngle / 2);
    ctx.lineTo(sensorX, sensorY);
    ctx.stroke();

    ctx.restore();
  }, [options]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    scaleCanvas(canvas);

    robotRef.current.pose = {
      x: options.level.start.x * options.level.cellSize + options.level.cellSize / 2,
      y: options.level.start.y * options.level.cellSize + options.level.cellSize / 2,
      theta: (options.level.start.heading * Math.PI) / 180,
    };
    robotRef.current.motorL = 0;
    robotRef.current.motorR = 0;
    robotRef.current.vL = 0;
    robotRef.current.vR = 0;

    processorRef.current = new CommandProcessor(robotRef.current, kinematicsRef.current);
    setPose({ ...robotRef.current.pose });
    setElapsed(0);
    elapsedRef.current = 0;
    frameRef.current = 0;

    render();

    return () => {
      runningRef.current = false;
    };
  }, [options.level, scaleCanvas, render]);

  const loop = useCallback((timestamp: number) => {
    if (!runningRef.current) return;
    const dt = Math.min((timestamp - lastFrameRef.current) / 1000, 0.05) * (options.timeScale || 1);
    lastFrameRef.current = timestamp;
    elapsedRef.current += dt;
    frameRef.current++;

    processorRef.current?.update(dt);

    const prevPose = { ...robotRef.current.pose };
    kinematicsRef.current.updatePose(robotRef.current.pose, robotRef.current.vL, robotRef.current.vR, dt);

    const hit = collisionRef.current.checkCollision(robotRef.current.pose, options.level.walls);
    if (hit) {
      robotRef.current.pose = prevPose;
      robotRef.current.motorL = 0;
      robotRef.current.motorR = 0;
      robotRef.current.vL = 0;
      robotRef.current.vR = 0;
      processorRef.current?.stop();
      runningRef.current = false;
      setIsRunning(false);
      options.onCollision?.();
      return;
    }

    if (collisionRef.current.isInGoal(robotRef.current.pose, options.level.goal, options.level.cellSize)) {
      runningRef.current = false;
      setIsRunning(false);
      processorRef.current?.stop();
      robotRef.current.motorL = 0;
      robotRef.current.motorR = 0;
      robotRef.current.vL = 0;
      robotRef.current.vR = 0;
      options.onWin?.();
      return;
    }

    setPose({ ...robotRef.current.pose });
    setElapsed(elapsedRef.current);
    options.onFrame?.(frameRef.current, { ...robotRef.current.pose });
    render();
    requestAnimationFrame(loop);
  }, [options, render]);

  const start = useCallback(() => {
    if (runningRef.current) return;
    runningRef.current = true;
    lastFrameRef.current = performance.now();
    setIsRunning(true);
    requestAnimationFrame(loop);
  }, [loop]);

  const stop = useCallback(() => {
    runningRef.current = false;
    setIsRunning(false);
    robotRef.current.motorL = 0;
    robotRef.current.motorR = 0;
    robotRef.current.vL = 0;
    robotRef.current.vR = 0;
    processorRef.current?.stop();
  }, []);

  const reset = useCallback(() => {
    stop();
    robotRef.current.pose = {
      x: options.level.start.x * options.level.cellSize + options.level.cellSize / 2,
      y: options.level.start.y * options.level.cellSize + options.level.cellSize / 2,
      theta: (options.level.start.heading * Math.PI) / 180,
    };
    elapsedRef.current = 0;
    frameRef.current = 0;
    setPose({ ...robotRef.current.pose });
    setElapsed(0);
    render();
  }, [options.level, stop, render]);

  const sendCommand = useCallback((cmd: Command) => {
    return new Promise<void>((resolve) => {
      processorRef.current?.startCommand(cmd, () => resolve());
    });
  }, []);

  const getUltrasonicDistance = useCallback(() => {
    return sensorRef.current.readUltrasonic(robotRef.current.pose, options.level.walls);
  }, [options.level]);

  const getLineSensorValue = useCallback((sensor: 'LEFT' | 'RIGHT') => {
    return sensorRef.current.readLineFollower(robotRef.current.pose, options.level.groundLines)[sensor === 'LEFT' ? 0 : 1];
  }, [options.level]);

  return {
    canvasRef,
    isRunning,
    start,
    stop,
    reset,
    sendCommand,
    pose,
    elapsed,
    getUltrasonicDistance,
    getLineSensorValue,
  };
}
