'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import { getLevel, getSimLevel, getPoints } from '@/lib/levels';
import { useSimulator } from '@/components/simulator/useSimulator';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import BlocklyWorkspace, { type BlocklyWorkspaceRef } from '@/components/blockly/BlocklyWorkspace';
import { executeProgram } from '@/components/blockly/custom-blocks';
import VictoryModal from '@/components/game/VictoryModal';
import PauseOverlay from '@/components/game/PauseOverlay';

export default function CodePageClient() {
  const router = useRouter();
  const params = useParams();
  const { t } = useI18n();
  const levelId = Number(params.levelId);
  const level = useMemo(() => getLevel(levelId), [levelId]);
  const simLevel = useMemo(() => getSimLevel(levelId), [levelId]);

  const [blockCount, setBlockCount] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showVictory, setShowVictory] = useState(false);
  const [showFail, setShowFail] = useState('');
  const [stars, setStars] = useState(0);
  const [points, setPoints] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [streak, setStreak] = useState(0);
  const sounds = useSoundEffects();

  const workspaceRef = useRef<BlocklyWorkspaceRef>(null);
  const abortRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleWin = useCallback(() => {
    if (abortRef.current) return;
    const timeTaken = simRef.current?.elapsed || 0;
    const used = blockCount;
    const lvl = level;
    if (!lvl) return;

    let starRating = 1;
    if (used <= lvl.optimalBlocks) starRating = 3;
    else if (used <= lvl.maxBlocks) starRating = 2;

    const pts = getPoints(levelId, starRating, used);

    setStars(starRating);
    setPoints(pts);
    setElapsed(timeTaken);
    setShowVictory(true);
    sounds.win();

    // Save progress
    const saved = localStorage.getItem('mbot_game_state');
    if (saved) {
      const state = JSON.parse(saved);
      const levelIdx = state.levels?.findIndex((l: any) => l.id === levelId);
      const isNormal = levelId <= 15;
      const isFirstAttempt = isNormal ? state.levels[levelIdx]?.firstAttempt !== false : false;

      if (isNormal && state.levels[levelIdx]) {
        state.levels[levelIdx].completed = true;
        state.levels[levelIdx].bestStars = Math.max(state.levels[levelIdx].bestStars || 0, starRating);
        state.levels[levelIdx].bestBlocks = state.levels[levelIdx].bestBlocks > 0
          ? Math.min(state.levels[levelIdx].bestBlocks, used)
          : used;
        state.levels[levelIdx].firstAttempt = false;

        if (levelIdx + 1 < state.levels.length) {
          state.levels[levelIdx + 1].unlocked = true;
        }

        if (starRating >= 1) {
          state.streak = isFirstAttempt ? (state.streak || 0) + 1 : 0;
        } else {
          state.streak = 0;
        }

        if (state.streak > 0 && state.streak % 5 === 0) {
          const nextUnlocked = state.secretLevels?.findIndex((s: any) => !s.unlocked && !s.played);
          if (nextUnlocked >= 0) {
            state.secretLevels[nextUnlocked].unlocked = true;
          }
        }
      } else if (!isNormal) {
        const secretIdx = state.secretLevels?.findIndex((s: any) => s.id === levelId);
        if (secretIdx >= 0) {
          state.secretLevels[secretIdx].played = true;
        }
      }

      state.sessionStats = {
        blocksUsed: used,
        maxBlocks: lvl.maxBlocks,
        timeElapsed: timeTaken,
        stars: starRating,
        points: pts,
      };

      setStreak(state.streak || 0);
      localStorage.setItem('mbot_game_state', JSON.stringify(state));
    }
  }, [blockCount, level, levelId]);

  const handleCollision = useCallback(() => {
    if (abortRef.current) return;
    setShowFail(t.errors.collision);
    setIsRunning(false);
    sounds.lose();
  }, [t, sounds]);

  const handleTimeout = useCallback(() => {
    if (abortRef.current) return;
    setShowFail(t.errors.timeout);
    setIsRunning(false);
    sounds.lose();
  }, [t, sounds]);

  const simOptions = useMemo(() => simLevel ? {
    level: {
      start: simLevel.start,
      goal: simLevel.goal,
      walls: simLevel.walls,
      groundLines: simLevel.groundLines,
      cellSize: simLevel.cellSize,
      width: simLevel.gridSize[0] * simLevel.cellSize,
      height: simLevel.gridSize[1] * simLevel.cellSize,
    },
    onWin: handleWin,
    onCollision: handleCollision,
    timeScale: 2,
  } : { level: { start: { x: 0, y: 0, heading: 0 }, goal: { x: 0, y: 0 }, walls: [], cellSize: 60, width: 600, height: 400 }, timeScale: 2 }, [simLevel, handleWin, handleCollision]);

  const sim = useSimulator(simOptions);
  const simRef = useRef(sim);
  simRef.current = sim;

  useEffect(() => {
    if (!level) {
      router.push('/levels');
    }
  }, [level, router]);

  const runProgram = async () => {
    if (!simRef.current || !level || !workspaceRef.current) return;
    abortRef.current = false;
    setShowFail('');
    setShowVictory(false);
    setIsRunning(true);

    simRef.current.reset();
    simRef.current.start();
    sounds.run();

    // Timeout check
    if (level.timeLimit) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        if (!abortRef.current) {
          simRef.current?.stop();
          handleTimeout();
        }
      }, level.timeLimit * 1000);
    }

    // Block limit check
    if (blockCount > level.maxBlocks) {
      simRef.current.stop();
      setShowFail(t.errors.tooManyBlocks);
      setIsRunning(false);
      return;
    }

    const program = workspaceRef.current.getProgram();
    if (!program.length) {
      simRef.current.stop();
      setIsRunning(false);
      return;
    }

    const sendCommand = async (payload: { action: string; params: Record<string, any> }) => {
      if (abortRef.current) return;
      await simRef.current?.sendCommand(payload);
    };

    const checkObstacle = async () => {
      const dist = simRef.current?.getUltrasonicDistance() || 999;
      return dist < 20;
    };

    try {
      await executeProgram(program, sendCommand, checkObstacle, () => abortRef.current);
      // If code finishes naturally without win/collision
      if (!abortRef.current && !showVictory && !showFail) {
        simRef.current?.stop();
        setIsRunning(false);
      }
    } catch (err) {
      console.error(err);
      simRef.current?.stop();
      setIsRunning(false);
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const handleReset = () => {
    abortRef.current = true;
    sim.stop();
    sim.reset();
    setShowFail('');
    setShowVictory(false);
    setIsRunning(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const handlePause = () => {
    setIsPaused(true);
    sim.stop();
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleResume = () => {
    setIsPaused(false);
    if (isRunning) {
      sim.start();
    }
  };

  const handleRestart = () => {
    setIsPaused(false);
    handleReset();
  };

  const handleQuit = () => {
    setIsPaused(false);
    router.push('/levels');
  };

  const handleRetry = () => {
    setShowVictory(false);
    setShowFail('');
    handleReset();
  };

  const handleNextLevel = () => {
    const nextId = levelId + 1;
    if (getLevel(nextId)) {
      router.push(`/code/${nextId}`);
    } else {
      router.push('/levels');
    }
  };

  if (!level) return null;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => { sounds.click(); router.push('/levels'); }} className="text-lg">← {t.home.back}</button>
          <div className="font-bold text-lg">{t.levelSelect.title} {levelId}</div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div>{t.game.blocks}: <span className={`font-mono font-bold ${blockCount > level.maxBlocks ? 'text-red-500' : 'text-[#3498DB]'}`}>{blockCount}/{level.maxBlocks}</span></div>
          <div>{t.game.time}: <span className="font-mono font-bold">{sim.elapsed.toFixed(1)}s</span></div>
          <button onClick={() => { sounds.click(); handlePause(); }} className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200">⏸</button>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <div className="flex-1 min-h-[300px] md:min-h-0 relative">
          <BlocklyWorkspace
            ref={workspaceRef}
            availableBlocks={level.availableBlocks}
            blockCount={setBlockCount}
          />
        </div>
        <div className="w-full md:w-[400px] lg:w-[480px] flex flex-col border-t md:border-t-0 md:border-l border-gray-200">
          <div className="flex-1 relative bg-gray-50">
            <canvas
              ref={sim.canvasRef}
              className="w-full h-full block"
              style={{ width: '100%', height: '100%' }}
            />
          </div>
          <div className="p-4 bg-white border-t border-gray-200 flex gap-3">
            {!isRunning ? (
              <button
                onClick={() => { sounds.click(); runProgram(); }}
                className="flex-1 py-3 rounded-xl bg-[#2ECC71] text-white font-bold text-lg shadow hover:scale-105 transition-transform"
              >
              ▶ {t.game.run}
              </button>
            ) : (
              <button
                onClick={() => { sounds.click(); handleReset(); }}
                className="flex-1 py-3 rounded-xl bg-[#E74C3C] text-white font-bold text-lg shadow hover:scale-105 transition-transform"
              >
              ⏹ {t.game.reset}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Hint bar */}
      <div className="px-4 py-2 bg-[#FFF3CD] text-[#856404] text-sm border-t border-[#FFEEBA]">
        💡 {level.hints[0]}
      </div>

      {/* Fail message */}
      {showFail && !showVictory && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl p-6 max-w-xs w-full mx-4 text-center shadow-xl">
            <div className="text-4xl mb-2">💥</div>
            <div className="text-lg font-bold mb-4">{showFail}</div>
            <div className="flex gap-3">
              <button onClick={() => { sounds.click(); handleRetry(); }} className="flex-1 py-2 rounded-lg bg-[#3498DB] text-white font-bold">{t.results.retry}</button>
              <button onClick={() => { sounds.click(); router.push('/levels'); }} className="flex-1 py-2 rounded-lg bg-gray-100 text-gray-700 font-bold">{t.results.menu}</button>
            </div>
          </div>
        </div>
      )}

      {/* Victory */}
      {showVictory && (
        <VictoryModal
          stars={stars}
          points={points}
          blocksUsed={blockCount}
          timeTaken={elapsed}
          streak={streak}
          onRetry={handleRetry}
          onNext={handleNextLevel}
          onMenu={() => router.push('/levels')}
          hasNext={!!getLevel(levelId + 1)}
        />
      )}

      {/* Pause */}
      {isPaused && (
        <PauseOverlay
          onResume={handleResume}
          onRestart={handleRestart}
          onQuit={handleQuit}
        />
      )}
    </div>
  );
}
