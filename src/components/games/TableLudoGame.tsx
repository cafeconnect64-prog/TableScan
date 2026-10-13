import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Trophy,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  Bot,
  Users,
  Radio,
  Dices,
  Crown,
  ChevronRight,
  Flame,
  HelpCircle,
  Play,
  Share2,
  Swords,
  Zap,
  MessageSquare,
  Smile,
  Award,
  CheckCircle2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useStore } from '../../context/StoreContext';

// --- TYPES & CONSTANTS ---
export type PlayerColor = 'red' | 'green' | 'yellow' | 'blue';

export type PlayerType = 'human' | 'bot' | 'remote_table';

export type GameMode = '1v1_ai' | '1v1_table' | '4p_room';

export interface PlayerConfig {
  color: PlayerColor;
  name: string;
  type: PlayerType;
  assignedTable?: string;
  characterTitle: string;
  avatarIcon: string;
  avatarBg: string;
  score: number;
}

export interface Token {
  id: number; // 0, 1, 2, 3
  color: PlayerColor;
  // position: -1 is home base, 0..50 are common track steps, 51..55 home stretch, 56 is finished
  step: number;
}

export interface FloatingEmote {
  id: string;
  color: PlayerColor;
  emoji: string;
  text?: string;
}

export interface GameState {
  roomId: string;
  hostTable: string;
  gameMode: GameMode;
  activeColors: PlayerColor[]; // In 1v1: ['red', 'yellow'] or ['red', 'green']; In 4P: ['red', 'green', 'yellow', 'blue']
  tokensCountPerPlayer: 2 | 4; // Fast table match (2) vs Classic (4)
  players: Record<PlayerColor, PlayerConfig>;
  tokens: Record<PlayerColor, Token[]>;
  currentTurn: PlayerColor;
  diceValue: number | null;
  hasRolled: boolean;
  consecutiveSixes: number;
  winner: PlayerColor | null;
  rankings: PlayerColor[];
  lastAction: string;
  chatMessages: { id: string; table: string; text: string; time: string }[];
  tableWins: Record<string, number>;
  updatedAt: number;
}

export const COLOR_THEMES: Record<
  PlayerColor,
  {
    name: string;
    character: string;
    role: string;
    bg: string;
    border: string;
    text: string;
    accent: string;
    lightBg: string;
    starColor: string;
    glow: string;
    quadrantBg: string;
    homeTriangle: string;
  }
> = {
  red: {
    name: 'Red Chef',
    character: '👨‍🍳 Master Chef',
    role: 'Sizzling Spatula Champion',
    bg: 'bg-rose-600',
    border: 'border-rose-500',
    text: 'text-rose-400',
    accent: '#ef4444',
    lightBg: 'bg-rose-950/40',
    starColor: 'text-rose-400',
    glow: 'rgba(239, 68, 68, 0.4)',
    quadrantBg: '#b91c1c',
    homeTriangle: '#dc2626',
  },
  green: {
    name: 'Green Dino',
    character: '🦖 Foodie Dino',
    role: 'Snack Devourer Champion',
    bg: 'bg-emerald-600',
    border: 'border-emerald-500',
    text: 'text-emerald-400',
    accent: '#10b981',
    lightBg: 'bg-emerald-950/40',
    starColor: 'text-emerald-400',
    glow: 'rgba(16, 185, 129, 0.4)',
    quadrantBg: '#047857',
    homeTriangle: '#059669',
  },
  yellow: {
    name: 'Yellow Robo',
    character: '🤖 Robo Butler',
    role: 'Precision Server Champion',
    bg: 'bg-amber-500',
    border: 'border-amber-400',
    text: 'text-amber-400',
    accent: '#f59e0b',
    lightBg: 'bg-amber-950/40',
    starColor: 'text-amber-400',
    glow: 'rgba(245, 158, 11, 0.4)',
    quadrantBg: '#d97706',
    homeTriangle: '#d97706',
  },
  blue: {
    name: 'Blue Barista',
    character: '☕ Magic Barista',
    role: 'Espresso Wizard Champion',
    bg: 'bg-cyan-600',
    border: 'border-cyan-400',
    text: 'text-cyan-400',
    accent: '#06b6d4',
    lightBg: 'bg-cyan-950/40',
    starColor: 'text-cyan-400',
    glow: 'rgba(6, 182, 212, 0.4)',
    quadrantBg: '#0e7490',
    homeTriangle: '#0891b2',
  },
};

// 52 Common Track Cells mapped to (row, col) coordinates on 15x15 Ludo board:
const COMMON_TRACK_COORDS: [number, number][] = [
  /* 0 - Red start */ [6, 1],
  /* 1 */ [6, 2],
  /* 2 */ [6, 3],
  /* 3 */ [6, 4],
  /* 4 */ [6, 5],
  /* 5 */ [5, 6],
  /* 6 */ [4, 6],
  /* 7 */ [3, 6],
  /* 8 - Safe Star */ [2, 6],
  /* 9 */ [1, 6],
  /* 10 */ [0, 6],
  /* 11 */ [0, 7],
  /* 12 */ [0, 8],
  /* 13 - Green start */ [1, 8],
  /* 14 */ [2, 8],
  /* 15 */ [3, 8],
  /* 16 */ [4, 8],
  /* 17 */ [5, 8],
  /* 18 */ [6, 9],
  /* 19 */ [6, 10],
  /* 20 */ [6, 11],
  /* 21 - Safe Star */ [6, 12],
  /* 22 */ [6, 13],
  /* 23 */ [6, 14],
  /* 24 */ [7, 14],
  /* 25 */ [8, 14],
  /* 26 - Yellow start */ [8, 13],
  /* 27 */ [8, 12],
  /* 28 */ [8, 11],
  /* 29 */ [8, 10],
  /* 30 */ [8, 9],
  /* 31 */ [9, 8],
  /* 32 */ [10, 8],
  /* 33 */ [11, 8],
  /* 34 - Safe Star */ [12, 8],
  /* 35 */ [13, 8],
  /* 36 */ [14, 8],
  /* 37 */ [14, 7],
  /* 38 */ [14, 6],
  /* 39 - Blue start */ [13, 6],
  /* 40 */ [12, 6],
  /* 41 */ [11, 6],
  /* 42 */ [10, 6],
  /* 43 */ [9, 6],
  /* 44 */ [8, 5],
  /* 45 */ [8, 4],
  /* 46 */ [8, 3],
  /* 47 - Safe Star */ [8, 2],
  /* 48 */ [8, 1],
  /* 49 */ [8, 0],
  /* 50 */ [7, 0],
  /* 51 */ [6, 0],
];

// Start offsets for each color along common 52-cell track
const START_OFFSET: Record<PlayerColor, number> = {
  red: 0,
  green: 13,
  yellow: 26,
  blue: 39,
};

// Home stretch 5 cells for each color (steps 51..55) + finish (56)
const HOME_STRETCH_COORDS: Record<PlayerColor, [number, number][]> = {
  red: [
    [7, 1],
    [7, 2],
    [7, 3],
    [7, 4],
    [7, 5],
    [7, 6],
  ],
  green: [
    [1, 7],
    [2, 7],
    [3, 7],
    [4, 7],
    [5, 7],
    [6, 7],
  ],
  yellow: [
    [7, 13],
    [7, 12],
    [7, 11],
    [7, 10],
    [7, 9],
    [7, 8],
  ],
  blue: [
    [13, 7],
    [12, 7],
    [11, 7],
    [10, 7],
    [9, 7],
    [8, 7],
  ],
};

// Safe star cells (global track indices where captures cannot happen)
const SAFE_STAR_INDICES = [0, 8, 13, 21, 26, 34, 39, 47];

// Home base 4 token coordinates for each color
const HOME_BASE_COORDS: Record<PlayerColor, [number, number][]> = {
  red: [
    [2, 2],
    [2, 3],
    [3, 2],
    [3, 3],
  ],
  green: [
    [2, 11],
    [2, 12],
    [3, 11],
    [3, 12],
  ],
  yellow: [
    [11, 11],
    [11, 12],
    [12, 11],
    [12, 12],
  ],
  blue: [
    [11, 2],
    [11, 3],
    [12, 2],
    [12, 3],
  ],
};

