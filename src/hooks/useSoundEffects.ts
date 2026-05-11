'use client';

import { useCallback, useRef } from 'react';

let globalCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!globalCtx) {
    globalCtx = new AudioContext();
  }
  if (globalCtx.state === 'suspended') {
    globalCtx.resume();
  }
  return globalCtx;
}

function playTone(freq: number, duration: number, type: OscillatorType = 'sine', gainVal = 0.15) {
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  gain.gain.setValueAtTime(gainVal, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration);
}

function playNoise(duration: number, gainVal = 0.1) {
  const ctx = getAudioContext();
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 800;
  gain.gain.setValueAtTime(gainVal, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  noise.start();
  noise.stop(ctx.currentTime + duration);
}

export function useSoundEffects() {
  const enabledRef = useRef(true);

  const click = useCallback(() => {
    if (!enabledRef.current) return;
    playTone(600, 0.08, 'sine', 0.1);
  }, []);

  const snap = useCallback(() => {
    if (!enabledRef.current) return;
    playNoise(0.06, 0.08);
  }, []);

  const run = useCallback(() => {
    if (!enabledRef.current) return;
    playTone(220, 0.3, 'sawtooth', 0.06);
  }, []);

  const win = useCallback(() => {
    if (!enabledRef.current) return;
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    [523, 659, 784].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.15);
      gain.gain.setValueAtTime(0.15, now + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.15);
      osc.stop(now + i * 0.15 + 0.4);
    });
  }, []);

  const lose = useCallback(() => {
    if (!enabledRef.current) return;
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    [300, 250, 200].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, now + i * 0.2);
      gain.gain.setValueAtTime(0.1, now + i * 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.2 + 0.3);
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 800;
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.2);
      osc.stop(now + i * 0.2 + 0.3);
    });
  }, []);

  const star = useCallback(() => {
    if (!enabledRef.current) return;
    playTone(1200, 0.15, 'sine', 0.12);
  }, []);

  const unlock = useCallback(() => {
    if (!enabledRef.current) return;
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    [880, 1100, 1320].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.1);
      gain.gain.setValueAtTime(0.12, now + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.3);
    });
  }, []);

  const toggle = useCallback(() => {
    enabledRef.current = !enabledRef.current;
  }, []);

  const isEnabled = useCallback(() => enabledRef.current, []);

  return { click, snap, run, win, lose, star, unlock, toggle, isEnabled };
}
