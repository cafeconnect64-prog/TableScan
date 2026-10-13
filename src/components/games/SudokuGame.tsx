import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, Lightbulb, Trophy, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

type Difficulty = 'easy' | 'medium' | 'hard';

// Sample solvable puzzles
const PUZZLES: Record<Difficulty, { puzzle: (number | null)[][]; solution: number[][] }> = {
  easy: {
    puzzle: [
      [5, 3, null, null, 7, null, null, null, null],
      [6, null, null, 1, 9, 5, null, null, null],
      [null, 9, 8, null, null, null, null, 6, null],
      [8, null, null, null, 6, null, null, null, 3],
      [4, null, null, 8, null, 3, null, null, 1],
      [7, null, null, null, 2, null, null, null, 6],
      [null, 6, null, null, null, null, 2, 8, null],
      [null, null, null, 4, 1, 9, null, null, 5],
      [null, null, null, null, 8, null, null, 7, 9],
    ],
    solution: [
      [5, 3, 4, 6, 7, 8, 9, 1, 2],
      [6, 7, 2, 1, 9, 5, 3, 4, 8],
      [1, 9, 8, 3, 4, 2, 5, 6, 7],
      [8, 5, 9, 7, 6, 1, 4, 2, 3],
      [4, 2, 6, 8, 5, 3, 7, 9, 1],
      [7, 1, 3, 9, 2, 4, 8, 5, 6],
      [9, 6, 1, 5, 3, 7, 2, 8, 4],
      [2, 8, 7, 4, 1, 9, 6, 3, 5],
      [3, 4, 5, 2, 8, 6, 1, 7, 9],
    ],
  },
  medium: {
    puzzle: [
      [null, null, null, 2, 6, null, 7, null, 1],
      [6, 8, null, null, 7, null, null, 9, null],
      [1, 9, null, null, null, 4, 5, null, null],
      [8, 2, null, 1, null, null, null, 4, null],
      [null, null, 4, 6, null, 2, 9, null, null],
      [null, 5, null, null, null, 3, null, 2, 8],
      [null, null, 9, 3, null, null, null, 7, 4],
      [null, 4, null, null, 5, null, null, 3, 6],
      [7, null, 3, null, 1, 8, null, null, null],
    ],
    solution: [
      [4, 3, 5, 2, 6, 9, 7, 8, 1],
      [6, 8, 2, 5, 7, 1, 4, 9, 3],
      [1, 9, 7, 8, 3, 4, 5, 6, 2],
      [8, 2, 6, 1, 9, 5, 3, 4, 7],
      [3, 7, 4, 6, 8, 2, 9, 1, 5],
      [9, 5, 1, 7, 4, 3, 6, 2, 8],
      [5, 1, 9, 3, 2, 6, 8, 7, 4],
      [2, 4, 8, 9, 5, 7, 1, 3, 6],
      [7, 6, 3, 4, 1, 8, 2, 5, 9],
    ],
  },
  hard: {
    puzzle: [
      [null, 2, null, null, null, null, null, null, null],
      [null, null, null, 6, null, null, null, null, 3],
      [null, 7, 4, null, 8, null, null, null, null],
      [null, null, null, null, null, 3, null, null, 2],
      [null, 8, null, null, 4, null, null, 1, null],
      [6, null, null, 5, null, null, null, null, null],
      [null, null, null, null, 1, null, 7, 8, null],
      [5, null, null, null, null, 9, null, null, null],
      [null, null, null, null, null, null, null, 4, null],
    ],
    solution: [
      [1, 2, 6, 4, 3, 7, 9, 5, 8],
      [8, 9, 5, 6, 2, 1, 4, 7, 3],
      [3, 7, 4, 9, 8, 5, 1, 2, 6],
      [4, 5, 7, 1, 9, 3, 8, 6, 2],
      [9, 8, 3, 2, 4, 6, 5, 1, 7],
      [6, 1, 2, 5, 7, 8, 3, 9, 4],
      [2, 6, 9, 3, 1, 4, 7, 8, 5],
      [5, 4, 8, 7, 6, 9, 2, 3, 1],
      [7, 3, 1, 8, 5, 2, 6, 4, 9],
    ],
  },
};