// Convert player step (-1 to 56) to (row, col)
function getTokenGridCoords(color: PlayerColor, tokenIndex: number, step: number): [number, number] {
  if (step === -1) {
    return HOME_BASE_COORDS[color][tokenIndex] || [2, 2];
  }
  if (step >= 51 && step <= 56) {
    const stretchIdx = Math.min(step - 51, 5);
    return HOME_STRETCH_COORDS[color][stretchIdx];
  }
  // Common track loop (0..50)
  const trackIdx = (START_OFFSET[color] + step) % 52;
  return COMMON_TRACK_COORDS[trackIdx] || [7, 7];
}

// Convert player step to global track index (for collision/capture check)
function getGlobalTrackIndex(color: PlayerColor, step: number): number | null {
  if (step < 0 || step > 50) return null; // In home base or home stretch
  return (START_OFFSET[color] + step) % 52;
}

// Web Audio sound synthesizer for authentic responsive Ludo King gameplay
class LudoAudioSynthesizer {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private getContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  playDiceRoll() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    for (let i = 0; i < 5; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(240 + Math.random() * 220, now + i * 0.05);
      gain.gain.setValueAtTime(0.09, now + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.045);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.05);
      osc.stop(now + i * 0.05 + 0.05);
    }
  }

  playStepHop() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(460, now);
    osc.frequency.exponentialRampToValueAtTime(680, now + 0.08);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  playCapture() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    // Punch knockout sound
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(360, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.26);
    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.29);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.29);
  }

  playSixChime() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);
      gain.gain.setValueAtTime(0.15, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.22);
    });
  }

  playWinFanfare() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.1);
      gain.gain.setValueAtTime(0.22, now + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.1);
      osc.stop(now + idx * 0.1 + 0.45);
    });
  }
}

const soundSynth = new LudoAudioSynthesizer();

const STORAGE_ROOM_KEY = 'restaurant_table_ludo_king_v3';

