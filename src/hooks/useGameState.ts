'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { getLevel, type LevelData } from '@/lib/levels';

export type GameScreen = 'main-menu' | 'character-select' | 'level-select' | 'playing' | 'paused' | 'level-complete';

export interface LevelProgress {
  id: number;
  unlocked: boolean;
  completed: boolean;
  bestStars: number;
  bestBlocks: number;
  firstAttempt: boolean;
}

export interface SecretProgress {
  id: number;
  unlocked: boolean;
  played: boolean;
}

export interface GameState {
  screen: GameScreen;
  character: string;
  currentLevel: number;
  levels: LevelProgress[];
  secretLevels: SecretProgress[];
  streak: number;
  sessionStats: {
    blocksUsed: number;
    maxBlocks: number;
    timeElapsed: number;
    stars: number;
    points: number;
  };
  isGuest: boolean;
  studentId?: string;
  sessionId?: string;
}

const AVATARS = [
  { id: 'robot-1', emoji: '⚡', color: '#3498DB' },
  { id: 'robot-2', emoji: '🔧', color: '#F1C40F' },
  { id: 'robot-3', emoji: '🚀', color: '#E67E22' },
  { id: 'robot-4', emoji: '💻', color: '#9B59B6' },
  { id: 'robot-5', emoji: '🤖', color: '#1ABC9C' },
  { id: 'robot-6', emoji: '🔊', color: '#E74C3C' },
];

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function createDefaultState(): GameState {
  const secretPool = shuffleArray([101, 102, 103, 104, 105]);
  return {
    screen: 'main-menu',
    character: 'robot-1',
    currentLevel: 1,
    levels: Array.from({ length: 15 }, (_, i) => ({
      id: i + 1,
      unlocked: i === 0,
      completed: false,
      bestStars: 0,
      bestBlocks: 0,
      firstAttempt: true,
    })),
    secretLevels: secretPool.map((id) => ({ id, unlocked: false, played: false })),
    streak: 0,
    sessionStats: { blocksUsed: 0, maxBlocks: Infinity, timeElapsed: 0, stars: 0, points: 0 },
    isGuest: true,
  };
}

function getInitialState(): GameState {
  const saved = typeof window !== 'undefined' ? localStorage.getItem('mbot_game_state') : null;
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed.levels?.length === 15) return parsed;
    } catch { /* ignore */ }
  }
  return createDefaultState();
}

export function useGameState() {
  const [state, setState] = useState<GameState>(getInitialState);

  const saveState = useCallback((newState: GameState) => {
    setState(newState);
    if (typeof window !== 'undefined') {
      localStorage.setItem('mbot_game_state', JSON.stringify(newState));
    }
  }, []);

  const navigateTo = useCallback((screen: GameScreen) => {
    setState((prev) => {
      const next = { ...prev, screen };
      if (typeof window !== 'undefined') localStorage.setItem('mbot_game_state', JSON.stringify(next));
      return next;
    });
  }, []);

  const selectCharacter = useCallback((id: string) => {
    setState((prev) => {
      const next = { ...prev, character: id, screen: 'level-select' as GameScreen };
      if (typeof window !== 'undefined') localStorage.setItem('mbot_game_state', JSON.stringify(next));
      return next;
    });
  }, []);

  const startLevel = useCallback((levelId: number, isGuest: boolean, studentId?: string) => {
    const level = getLevel(levelId);
    if (!level) return;
    setState((prev) => {
      const next = {
        ...prev,
        screen: 'playing' as GameScreen,
        currentLevel: levelId,
        isGuest,
        studentId,
        sessionStats: {
          blocksUsed: 0,
          maxBlocks: level.maxBlocks,
          timeElapsed: 0,
          stars: 0,
          points: 0,
        },
      };
      if (typeof window !== 'undefined') localStorage.setItem('mbot_game_state', JSON.stringify(next));
      return next;
    });
  }, []);

  const completeLevel = useCallback((stars: number, blocksUsed: number, timeElapsed: number) => {
    setState((prev) => {
      const levelIdx = prev.levels.findIndex((l) => l.id === prev.currentLevel);
      const isNormal = prev.currentLevel <= 15;
      const isFirstAttempt = isNormal ? prev.levels[levelIdx]?.firstAttempt !== false : false;

      const newLevels = [...prev.levels];
      const newSecrets = [...prev.secretLevels];
      let newStreak = prev.streak;
      let newlyUnlocked: number[] = [];

      if (isNormal) {
        const lvl = newLevels[levelIdx];
        if (lvl) {
          lvl.completed = true;
          lvl.bestStars = Math.max(lvl.bestStars, stars);
          lvl.bestBlocks = lvl.bestBlocks > 0 ? Math.min(lvl.bestBlocks, blocksUsed) : blocksUsed;
          lvl.firstAttempt = false;
        }

        // Unlock next
        if (levelIdx + 1 < newLevels.length) {
          newLevels[levelIdx + 1].unlocked = true;
        }

        // Streak
        if (stars >= 1) {
          newStreak = isFirstAttempt ? prev.streak + 1 : 0;
        } else {
          newStreak = 0;
        }

        // Unlock secret at streak 5
        if (newStreak > 0 && newStreak % 5 === 0) {
          const nextUnlocked = newSecrets.findIndex((s) => !s.unlocked && !s.played);
          if (nextUnlocked >= 0) {
            newSecrets[nextUnlocked].unlocked = true;
            newlyUnlocked.push(newSecrets[nextUnlocked].id);
          }
        }
      } else {
        // Secret level played
        const secretIdx = newSecrets.findIndex((s) => s.id === prev.currentLevel);
        if (secretIdx >= 0) {
          newSecrets[secretIdx].played = true;
        }
      }

      // Compute points
      const level = getLevel(prev.currentLevel);
      const base = level ? 100 + (prev.currentLevel * 25) : 0;
      const optimalBonus = level && blocksUsed <= level.optimalBlocks ? 50 : 0;
      const starBonus = stars === 3 ? 100 : 0;
      const isSecret = prev.currentLevel >= 100;
      const points = isSecret ? (base + optimalBonus + starBonus) * 2 : base + optimalBonus + starBonus;

      const next = {
        ...prev,
        levels: newLevels,
        secretLevels: newSecrets,
        streak: newStreak,
        screen: 'level-complete' as GameScreen,
        sessionStats: {
          blocksUsed,
          maxBlocks: prev.sessionStats.maxBlocks,
          timeElapsed,
          stars,
          points,
        },
      };
      if (typeof window !== 'undefined') localStorage.setItem('mbot_game_state', JSON.stringify(next));
      return next;
    });
  }, []);

  const resetProgress = useCallback(() => {
    const secretPool = shuffleArray([101, 102, 103, 104, 105]);
    const next: GameState = {
      screen: 'main-menu',
      character: state.character,
      currentLevel: 1,
      levels: Array.from({ length: 15 }, (_, i) => ({
        id: i + 1,
        unlocked: i === 0,
        completed: false,
        bestStars: 0,
        bestBlocks: 0,
        firstAttempt: true,
      })),
      secretLevels: secretPool.map((id) => ({ id, unlocked: false, played: false })),
      streak: 0,
      sessionStats: { blocksUsed: 0, maxBlocks: Infinity, timeElapsed: 0, stars: 0, points: 0 },
      isGuest: true,
    };
    saveState(next);
  }, [state.character, saveState]);

  return {
    state,
    navigateTo,
    selectCharacter,
    startLevel,
    completeLevel,
    resetProgress,
    avatars: AVATARS,
  };
}