export const SudokuGame: React.FC = () => {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [board, setBoard] = useState<(number | null)[][]>([]);
  const [initialBoard, setInitialBoard] = useState<(number | null)[][]>([]);
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [hintsLeft, setHintsLeft] = useState(3);

  // Initialize board
  useEffect(() => {
    resetPuzzle(difficulty);
  }, [difficulty]);

  // Timer
  useEffect(() => {
    if (isWon) return;
    const interval = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isWon]);

  const resetPuzzle = (diff: Difficulty) => {
    const raw = PUZZLES[diff].puzzle;
    const copied = raw.map((row) => [...row]);
    setBoard(copied);
    setInitialBoard(raw.map((row) => [...row]));
    setSelectedCell(null);
    setSeconds(0);
    setIsWon(false);
    setHintsLeft(3);
  };

  const handleCellClick = (r: number, c: number) => {
    setSelectedCell([r, c]);
  };

  const handleNumberInput = (num: number | null) => {
    if (!selectedCell) return;
    const [r, c] = selectedCell;
    if (initialBoard[r][c] !== null) return; // Cannot edit initial cells

    const next = board.map((row) => [...row]);
    next[r][c] = num;
    setBoard(next);

    // Check if won
    const sol = PUZZLES[difficulty].solution;
    let complete = true;
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (next[i][j] !== sol[i][j]) {
          complete = false;
          break;
        }
      }
      if (!complete) break;
    }

    if (complete) {
      setIsWon(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  const useHint = () => {
    if (hintsLeft <= 0 || !selectedCell) return;
    const [r, c] = selectedCell;
    if (initialBoard[r][c] !== null) return;

    const sol = PUZZLES[difficulty].solution;
    const next = board.map((row) => [...row]);
    next[r][c] = sol[r][c];
    setBoard(next);
    setHintsLeft((prev) => prev - 1);
  };

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center select-none w-full max-w-sm mx-auto">
      {/* Top Header */}
      <div className="w-full flex items-center justify-between mb-3 text-xs">
        <div className="flex items-center gap-1 bg-slate-800/80 p-0.5 rounded-lg border border-slate-700/60">
          {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
            <button
              key={d}
              onClick={() => {
                setDifficulty(d);
              }}
              className={`px-2.5 py-1 capitalize rounded-md transition-all ${
                difficulty === d
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-slate-300 bg-slate-800/60 px-2 py-1 rounded border border-slate-700/40">
            ⏱ {formatTime(seconds)}
          </span>
          <button
            onClick={() => resetPuzzle(difficulty)}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition"
            title="Restart Puzzle"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Victory Banner */}
      {isWon && (
        <div className="w-full mb-3 p-3 bg-emerald-950/80 border border-emerald-600/50 rounded-xl flex items-center gap-3 text-emerald-200 animate-bounce">
          <Trophy className="w-6 h-6 text-amber-400 shrink-0" />
          <div>
            <div className="font-bold text-sm text-emerald-100">Chef's compliments! You solved it!</div>
            <div className="text-xs text-emerald-300">Time: {formatTime(seconds)} · Show this to staff for a smile!</div>
          </div>
        </div>
      )}

      {/* 9x9 Board */}
      <div className="grid grid-cols-9 bg-slate-950 border-2 border-slate-600 rounded-lg overflow-hidden shadow-2xl p-1 gap-0.5">
        {board.map((row, r) =>
          row.map((val, c) => {
            const isInitial = initialBoard[r]?.[c] !== null;
            const isSelected = selectedCell?.[0] === r && selectedCell?.[1] === c;
            const inSameRow = selectedCell?.[0] === r;
            const inSameCol = selectedCell?.[1] === c;
            const borderR = (c + 1) % 3 === 0 && c !== 8 ? 'border-r-2 border-r-slate-600' : 'border-r border-r-slate-800/60';
            const borderB = (r + 1) % 3 === 0 && r !== 8 ? 'border-b-2 border-b-slate-600' : 'border-b border-b-slate-800/60';

            return (
              <button
                key={`${r}-${c}`}
                onClick={() => handleCellClick(r, c)}
                className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-sm font-semibold transition-all relative ${borderR} ${borderB} ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-300 z-10 font-bold'
                    : inSameRow || inSameCol
                    ? 'bg-slate-800/70 text-slate-200'
                    : 'bg-slate-900/90 text-slate-300 hover:bg-slate-800/50'
                } ${isInitial ? 'text-amber-300 font-bold' : 'text-slate-100'}`}
              >
                {val !== null ? val : ''}
              </button>
            );
          })
        )}
      </div>

      {/* Number Controls */}
      <div className="w-full mt-3 grid grid-cols-5 sm:grid-cols-10 gap-1.5">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <button
            key={n}
            onClick={() => handleNumberInput(n)}
            className="py-2.5 bg-slate-800 hover:bg-slate-700 active:bg-amber-500 active:text-slate-950 text-slate-200 font-bold rounded-lg border border-slate-700/80 transition-all text-sm active:scale-95 shadow-sm"
          >
            {n}
          </button>
        ))}
        <button
          onClick={() => handleNumberInput(null)}
          className="py-2.5 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 font-semibold rounded-lg border border-rose-800/50 transition-all text-xs active:scale-95 col-span-1"
          title="Clear cell"
        >
          Erase
        </button>
      </div>

      {/* Bottom Hint */}
      <div className="w-full flex items-center justify-between mt-3 text-xs text-slate-400">
        <button
          onClick={useHint}
          disabled={hintsLeft <= 0 || !selectedCell}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-amber-400 disabled:opacity-40 transition"
        >
          <Lightbulb className="w-3.5 h-3.5" />
          <span>Hint ({hintsLeft} left)</span>
        </button>

        <span className="text-[11px] text-slate-500 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-500" /> Pass table waiting time
        </span>
      </div>
    </div>
  );
};