export const TableLudoGame: React.FC = () => {
  const { selectedTable, tables } = useStore();

  // Mode: '1v1_ai' (Table vs AI Bot) | '1v1_table' (Table 1 vs Table 2) | '4p_room' (4 Players & AI)
  const [gameMode, setGameMode] = useState<GameMode>('1v1_ai');
  const [fastMode, setFastMode] = useState<boolean>(true); // 2 tokens for quick table gameplay
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [rollingDiceNum, setRollingDiceNum] = useState<number>(6);
  const [showHowToPlay, setShowHowToPlay] = useState<boolean>(false);
  const [aiThinking, setAiThinking] = useState<boolean>(false);
  const [floatingEmotes, setFloatingEmotes] = useState<FloatingEmote[]>([]);

  // Challenge modal for inviting another table
  const [inviteTableNum, setInviteTableNum] = useState<string>(() => {
    const other = tables.find((t) => t.tableNumber !== selectedTable);
    return other ? other.tableNumber : '2';
  });

  // INITIAL STATE FACTORY
  const createFreshGame = useCallback(
    (mode: GameMode = '1v1_ai', tokensCount: 2 | 4 = 2, targetOpponentTable: string = '2'): GameState => {
      const activeColors: PlayerColor[] =
        mode === '4p_room' ? ['red', 'green', 'yellow', 'blue'] : ['red', 'yellow'];

      const initialTokens: Record<PlayerColor, Token[]> = {
        red: Array.from({ length: tokensCount }, (_, idx) => ({ id: idx, color: 'red', step: -1 })),
        green:
          mode === '4p_room'
            ? Array.from({ length: tokensCount }, (_, idx) => ({ id: idx, color: 'green', step: -1 }))
            : [],
        yellow: Array.from({ length: tokensCount }, (_, idx) => ({ id: idx, color: 'yellow', step: -1 })),
        blue:
          mode === '4p_room'
            ? Array.from({ length: tokensCount }, (_, idx) => ({ id: idx, color: 'blue', step: -1 }))
            : [],
      };

      const isRemote1v1 = mode === '1v1_table';

      return {
        roomId: `ROOM-LUDO-${selectedTable}`,
        hostTable: selectedTable,
        gameMode: mode,
        activeColors,
        tokensCountPerPlayer: tokensCount,
        players: {
          red: {
            color: 'red',
            name: `Table ${selectedTable} (You)`,
            type: 'human',
            assignedTable: selectedTable,
            characterTitle: 'Master Chef 👨‍🍳',
            avatarIcon: '👨‍🍳',
            avatarBg: 'bg-rose-600',
            score: 0,
          },
          green: {
            color: 'green',
            name: mode === '4p_room' ? 'Dino Bot 🦖' : 'Dino (Inactive)',
            type: 'bot',
            characterTitle: 'Foodie Dino 🦖',
            avatarIcon: '🦖',
            avatarBg: 'bg-emerald-600',
            score: 0,
          },
          yellow: {
            color: 'yellow',
            name: isRemote1v1 ? `Table ${targetOpponentTable}` : 'AI Bot 🤖 (Robo Butler)',
            type: isRemote1v1 ? 'remote_table' : 'bot',
            assignedTable: isRemote1v1 ? targetOpponentTable : undefined,
            characterTitle: isRemote1v1 ? `Table ${targetOpponentTable} Opponent` : 'Robo Waiter 🤖',
            avatarIcon: isRemote1v1 ? '🍽️' : '🤖',
            avatarBg: 'bg-amber-500',
            score: 0,
          },
          blue: {
            color: 'blue',
            name: mode === '4p_room' ? 'Barista Bot ☕' : 'Barista (Inactive)',
            type: 'bot',
            characterTitle: 'Magic Barista ☕',
            avatarIcon: '☕',
            avatarBg: 'bg-cyan-600',
            score: 0,
          },
        },
        tokens: initialTokens,
        currentTurn: 'red',
        diceValue: null,
        hasRolled: false,
        consecutiveSixes: 0,
        winner: null,
        rankings: [],
        lastAction:
          mode === '1v1_ai'
            ? `1 vs 1 Match against AI Bot! Table ${selectedTable}'s turn to roll.`
            : mode === '1v1_table'
            ? `1 vs 1 Table Clash! Table ${selectedTable} vs Table ${targetOpponentTable}.`
            : `4-Player Royal Match! Roll a 6 to summon your 3D Master Chef.`,
        chatMessages: [
          {
            id: '1',
            table: selectedTable,
            text:
              mode === '1v1_ai'
                ? `1 vs 1 vs Smart AI Bot! May the best chef win!`
                : `⚔️ Live Table Clash! Table ${selectedTable} has entered the arena!`,
            time: 'Just now',
          },
        ],
        tableWins: { [selectedTable]: 0, [targetOpponentTable]: 0 },
        updatedAt: Date.now(),
      };
    },
    [selectedTable]
  );

  const [gameState, setGameState] = useState<GameState>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_ROOM_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as GameState;
          if (parsed && parsed.tokens && parsed.players && parsed.activeColors) {
            return parsed;
          }
        } catch {
          // ignore
        }
      }
    }
    return createFreshGame('1v1_ai', 2, '2');
  });

  // Sync game state to localStorage for real-time table-to-table multiplayer
  const updateGameState = useCallback((newState: GameState | ((prev: GameState) => GameState)) => {
    setGameState((prev) => {
      const next = typeof newState === 'function' ? newState(prev) : newState;
      const withTimestamp = { ...next, updatedAt: Date.now() };
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_ROOM_KEY, JSON.stringify(withTimestamp));
      }
      return withTimestamp;
    });
  }, []);

  // Listen for storage events (enables Table 1 to connect to Table 2 across tabs/devices)
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_ROOM_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue) as GameState;
          if (parsed && parsed.tokens && parsed.activeColors) {
            setGameState(parsed);
          }
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Sync sound toggle to synth
  useEffect(() => {
    soundSynth.enabled = soundEnabled;
  }, [soundEnabled]);

  // Check if player has won (all active tokens at step 56)
  const checkPlayerWin = useCallback(
    (color: PlayerColor, tokens: Record<PlayerColor, Token[]>): boolean => {
      const playerTokens = tokens[color] || [];
      return playerTokens.length > 0 && playerTokens.every((t) => t.step === 56);
    },
    []
  );

  // Check valid moves for current player given a dice roll
  const getLegalMoves = useCallback(
    (color: PlayerColor, dice: number, tokens: Record<PlayerColor, Token[]>): Token[] => {
      const playerTokens = tokens[color] || [];
      const legal: Token[] = [];

      for (const t of playerTokens) {
        if (t.step === -1) {
          // Can only come out of base on a 6
          if (dice === 6) {
            legal.push(t);
          }
        } else if (t.step < 56) {
          // Can advance if new step <= 56
          if (t.step + dice <= 56) {
            legal.push(t);
          }
        }
      }

      return legal;
    },
    []
  );

  // Advance turn to next active player
  const passTurn = useCallback((state: GameState): GameState => {
    const order = state.activeColors;
    let nextIndex = (order.indexOf(state.currentTurn) + 1) % order.length;
    let nextColor = order[nextIndex];
    let attempts = 0;

    // Skip already ranked/won players
    while (state.rankings.includes(nextColor) && attempts < order.length) {
      nextIndex = (nextIndex + 1) % order.length;
      nextColor = order[nextIndex];
      attempts++;
    }

    const nextPlayer = state.players[nextColor];
    const isNextBot = nextPlayer?.type === 'bot';

    return {
      ...state,
      currentTurn: nextColor,
      diceValue: null,
      hasRolled: false,
      consecutiveSixes: 0,
      lastAction: `${nextPlayer?.name || nextColor}'s turn ${isNextBot ? '(AI Bot Thinking...)' : ''}`,
    };
  }, []);

  // Execute a token move
  const executeTokenMove = useCallback(
    (token: Token, dice: number) => {
      updateGameState((prev) => {
        const { currentTurn, tokens, rankings } = prev;
        if (token.color !== currentTurn) return prev;

        const newStep = token.step === -1 ? 0 : token.step + dice;
        soundSynth.playStepHop();

        const updatedTokens: Record<PlayerColor, Token[]> = {
          ...tokens,
          [currentTurn]: tokens[currentTurn].map((t) =>
            t.id === token.id ? { ...t, step: newStep } : t
          ),
        };

        let capturedMessage = '';
        let awardedBonusTurn = dice === 6;

        // Collision & Cut detection (only on common track 0..50, not on safe stars)
        if (newStep >= 0 && newStep <= 50) {
          const targetGlobalTrack = getGlobalTrackIndex(currentTurn, newStep);
          const isSafeStar =
            targetGlobalTrack !== null && SAFE_STAR_INDICES.includes(targetGlobalTrack);

          if (!isSafeStar && targetGlobalTrack !== null) {
            // Check other players' tokens at the exact same global track
            for (const otherColor of prev.activeColors) {
              if (otherColor !== currentTurn) {
                const opponents = updatedTokens[otherColor] || [];
                const captured = opponents.find(
                  (op) =>
                    op.step >= 0 &&
                    op.step <= 50 &&
                    getGlobalTrackIndex(otherColor, op.step) === targetGlobalTrack
                );

                if (captured) {
                  // Captured! Send back to home base!
                  soundSynth.playCapture();
                  updatedTokens[otherColor] = opponents.map((op) =>
                    op.id === captured.id ? { ...op, step: -1 } : op
                  );
                  capturedMessage = ` 💥 ${COLOR_THEMES[currentTurn].name} KNOCKED OUT ${COLOR_THEMES[otherColor].name}'s character! Extra Turn!`;
                  awardedBonusTurn = true; // Bonus roll for cutting opponent!
                  break;
                }
              }
            }
          }
        }

        // Check if player reached 56
        if (newStep === 56) {
          soundSynth.playSixChime();
        }

        // Check if player won
        const hasWonNow = checkPlayerWin(currentTurn, updatedTokens);
        let newRankings = [...rankings];
        let newWinner = prev.winner;
        let newWins = { ...prev.tableWins };

        if (hasWonNow && !rankings.includes(currentTurn)) {
          newRankings.push(currentTurn);
          if (!newWinner) {
            newWinner = currentTurn;
            const wonTable = prev.players[currentTurn]?.assignedTable || currentTurn;
            newWins[wonTable] = (newWins[wonTable] || 0) + 1;
            soundSynth.playWinFanfare();
            confetti({
              particleCount: 150,
              spread: 90,
              origin: { y: 0.5 },
            });
          }
        }

        // Check if game completely finished (in 1v1, 1 winner finishes game!)
        const thresholdToFinish = prev.activeColors.length === 2 ? 1 : prev.activeColors.length - 1;
        if (newRankings.length >= thresholdToFinish) {
          return {
            ...prev,
            tokens: updatedTokens,
            hasRolled: false,
            diceValue: null,
            winner: newWinner,
            rankings: newRankings,
            tableWins: newWins,
            lastAction: `👑 LUDO KING WINNER: ${COLOR_THEMES[newWinner || 'red'].name}! Congratulations!`,
          };
        }

        // If rolled 6 or captured, player rolls again!
        if (awardedBonusTurn && !hasWonNow) {
          return {
            ...prev,
            tokens: updatedTokens,
            hasRolled: false,
            diceValue: null,
            lastAction: `🎲 ${COLOR_THEMES[currentTurn].name} gets a BONUS ROLL!${capturedMessage}`,
          };
        }

        // Otherwise pass turn
        return passTurn({
          ...prev,
          tokens: updatedTokens,
          rankings: newRankings,
          winner: newWinner,
          tableWins: newWins,
          lastAction: `${COLOR_THEMES[currentTurn].name} moved.${capturedMessage}`,
        });
      });
    },
    [updateGameState, checkPlayerWin, passTurn]
  );

  // Roll Dice Action
  const handleRollDice = useCallback(() => {
    if (gameState.hasRolled || gameState.winner || isRolling) return;

    // Check if it's currently a human or matching table's turn
    const activePlayer = gameState.players[gameState.currentTurn];
    const isMyTurn =
      activePlayer.type === 'human' ||
      (activePlayer.type === 'remote_table' && activePlayer.assignedTable === selectedTable);

    if (!isMyTurn && activePlayer.type !== 'bot') {
      return; // Remote player's turn
    }

    setIsRolling(true);
    soundSynth.playDiceRoll();

    // Dice tumble animation simulation
    let count = 0;
    const interval = setInterval(() => {
      setRollingDiceNum(Math.floor(Math.random() * 6) + 1);
      count++;
      if (count > 7) {
        clearInterval(interval);
        const finalDice = Math.floor(Math.random() * 6) + 1;
        setRollingDiceNum(finalDice);
        setIsRolling(false);

        if (finalDice === 6) {
          soundSynth.playSixChime();
        }

        updateGameState((prev) => {
          const legalMoves = getLegalMoves(prev.currentTurn, finalDice, prev.tokens);

          // Consecutive sixes rule: 3 consecutive sixes cancels turn
          const consecutive = finalDice === 6 ? prev.consecutiveSixes + 1 : 0;
          if (consecutive >= 3) {
            return passTurn({
              ...prev,
              diceValue: finalDice,
              hasRolled: true,
              consecutiveSixes: 0,
              lastAction: `⚠️ 3 consecutive sixes! Turn passed to next player.`,
            });
          }

          // If no legal moves available, automatically pass turn after brief timeout
          if (legalMoves.length === 0) {
            setTimeout(() => {
              updateGameState((p) => passTurn(p));
            }, 850);

            return {
              ...prev,
              diceValue: finalDice,
              hasRolled: true,
              consecutiveSixes: consecutive,
              lastAction: `${COLOR_THEMES[prev.currentTurn].name} rolled ${finalDice}. No legal moves!`,
            };
          }

          // Auto-move when exactly 1 legal move: fluid Ludo King fast play!
          if (legalMoves.length === 1) {
            const isBot = prev.players[prev.currentTurn].type === 'bot';
            setTimeout(
              () => {
                executeTokenMove(legalMoves[0], finalDice);
              },
              isBot ? 550 : 450
            );
          }

          return {
            ...prev,
            diceValue: finalDice,
            hasRolled: true,
            consecutiveSixes: consecutive,
            lastAction: `${COLOR_THEMES[prev.currentTurn].name} rolled a ${finalDice}! ${
              legalMoves.length === 1 ? 'Auto-advancing...' : 'Select a 3D character to move!'
            }`,
          };
        });
      }
    }, 55);
  }, [gameState, isRolling, selectedTable, updateGameState, getLegalMoves, passTurn, executeTokenMove]);

  // AI BOT CONTROLLER: When it's AI Bot's turn, automatically rolls and plays
  useEffect(() => {
    const activePlayer = gameState.players[gameState.currentTurn];
    if (!activePlayer || activePlayer.type !== 'bot' || gameState.winner || isRolling) {
      return;
    }

    setAiThinking(true);

    if (!gameState.hasRolled) {
      // Bot rolls after brief realistic human-like delay
      const rollTimer = setTimeout(() => {
        handleRollDice();
      }, 700);
      return () => clearTimeout(rollTimer);
    } else if (gameState.diceValue !== null) {
      // Bot chooses optimal token to move
      const legalMoves = getLegalMoves(gameState.currentTurn, gameState.diceValue, gameState.tokens);
      if (legalMoves.length === 0) {
        setAiThinking(false);
        return;
      }

      // If only 1 move, handleRollDice already scheduled auto-move!
      if (legalMoves.length === 1) {
        setAiThinking(false);
        return;
      }

      // AI HEURISTIC EVALUATION FOR MULTIPLE TOKENS:
      // 1. Can capture an opponent token? (+120)
      // 2. Can move into finish / podium? (+90)
      // 3. Has token in base and rolled 6? (+80)
      // 4. Can land on a safe star? (+60)
      // 5. Furthest token on track? (+40)
      let bestToken = legalMoves[0];
      let bestScore = -1;

      for (const t of legalMoves) {
        let score = 10;
        const targetStep = t.step === -1 ? 0 : t.step + gameState.diceValue;

        if (targetStep === 56) score += 95; // Finish!
        if (t.step === -1 && gameState.diceValue === 6) score += 85; // Spawn 3D character!

        if (targetStep >= 0 && targetStep <= 50) {
          const targetGlobal = getGlobalTrackIndex(gameState.currentTurn, targetStep);
          if (targetGlobal !== null) {
            // Check if it captures opponent
            if (!SAFE_STAR_INDICES.includes(targetGlobal)) {
              for (const other of gameState.activeColors) {
                if (other !== gameState.currentTurn) {
                  const hasOp = (gameState.tokens[other] || []).some(
                    (op) =>
                      op.step >= 0 &&
                      op.step <= 50 &&
                      getGlobalTrackIndex(other, op.step) === targetGlobal
                  );
                  if (hasOp) score += 130; // High priority to capture!
                }
              }
            } else {
              score += 65; // Safe star
            }
          }
        }

        // Add distance progressed
        score += targetStep * 2;

        if (score > bestScore) {
          bestScore = score;
          bestToken = t;
        }
      }

      const moveTimer = setTimeout(() => {
        setAiThinking(false);
        executeTokenMove(bestToken, gameState.diceValue!);
      }, 750);

      return () => clearTimeout(moveTimer);
    }
  }, [gameState, isRolling, handleRollDice, getLegalMoves, executeTokenMove]);

  // Mode Switch Handlers
  const handleSelectMode = (newMode: GameMode) => {
    setGameMode(newMode);
    const fresh = createFreshGame(newMode, fastMode ? 2 : 4, inviteTableNum);
    updateGameState(fresh);
  };

  // Connect Table 1 with Table 2 action (1 vs 1 Table Duel)
  const handleConnectWithTable = (targetTable: string) => {
    setGameMode('1v1_table');
    const fresh = createFreshGame('1v1_table', fastMode ? 2 : 4, targetTable);
    updateGameState(fresh);
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  // Reset Game
  const handleResetGame = () => {
    const fresh = createFreshGame(gameMode, fastMode ? 2 : 4, inviteTableNum);
    updateGameState(fresh);
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  // Send Floating Emote / Reaction
  const handleSendEmote = (emoji: string, text?: string) => {
    const newEmote: FloatingEmote = {
      id: Date.now().toString(),
      color: gameState.currentTurn,
      emoji,
      text,
    };
    setFloatingEmotes((prev) => [...prev, newEmote]);
    setTimeout(() => {
      setFloatingEmotes((prev) => prev.filter((e) => e.id !== newEmote.id));
    }, 2500);

    // Also add to chat log if text present
    if (text) {
      updateGameState((prev) => ({
        ...prev,
        chatMessages: [
          ...prev.chatMessages.slice(-5),
          {
            id: Date.now().toString(),
            table: selectedTable,
            text: `${emoji} ${text}`,
            time: 'Just now',
          },
        ],
      }));
    }
  };

  const activePlayerConfig = gameState.players[gameState.currentTurn];
  const isMyTurnNow =
    activePlayerConfig?.type === 'human' ||
    (activePlayerConfig?.type === 'remote_table' &&
      activePlayerConfig?.assignedTable === selectedTable);

  const legalMovesForActive =
    gameState.diceValue !== null && gameState.hasRolled
      ? getLegalMoves(gameState.currentTurn, gameState.diceValue, gameState.tokens)
      : [];

  return (
    <div className="w-full space-y-3.5 select-none animate-fade-in text-slate-100 pb-2">
      {/* 1. LUDO KING TOP HEADER & BRAND BAR */}
      <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-950/70 via-slate-900 to-amber-950/50 border border-amber-500/40 shadow-xl flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 via-yellow-500 to-amber-600 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/30 font-black">
            <Crown className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-sm text-amber-300 tracking-tight flex items-center gap-1.5">
                <span>TABLE LUDO KING</span>
                <span className="text-[10px] font-black px-1.5 py-0.2 bg-amber-500 text-slate-950 rounded uppercase shadow-sm">
                  Table {selectedTable}
                </span>
              </h3>
            </div>
            <div className="text-[11px] text-amber-200/80 flex items-center gap-2">
              <span>Classic Ludo King · 1 vs 1 AI · Inter-Table Duel</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          {/* Sound Toggle */}
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            title={soundEnabled ? 'Mute Sound FX' : 'Enable Sound FX'}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {/* How to Play Help */}
          <button
            type="button"
            onClick={() => setShowHowToPlay(!showHowToPlay)}
            className="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            title="How to play"
          >
            <HelpCircle className="w-4 h-4 text-amber-400" />
          </button>

          {/* Reset Game */}
          <button
            type="button"
            onClick={handleResetGame}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition active:scale-95"
            title="Restart Match"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">Rematch</span>
          </button>
        </div>
      </div>

      {/* 2. THREE DEDICATED LUDO KING GAME MODES */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
        {/* Mode 1: 1 vs 1 (Table vs AI Bot) */}
        <button
          type="button"
          onClick={() => handleSelectMode('1v1_ai')}
          className={`p-2.5 rounded-xl border transition flex items-center justify-between text-left ${
            gameMode === '1v1_ai'
              ? 'bg-amber-500/20 border-amber-500 text-amber-200 shadow-md ring-1 ring-amber-500/40'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold flex items-center gap-1">
                <span>1 vs 1 (Table vs AI Bot)</span>
                <span className="text-[9px] px-1 py-0.2 bg-amber-500/30 text-amber-300 rounded font-black">
                  POPULAR
                </span>
              </div>
              <div className="text-[10px] text-slate-400">You (Chef) vs Robo Bot 🤖</div>
            </div>
          </div>
          {gameMode === '1v1_ai' && (
            <span className="text-[9px] font-black uppercase text-amber-400 bg-amber-950 px-1.5 py-0.5 rounded border border-amber-500/40">
              Active
            </span>
          )}
        </button>

        {/* Mode 2: 1 vs 1 (Table 1 vs Table 2 Duel) */}
        <div
          className={`p-2.5 rounded-xl border transition flex flex-col justify-between gap-1.5 ${
            gameMode === '1v1_table'
              ? 'bg-cyan-500/20 border-cyan-500 text-cyan-200 shadow-md ring-1 ring-cyan-500/40'
              : 'bg-slate-900 border-slate-800 text-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                <Swords className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-xs">1 vs 1 Table Duel</div>
                <div className="text-[10px] text-slate-400">Connect Table to Table</div>
              </div>
            </div>
            {gameMode === '1v1_table' && (
              <span className="text-[9px] font-black uppercase text-cyan-400 bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-500/40">
                Live Duel
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 pt-0.5">
            <span className="text-[10px] text-slate-400">Opponent:</span>
            <select
              value={inviteTableNum}
              onChange={(e) => setInviteTableNum(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-0.5 text-slate-200 text-[11px] focus:outline-none"
            >
              {tables
                .filter((t) => t.tableNumber !== selectedTable)
                .map((t) => (
                  <option key={t.id} value={t.tableNumber}>
                    Table {t.tableNumber}
                  </option>
                ))}
            </select>
            <button
              type="button"
              onClick={() => handleConnectWithTable(inviteTableNum)}
              className="px-2 py-0.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg text-[10px] shadow transition active:scale-95"
            >
              Start Duel
            </button>
          </div>
        </div>

        {/* Mode 3: 4 Players (All Tables & AI Bots) */}
        <button
          type="button"
          onClick={() => handleSelectMode('4p_room')}
          className={`p-2.5 rounded-xl border transition flex items-center justify-between text-left ${
            gameMode === '4p_room'
              ? 'bg-purple-500/20 border-purple-500 text-purple-200 shadow-md ring-1 ring-purple-500/40'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
              <Crown className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold">4 Players (Royal Room)</div>
              <div className="text-[10px] text-slate-400">Chef, Dino, Robo & Barista</div>
            </div>
          </div>
          {gameMode === '4p_room' && (
            <span className="text-[9px] font-black uppercase text-purple-400 bg-purple-950 px-1.5 py-0.5 rounded border border-purple-500/40">
              Active
            </span>
          )}
        </button>
      </div>

      {/* HOW TO PLAY BANNER (COLLAPSIBLE) */}
      {showHowToPlay && (
        <div className="p-3.5 rounded-xl bg-slate-900/95 border border-amber-500/40 text-xs space-y-2 animate-fade-in shadow-xl">
          <div className="font-bold text-amber-300 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Ludo King Rules & 1 vs 1 Guide:</span>
          </div>
          <ul className="text-slate-300 space-y-1 list-disc pl-4 text-[11px] leading-relaxed">
            <li>
              <strong>1 vs 1 Table / Bot Mode:</strong> Direct face-to-face duel between Table{' '}
              {selectedTable} and your opponent! Turns alternate instantly.
            </li>
            <li>
              Roll a <strong>6 (छक्का)</strong> to summon your 3D character from Home onto the track!
            </li>
            <li>
              Rolling a 6 awards a <strong>Bonus Roll</strong>! 3 consecutive 6s cancels the turn.
            </li>
            <li>
              Landing on an opponent knocks them out back to base and awards you a{' '}
              <strong>Bonus Extra Turn</strong>!
            </li>
            <li>
              Tokens on <strong>★ Safe Stars</strong> and starting cells cannot be captured.
            </li>
            <li>
              Reach the center <strong>Victory Crown 👑</strong> to win the restaurant trophy!
            </li>
            <li>
              Empty seats are always handled by <strong>Smart AI Bots</strong> with zero lag!
            </li>
          </ul>
        </div>
      )}

      {/* 3. LUDO KING PLAYER STATIONS & 3D DICE ARENA */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 shadow-2xl space-y-3">
        {/* Top Info Bar: Turn Indicator & Fast Token Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
          {/* Active Turn Badge */}
          <div className="flex items-center gap-2">
            <div
              className={`w-10 h-10 rounded-2xl ${
                COLOR_THEMES[gameState.currentTurn].bg
              } border-2 border-amber-400 shadow-lg shadow-amber-500/20 flex items-center justify-center text-xl shrink-0 ${
                isRolling || aiThinking ? 'animate-bounce' : 'animate-pulse'
              }`}
            >
              {gameState.players[gameState.currentTurn].avatarIcon}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className={`font-black text-xs ${COLOR_THEMES[gameState.currentTurn].text}`}>
                  {gameState.players[gameState.currentTurn].name}
                </span>
                {gameState.players[gameState.currentTurn].type === 'bot' ? (
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1">
                    <Bot className="w-2.5 h-2.5" /> AI Bot
                  </span>
                ) : (
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                    <Users className="w-2.5 h-2.5" /> Table Active
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-400">{gameState.lastAction}</div>
            </div>
          </div>

          {/* Fast Match Toggle (2 vs 4 tokens) */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px]">
            <button
              type="button"
              onClick={() => {
                setFastMode(true);
                const fresh = createFreshGame(gameMode, 2, inviteTableNum);
                updateGameState(fresh);
              }}
              className={`px-2 py-1 rounded-lg font-bold transition ${
                fastMode
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ⚡ Fast 2-Token
            </button>
            <button
              type="button"
              onClick={() => {
                setFastMode(false);
                const fresh = createFreshGame(gameMode, 4, inviteTableNum);
                updateGameState(fresh);
              }}
              className={`px-2 py-1 rounded-lg font-bold transition ${
                !fastMode
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Classic 4-Token
            </button>
          </div>
        </div>

        {/* Ludo King Big Dice Station */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          {/* 3D Dice with Glow & Shadow */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div
                onClick={isMyTurnNow && !gameState.hasRolled ? handleRollDice : undefined}
                className={`w-15 h-15 rounded-2xl bg-gradient-to-br from-white via-slate-100 to-slate-200 border-2 border-slate-300 shadow-2xl flex items-center justify-center cursor-pointer transition-transform duration-300 ${
                  isRolling ? 'animate-spin scale-110' : 'hover:scale-105 active:scale-95'
                }`}
                style={{
                  boxShadow: `0 10px 25px -4px ${
                    COLOR_THEMES[gameState.currentTurn].glow
                  }, 0 4px 6px -2px rgba(0,0,0,0.5)`,
                }}
              >
                <RenderDiceDots value={isRolling ? rollingDiceNum : gameState.diceValue || 6} />
              </div>
              {/* 3D Drop Shadow on board */}
              <div className="w-12 h-2.5 bg-black/50 rounded-full blur-[2px] mx-auto mt-1" />
            </div>

            <div>
              <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <span>Dice Roll:</span>
                <span className="font-mono text-base font-black text-amber-400">
                  {isRolling ? '...' : gameState.diceValue !== null ? gameState.diceValue : 'Ready'}
                </span>
                {gameState.diceValue === 6 && (
                  <span className="text-[10px] font-black uppercase px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/40 animate-pulse">
                    छक्का (Bonus Roll!)
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-400">
                {gameState.hasRolled
                  ? legalMovesForActive.length > 0
                    ? `Tap your 3D character to advance ${gameState.diceValue} steps!`
                    : 'No valid moves possible with this roll.'
                  : isMyTurnNow
                  ? 'Tap dice or roll button below!'
                  : `${gameState.players[gameState.currentTurn].name} is rolling...`}
              </div>
            </div>
          </div>

          {/* Roll Button */}
          <div className="w-full sm:w-auto">
            {!gameState.hasRolled ? (
              <button
                type="button"
                disabled={!isMyTurnNow || isRolling}
                onClick={handleRollDice}
                className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-amber-300 disabled:opacity-40 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition active:scale-95"
              >
                <Dices className={`w-4 h-4 ${isRolling ? 'animate-spin' : ''}`} />
                <span>
                  {isRolling
                    ? 'Rolling Dice...'
                    : isMyTurnNow
                    ? 'ROLL 3D DICE (पासा फेंको)'
                    : 'Waiting for Turn...'}
                </span>
              </button>
            ) : (
              <div className="text-right">
                {legalMovesForActive.length > 0 ? (
                  <div className="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs animate-pulse text-center">
                    👉 Tap your 3D character!
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => updateGameState((p) => passTurn(p))}
                    className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition"
                  >
                    Pass Turn
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. THE AUTHENTIC LUDO KING DIGITAL BOARD (15x15 GRID) */}
      <div className="relative w-full max-w-[420px] mx-auto aspect-square bg-[#0c1421] p-2.5 sm:p-3 rounded-3xl border-4 border-amber-600/40 shadow-2xl overflow-hidden select-none">
        {/* Floating Emote Overlays */}
        {floatingEmotes.map((emote) => (
          <div
            key={emote.id}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none animate-bounce"
          >
            <div className="px-3 py-1.5 rounded-2xl bg-slate-900/90 border border-amber-400 text-sm font-black text-amber-300 shadow-2xl flex items-center gap-1.5">
              <span className="text-xl">{emote.emoji}</span>
              {emote.text && <span>{emote.text}</span>}
            </div>
          </div>
        ))}

        {/* 15x15 CSS Grid Container with Ludo King styling */}
        <div
          className="relative w-full h-full gap-[1px] bg-slate-900 rounded-2xl overflow-hidden border-2 border-slate-800 shadow-inner"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(15, minmax(0, 1fr))',
            gridTemplateRows: 'repeat(15, minmax(0, 1fr))',
          }}
        >
          {/* Render 15x15 = 225 Cells */}
          {Array.from({ length: 15 }).map((_, r) =>
            Array.from({ length: 15 }).map((_, c) => {
              const cellKey = `${r}-${c}`;
              const cellType = getLudoKingCellType(r, c, gameState.gameMode);

              // Find tokens on this cell
              const tokensOnCell: { token: Token; color: PlayerColor }[] = [];
              for (const col of gameState.activeColors) {
                const playerTokens = gameState.tokens[col] || [];
                playerTokens.forEach((t) => {
                  const [tr, tc] = getTokenGridCoords(col, t.id, t.step);
                  if (tr === r && tc === c) {
                    tokensOnCell.push({ token: t, color: col });
                  }
                });
              }

              return (
                <div
                  key={cellKey}
                  className={`relative flex items-center justify-center ${cellType.className} ${
                    cellType.isSafeStar
                      ? 'after:content-["★"] after:text-[10px] after:text-amber-300 after:font-black drop-shadow'
                      : ''
                  }`}
                  style={{
                    backgroundColor: cellType.bgColor,
                  }}
                >
                  {/* Center Crown on Middle cell [7, 7] */}
                  {r === 7 && c === 7 && (
                    <Crown className="w-4 h-4 text-amber-400 animate-pulse drop-shadow" />
                  )}

                  {/* Render 3D Tokens on this cell */}
                  {tokensOnCell.map(({ token, color }, tokenIdx) => {
                    const isClickable =
                      gameState.hasRolled &&
                      gameState.currentTurn === color &&
                      isMyTurnNow &&
                      legalMovesForActive.some((m) => m.id === token.id);

                    return (
                      <div
                        key={`${color}-${token.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isClickable && gameState.diceValue !== null) {
                            executeTokenMove(token, gameState.diceValue);
                          }
                        }}
                        className={`absolute inset-0 flex items-center justify-center z-20 cursor-pointer transition-transform ${
                          isClickable ? 'scale-115 animate-bounce' : ''
                        }`}
                        style={{
                          transform:
                            tokensOnCell.length > 1
                              ? `translate(${(tokenIdx - 0.5) * 5}px, ${(tokenIdx - 0.5) * 5}px) scale(0.85)`
                              : undefined,
                        }}
                      >
                        {/* 3D CHARACTER AVATAR TOKEN */}
                        <Render3DCharacterToken
                          color={color}
                          isClickable={isClickable}
                          step={token.step}
                        />

                        {/* Stack count badge if multiple tokens of same color */}
                        {tokensOnCell.length > 1 && tokenIdx === tokensOnCell.length - 1 && (
                          <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-slate-950 text-amber-300 text-[8px] font-black border border-amber-400 flex items-center justify-center">
                            {tokensOnCell.length}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 5. ACTIVE PLAYER SCORECARDS & 1V1 PROGRESS */}
      <div
        className={`grid gap-2 text-xs ${
          gameState.activeColors.length === 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'
        }`}
      >
        {gameState.activeColors.map((col) => {
          const cfg = gameState.players[col];
          const tokens = gameState.tokens[col] || [];
          const finishedCount = tokens.filter((t) => t.step === 56).length;
          const totalTokens = tokens.length;
          const isTurn = gameState.currentTurn === col;
          const hasWon = gameState.rankings.includes(col);
          const rankIndex = gameState.rankings.indexOf(col);

          return (
            <div
              key={col}
              className={`p-2.5 rounded-2xl border transition-all ${
                isTurn
                  ? `bg-slate-900 ${COLOR_THEMES[col].border} ring-2 ring-amber-400 shadow-lg`
                  : 'bg-slate-950/70 border-slate-800 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-base">{cfg.avatarIcon}</span>
                  <div className="font-black text-slate-100 text-[11px] truncate max-w-[90px]">
                    {cfg.name}
                  </div>
                </div>
                {hasWon ? (
                  <span className="text-[9px] font-black uppercase px-1.5 py-0.2 bg-amber-500 text-slate-950 rounded flex items-center gap-0.5 shadow-sm">
                    <Crown className="w-2.5 h-2.5" /> Rank #{rankIndex + 1}
                  </span>
                ) : isTurn ? (
                  <span className="text-[9px] font-black px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded border border-amber-500/40 animate-pulse">
                    Rolling...
                  </span>
                ) : null}
              </div>

              <div className="text-[10px] text-slate-400 mt-0.5 truncate">{cfg.characterTitle}</div>

              {/* Progress Bar of Finished 3D Tokens */}
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Home Run:</span>
                  <span className="font-mono font-bold text-slate-200">
                    {finishedCount}/{totalTokens} Finished
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${COLOR_THEMES[col].bg} transition-all duration-300`}
                    style={{
                      width: `${totalTokens > 0 ? (finishedCount / totalTokens) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 6. LUDO KING INTERACTIVE REACTION & EMOTES BAR */}
      <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
        <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-1.5">
          <span className="font-bold text-slate-200 flex items-center gap-1">
            <Smile className="w-3.5 h-3.5 text-amber-400" /> Ludo King Emotes & Table Cheers:
          </span>
          <span className="text-[10px] text-amber-400">Tap to express</span>
        </div>

        {/* Emotes icons row */}
        <div className="flex items-center justify-between gap-1 overflow-x-auto py-1">
          {[
            { emoji: '😂', text: 'Haha!' },
            { emoji: '😎', text: 'Easy Peasy!' },
            { emoji: '🎲', text: 'Six Please!' },
            { emoji: '💥', text: 'Knockout!' },
            { emoji: '👑', text: 'King Moves!' },
            { emoji: '🍕', text: 'Food is here!' },
            { emoji: '👋', text: 'Hello Table 2!' },
          ].map((item) => (
            <button
              key={item.emoji}
              type="button"
              onClick={() => handleSendEmote(item.emoji, item.text)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-400 text-sm hover:scale-110 transition active:scale-95 shadow-sm"
              title={item.text}
            >
              {item.emoji}
            </button>
          ))}
        </div>

        {/* Recent Game / Cheer Logs */}
        <div className="space-y-1 max-h-16 overflow-y-auto pr-1">
          {gameState.chatMessages.slice(-2).map((msg) => (
            <div key={msg.id} className="text-[10px] flex items-center gap-1.5">
              <span className="font-bold text-amber-400 shrink-0">Table {msg.table}:</span>
              <span className="text-slate-300 truncate">{msg.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- HELPER COMPONENT: 3D CHARACTER SVG TOKEN (NO BORING GOTI) ---
interface Render3DTokenProps {
  color: PlayerColor;
  isClickable: boolean;
  step: number;
}

const Render3DCharacterToken: React.FC<Render3DTokenProps> = ({ color, isClickable }) => {
  return (
    <div className="relative w-7 h-7 flex items-center justify-center">
      {/* Clickable pulse ring */}
      {isClickable && (
        <div
          className="absolute -inset-1 rounded-full animate-ping opacity-75"
          style={{ backgroundColor: COLOR_THEMES[color].accent }}
        />
      )}

      {/* 3D Drop Shadow on board */}
      <div className="absolute -bottom-1 w-5 h-2 bg-black/60 rounded-full blur-[1px]" />

      {/* 3D Sculpted Character SVGs */}
      {color === 'red' && (
        /* 🔴 RED: 3D Master Chef with Toque Hat & Spatula */
        <svg viewBox="0 0 36 36" className="w-full h-full drop-shadow-md select-none">
          {/* Base Pedestal with 3D Depth */}
          <ellipse cx="18" cy="30" rx="11" ry="4" fill="#991b1b" />
          <ellipse cx="18" cy="28.5" rx="10.5" ry="3.5" fill="#ef4444" />
          <ellipse cx="18" cy="27.5" rx="9" ry="2.8" fill="#f87171" />

          {/* Chef Body Coat */}
          <path
            d="M11 26 C11 20, 25 20, 25 26 Z"
            fill="#ffffff"
            stroke="#cbd5e1"
            strokeWidth="0.8"
          />
          {/* Red Neckerchief */}
          <path d="M15 21 L18 24 L21 21 Z" fill="#dc2626" />
          {/* Golden Buttons */}
          <circle cx="16" cy="23" r="0.8" fill="#f59e0b" />
          <circle cx="16" cy="25" r="0.8" fill="#f59e0b" />

          {/* 3D Chef Head */}
          <circle cx="18" cy="16" r="6" fill="#fed7aa" />
          {/* Chef Facial Features */}
          <circle cx="16" cy="15" r="0.8" fill="#1e293b" />
          <circle cx="20" cy="15" r="0.8" fill="#1e293b" />
          {/* Iconic Chef Mustache */}
          <path
            d="M15 18 C16 19, 17 19, 18 18 C19 19, 20 19, 21 18"
            stroke="#78350f"
            strokeWidth="1.2"
            fill="none"
            strokeLinecap="round"
          />

          {/* 3D Pleated Chef Hat (Toque) */}
          <path
            d="M13 13 C10 8, 15 4, 18 4 C21 4, 26 8, 23 13 Z"
            fill="#ffffff"
            stroke="#cbd5e1"
            strokeWidth="0.8"
          />
          <rect x="13" y="11.5" width="10" height="2" rx="0.5" fill="#e2e8f0" />

          {/* Spatula in hand */}
          <path d="M24 23 L29 18" stroke="#94a3b8" strokeWidth="1" />
          <rect
            x="28"
            y="16"
            width="3.5"
            height="3"
            rx="0.5"
            fill="#f59e0b"
            transform="rotate(-30 28 16)"
          />
        </svg>
      )}

      {color === 'green' && (
        /* 🟢 GREEN: 3D Foodie Dino with Burger */
        <svg viewBox="0 0 36 36" className="w-full h-full drop-shadow-md select-none">
          {/* Base Pedestal with 3D Depth */}
          <ellipse cx="18" cy="30" rx="11" ry="4" fill="#065f46" />
          <ellipse cx="18" cy="28.5" rx="10.5" ry="3.5" fill="#10b981" />
          <ellipse cx="18" cy="27.5" rx="9" ry="2.8" fill="#34d399" />

          {/* Dino Tail */}
          <path
            d="M10 26 C7 25, 6 22, 5 20"
            stroke="#059669"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Dino Body */}
          <path d="M12 26 C12 18, 24 18, 24 26 Z" fill="#059669" />
          {/* Yellow Belly */}
          <ellipse cx="18" cy="23" rx="4" ry="3.5" fill="#fef08a" />

          {/* Dino Head */}
          <circle cx="18" cy="14" r="6.5" fill="#10b981" />
          {/* Back Ridges */}
          <polygon points="12,12 10,10 12,8" fill="#f59e0b" />
          <polygon points="15,9 14,7 16,6" fill="#f59e0b" />

          {/* Cute Big Eyes */}
          <circle cx="16" cy="13" r="1.5" fill="#ffffff" />
          <circle cx="16.3" cy="13" r="0.8" fill="#0f172a" />
          <circle cx="20" cy="13" r="1.5" fill="#ffffff" />
          <circle cx="20.3" cy="13" r="0.8" fill="#0f172a" />

          {/* Cute Smile */}
          <path
            d="M16 16 Q18 18 20 16"
            stroke="#064e3b"
            strokeWidth="0.8"
            fill="none"
            strokeLinecap="round"
          />

          {/* Mini 3D Burger in Hands */}
          <ellipse cx="18" cy="21" rx="3" ry="1.2" fill="#d97706" />
          <rect x="15" y="21" width="6" height="0.8" fill="#22c55e" />
          <rect x="15" y="21.8" width="6" height="0.8" fill="#7f1d1d" />
          <ellipse cx="18" cy="23" rx="3" ry="1.2" fill="#b45309" />
        </svg>
      )}

      {color === 'yellow' && (
        /* 🟡 YELLOW: 3D Golden Robo-Butler with Serving Dome */
        <svg viewBox="0 0 36 36" className="w-full h-full drop-shadow-md select-none">
          {/* Base Pedestal with 3D Depth */}
          <ellipse cx="18" cy="30" rx="11" ry="4" fill="#78350f" />
          <ellipse cx="18" cy="28.5" rx="10.5" ry="3.5" fill="#f59e0b" />
          <ellipse cx="18" cy="27.5" rx="9" ry="2.8" fill="#fbbf24" />

          {/* Robo Torso */}
          <rect
            x="13"
            y="19"
            width="10"
            height="8"
            rx="2"
            fill="#d97706"
            stroke="#fef08a"
            strokeWidth="0.8"
          />
          {/* LED Chest Battery */}
          <rect x="15" y="21" width="6" height="2" rx="0.5" fill="#06b6d4" />

          {/* Robo Head Cube */}
          <rect
            x="12"
            y="10"
            width="12"
            height="8"
            rx="2.5"
            fill="#fbbf24"
            stroke="#78350f"
            strokeWidth="0.8"
          />
          {/* Visor Display */}
          <rect x="14" y="12" width="8" height="3" rx="1" fill="#0f172a" />
          <circle cx="16" cy="13.5" r="0.8" fill="#38bdf8" />
          <circle cx="20" cy="13.5" r="0.8" fill="#38bdf8" />

          {/* Antenna */}
          <line x1="18" y1="10" x2="18" y2="6" stroke="#94a3b8" strokeWidth="1" />
          <circle cx="18" cy="5" r="1.5" fill="#38bdf8" />

          {/* Silver Cloche Serving Dome */}
          <path
            d="M23 20 C23 17, 29 17, 29 20 Z"
            fill="#e2e8f0"
            stroke="#94a3b8"
            strokeWidth="0.6"
          />
          <circle cx="26" cy="17" r="0.8" fill="#f59e0b" />
          <line
            x1="22"
            y1="20.5"
            x2="30"
            y2="20.5"
            stroke="#cbd5e1"
            strokeWidth="1"
            strokeLinecap="round"
          />
        </svg>
      )}

      {color === 'blue' && (
        /* 🔵 BLUE: 3D Magic Barista with Steaming Coffee Cup */
        <svg viewBox="0 0 36 36" className="w-full h-full drop-shadow-md select-none">
          {/* Base Pedestal with 3D Depth */}
          <ellipse cx="18" cy="30" rx="11" ry="4" fill="#155e75" />
          <ellipse cx="18" cy="28.5" rx="10.5" ry="3.5" fill="#06b6d4" />
          <ellipse cx="18" cy="27.5" rx="9" ry="2.8" fill="#67e8f9" />

          {/* Apron Body */}
          <path d="M12 26 C12 20, 24 20, 24 26 Z" fill="#0e7490" />
          {/* Apron Straps */}
          <line x1="15" y1="20" x2="15" y2="26" stroke="#38bdf8" strokeWidth="0.8" />
          <line x1="21" y1="20" x2="21" y2="26" stroke="#38bdf8" strokeWidth="0.8" />

          {/* Head */}
          <circle cx="18" cy="15" r="5.5" fill="#ffedd5" />
          <circle cx="16" cy="14" r="0.8" fill="#0f172a" />
          <circle cx="20" cy="14" r="0.8" fill="#0f172a" />
          <path
            d="M16.5 17 Q18 18.5 19.5 17"
            stroke="#9a3412"
            strokeWidth="0.8"
            fill="none"
            strokeLinecap="round"
          />

          {/* Barista Flat Cap */}
          <ellipse cx="18" cy="10" rx="7" ry="2.5" fill="#0284c7" />
          <ellipse cx="18" cy="9" rx="5.5" ry="2" fill="#38bdf8" />

          {/* Steaming Coffee Cup in Hand */}
          <rect x="22" y="21" width="4" height="4" rx="0.5" fill="#ffffff" />
          <path d="M26 22 C27 22, 27 24, 26 24" stroke="#ffffff" strokeWidth="0.8" fill="none" />
          {/* Steam swirling */}
          <path
            d="M23 19 Q24 17 23 15"
            stroke="#bae6fd"
            strokeWidth="0.8"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M25 18 Q26 16 25 14"
            stroke="#bae6fd"
            strokeWidth="0.8"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      )}
    </div>
  );
};

// --- HELPER COMPONENT: 3D DICE DOTS ---
const RenderDiceDots: React.FC<{ value: number }> = ({ value }) => {
  const dotClasses = 'w-2 h-2 rounded-full bg-slate-900 shadow-inner';

  if (value === 1) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="w-3.5 h-3.5 rounded-full bg-rose-600 shadow-inner animate-pulse" />
      </div>
    );
  }

  if (value === 2) {
    return (
      <div className="flex justify-between w-7 h-7 p-1">
        <div className={dotClasses} />
        <div className={`${dotClasses} self-end`} />
      </div>
    );
  }

  if (value === 3) {
    return (
      <div className="flex justify-between w-7 h-7 p-1">
        <div className={dotClasses} />
        <div className={`${dotClasses} self-center`} />
        <div className={`${dotClasses} self-end`} />
      </div>
    );
  }

  if (value === 4) {
    return (
      <div className="grid grid-cols-2 gap-2.5 p-1">
        <div className={dotClasses} />
        <div className={dotClasses} />
        <div className={dotClasses} />
        <div className={dotClasses} />
      </div>
    );
  }

  if (value === 5) {
    return (
      <div className="relative w-7 h-7 flex items-center justify-center">
        <div className="grid grid-cols-2 gap-3 absolute inset-0 p-1">
          <div className={dotClasses} />
          <div className={dotClasses} />
          <div className={dotClasses} />
          <div className={dotClasses} />
        </div>
        <div className={`${dotClasses} z-10`} />
      </div>
    );
  }

  // 6 Dots
  return (
    <div className="grid grid-cols-2 gap-x-2.5 gap-y-1 p-1">
      <div className={dotClasses} />
      <div className={dotClasses} />
      <div className={dotClasses} />
      <div className={dotClasses} />
      <div className={dotClasses} />
      <div className={dotClasses} />
    </div>
  );
};

// --- HELPER: GET AUTHENTIC LUDO KING CELL TYPE FOR 15x15 BOARD ---
function getLudoKingCellType(
  r: number,
  c: number,
  mode: GameMode
): {
  className: string;
  bgColor: string;
  isSafeStar: boolean;
} {
  // Center 3x3 Victory Podium (6..8, 6..8)
  if (r >= 6 && r <= 8 && c >= 6 && c <= 8) {
    // 4 Triangles meeting at center
    if (r === 6 && c === 7) return { className: '', bgColor: '#059669', isSafeStar: false }; // Green top triangle
    if (r === 7 && c === 6) return { className: '', bgColor: '#dc2626', isSafeStar: false }; // Red left triangle
    if (r === 7 && c === 8) return { className: '', bgColor: '#d97706', isSafeStar: false }; // Yellow right triangle
    if (r === 8 && c === 7) return { className: '', bgColor: '#0891b2', isSafeStar: false }; // Blue bottom triangle
    return {
      className: 'bg-gradient-to-tr from-amber-400 via-yellow-500 to-amber-600 shadow-inner',
      bgColor: '#1e293b',
      isSafeStar: false,
    };
  }

  // Corner 6x6 Bases:
  // Top-Left (Red)
  if (r < 6 && c < 6) {
    const isInnerCircle = r >= 1 && r <= 4 && c >= 1 && c <= 4;
    return {
      className: isInnerCircle ? 'border-2 border-white/80 rounded-2xl shadow-inner' : '',
      bgColor: isInnerCircle ? '#ffffff' : '#b91c1c',
      isSafeStar: false,
    };
  }

  // Top-Right (Green)
  if (r < 6 && c > 8) {
    const isInactive = mode !== '4p_room';
    const isInnerCircle = r >= 1 && r <= 4 && c >= 10 && c <= 13;
    return {
      className: isInnerCircle ? 'border-2 border-white/80 rounded-2xl shadow-inner' : '',
      bgColor: isInactive
        ? isInnerCircle
          ? 'rgba(255, 255, 255, 0.4)'
          : 'rgba(4, 120, 87, 0.3)'
        : isInnerCircle
        ? '#ffffff'
        : '#047857',
      isSafeStar: false,
    };
  }

  // Bottom-Right (Yellow)
  if (r > 8 && c > 8) {
    const isInnerCircle = r >= 10 && r <= 13 && c >= 10 && c <= 13;
    return {
      className: isInnerCircle ? 'border-2 border-white/80 rounded-2xl shadow-inner' : '',
      bgColor: isInnerCircle ? '#ffffff' : '#d97706',
      isSafeStar: false,
    };
  }

  // Bottom-Left (Blue)
  if (r > 8 && c < 6) {
    const isInactive = mode !== '4p_room';
    const isInnerCircle = r >= 10 && r <= 13 && c >= 1 && c <= 4;
    return {
      className: isInnerCircle ? 'border-2 border-white/80 rounded-2xl shadow-inner' : '',
      bgColor: isInactive
        ? isInnerCircle
          ? 'rgba(255, 255, 255, 0.4)'
          : 'rgba(14, 116, 144, 0.3)'
        : isInnerCircle
        ? '#ffffff'
        : '#0e7490',
      isSafeStar: false,
    };
  }

  // Home Stretch Paths (The colored track lines into center):
  // Red Home Path (row 7, col 1..5)
  if (r === 7 && c >= 1 && c <= 5) {
    return { className: 'border border-rose-600', bgColor: '#ef4444', isSafeStar: false };
  }
  // Green Home Path (col 7, row 1..5)
  if (c === 7 && r >= 1 && r <= 5) {
    return { className: 'border border-emerald-600', bgColor: '#10b981', isSafeStar: false };
  }
  // Yellow Home Path (row 7, col 9..13)
  if (r === 7 && c >= 9 && c <= 13) {
    return { className: 'border border-amber-600', bgColor: '#f59e0b', isSafeStar: false };
  }
  // Blue Home Path (col 7, row 9..13)
  if (c === 7 && r >= 9 && r <= 13) {
    return { className: 'border border-cyan-600', bgColor: '#06b6d4', isSafeStar: false };
  }

  // Starting Squares (with start arrow/color):
  if (r === 6 && c === 1) {
    return { className: 'border-2 border-rose-400', bgColor: '#dc2626', isSafeStar: true }; // Red Start
  }
  if (r === 1 && c === 8) {
    return { className: 'border-2 border-emerald-400', bgColor: '#059669', isSafeStar: true }; // Green Start
  }
  if (r === 8 && c === 13) {
    return { className: 'border-2 border-amber-400', bgColor: '#d97706', isSafeStar: true }; // Yellow Start
  }
  if (r === 13 && c === 6) {
    return { className: 'border-2 border-cyan-400', bgColor: '#0891b2', isSafeStar: true }; // Blue Start
  }

  // Safe Stars (Cell 8, 21, 34, 47)
  if (
    (r === 2 && c === 6) ||
    (r === 6 && c === 12) ||
    (r === 12 && c === 8) ||
    (r === 8 && c === 2)
  ) {
    return {
      className: 'border-2 border-amber-500/60 shadow-sm',
      bgColor: '#1e293b',
      isSafeStar: true,
    };
  }

  // Normal Track Cells (Classic Ludo King off-white/slate tiles with subtle border)
  return {
    className: 'border border-slate-700/60',
    bgColor: '#0f172a',
    isSafeStar: false,
  };
}
