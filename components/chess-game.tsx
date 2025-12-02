"use client";

import { useState, useCallback, useEffect, useRef } from "react";
//import { Icon } from "@iconify/react";
import { ChessBoard } from "./chess-board";
import { MoveHistoryPanel } from "./move-history-panel";
import { AIFeedback } from "./ai-feedback";
import { GameSetupModal } from "./game-setup-modal";
import { EvaluationBar } from "./evaluation-bar";
import { GameControls } from "./game-controls";
import { BlunderAlert } from "./blunder-alert";
import {
  type GameState,
  createInitialState,
  makeMove,
  getValidMoves,
  moveToAlgebraic,
  type Square,
} from "@/lib/chess-engine";
import {
  type DifficultyLevel,
  type PlayerStats,
  createDefaultStats,
  getAIMoveAsync,
  evaluatePlayerMove,
  updateStatsAfterMove,
  updateStatsAfterGame,
  type MoveEvaluation,
  evaluatePosition,
} from "@/lib/adaptive-ai";
import {
  eloToDifficulty,
  getAdaptiveDifficulty,
  STOCKFISH_LEVELS,
} from "@/lib/stockfish-eval";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export function ChessGame() {
  const [gameState, setGameState] = useState<GameState>(createInitialState());
  const [gameHistory, setGameHistory] = useState<GameState[]>([
    createInitialState(),
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [validMoves, setValidMoves] = useState<Square[]>([]);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(
    null
  );
  const [aiLastMove, setAiLastMove] = useState<{
    from: Square;
    to: Square;
  } | null>(null); // Track AI move separately
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [moveNotations, setMoveNotations] = useState<string[]>([]);
  const [currentEvaluation, setCurrentEvaluation] =
    useState<MoveEvaluation | null>(null);
  const [gameEvaluations, setGameEvaluations] = useState<MoveEvaluation[]>([]);
  const [aiAnalysis, setAIAnalysis] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [playerColor, setPlayerColor] = useState<"w" | "b">("w");
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [currentDifficulty, setCurrentDifficulty] =
    useState<DifficultyLevel>(5);
  const [positionEval, setPositionEval] = useState<number>(0);
  const [moveTimes, setMoveTimes] = useState<number[]>([]); // Track move times
  const [moveStartTime, setMoveStartTime] = useState<number>(Date.now());
  const [user, setUser] = useState<User | null>(null);
  const [initialEloSet, setInitialEloSet] = useState(false); // Track if ELO was set
  const [showBlunderAlert, setShowBlunderAlert] = useState(false); // Blunder alert
  const [pendingBlunderEval, setPendingBlunderEval] =
    useState<MoveEvaluation | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  const aiMoveInProgress = useRef(false);
  const sessionSaveTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const supabase = createClient();

    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        // Load session from server
        try {
          const res = await fetch("/api/session");
          const { session, profile } = await res.json();

          if (profile) {
            setPlayerStats({
              gamesPlayed: profile.games_played,
              wins: profile.wins,
              losses: profile.losses,
              draws: profile.draws,
              blunders: profile.total_blunders,
              mistakes: profile.total_mistakes,
              inaccuracies: profile.total_inaccuracies,
              goodMoves: profile.total_good_moves,
              excellentMoves: profile.total_excellent_moves,
              brilliantMoves: profile.total_brilliant_moves,
              averageAccuracy: profile.average_accuracy,
              currentStreak: profile.current_streak,
              skillRating: profile.skill_rating,
              tacticsScore: 50,
              positionScore: 50,
              endgameScore: 50,
              totalCentipawnLoss: 0,
              totalMovesAnalyzed: 0,
            });
            setInitialEloSet(profile.initial_elo_set);
          }

          if (session) {
            setGameState(session.game_state);
            setGameHistory(session.game_history);
            setMoveNotations(session.move_notations || []);
            setGameEvaluations(session.game_evaluations || []);
            setPlayerColor(session.player_color);
            setCurrentDifficulty(session.current_difficulty);
            setHistoryIndex(session.history_index);
            setMoveTimes(session.move_times || []);
            setGameStarted(true);
          } else if (!profile?.initial_elo_set) {
            setShowSetupModal(true);
          }
        } catch (e) {
          console.error("Failed to load session:", e);
        }
      } else {
        // Guest mode - load from localStorage
        const saved = localStorage.getItem("chessAI_playerStats");
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            setPlayerStats(parsed);
            setInitialEloSet(parsed.gamesPlayed > 0);
          } catch {
            setPlayerStats(null);
          }
        }

        // Check for saved session in localStorage
        const savedSession = localStorage.getItem("chessAI_session");
        if (savedSession) {
          try {
            const session = JSON.parse(savedSession);
            setGameState(session.gameState);
            setGameHistory(session.gameHistory);
            setMoveNotations(session.moveNotations || []);
            setGameEvaluations(session.gameEvaluations || []);
            setPlayerColor(session.playerColor);
            setCurrentDifficulty(session.currentDifficulty);
            setHistoryIndex(session.historyIndex);
            setMoveTimes(session.moveTimes || []);
            setGameStarted(true);
          } catch {
            // Ignore
          }
        }
      }

      setIsLoadingSession(false);
    };

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (playerStats && !user) {
      localStorage.setItem("chessAI_playerStats", JSON.stringify(playerStats));
    }
  }, [playerStats, user]);

  useEffect(() => {
    if (!gameStarted || isLoadingSession) return;

    if (sessionSaveTimeout.current) {
      clearTimeout(sessionSaveTimeout.current);
    }

    sessionSaveTimeout.current = setTimeout(() => {
      const sessionData = {
        gameState,
        gameHistory,
        moveNotations,
        gameEvaluations,
        playerColor,
        currentDifficulty,
        historyIndex,
        moveTimes,
      };

      if (user) {
        fetch("/api/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sessionData),
        }).catch(console.error);
      } else {
        localStorage.setItem("chessAI_session", JSON.stringify(sessionData));
      }
    }, 2000);

    return () => {
      if (sessionSaveTimeout.current) {
        clearTimeout(sessionSaveTimeout.current);
      }
    };
  }, [
    gameState,
    gameHistory,
    moveNotations,
    gameEvaluations,
    playerColor,
    currentDifficulty,
    historyIndex,
    moveTimes,
    gameStarted,
    user,
    isLoadingSession,
  ]);

  useEffect(() => {
    setPositionEval(evaluatePosition(gameState));
  }, [gameState]);

  useEffect(() => {
    if (!playerStats) return;
    if (gameState.isCheckmate || gameState.isStalemate || gameState.isDraw) {
      let result: "win" | "loss" | "draw";
      let resultNum: number;
      if (gameState.isCheckmate) {
        result = gameState.turn === playerColor ? "loss" : "win";
        resultNum = result === "win" ? 1 : 0;
      } else {
        result = "draw";
        resultNum = 0.5;
      }

      const prevElo = playerStats.skillRating;
      const newStats = updateStatsAfterGame(
        playerStats,
        result,
        currentDifficulty
      );
      setPlayerStats(newStats);

      // Save to database if logged in
      if (user) {
        const scores: number[] = gameEvaluations.map((e) => {
          switch (e.type) {
            case "brilliant":
            case "excellent":
              return 1.0;
            case "good":
              return 0.9;
            case "inaccuracy":
              return 0.5;
            case "mistake":
              return 0.25;
            case "blunder":
              return 0.0;
            default:
              return 0.75;
          }
        });
        const ams =
          scores.length > 0
            ? scores.reduce((a, b) => a + b, 0) / scores.length
            : 0.75;
        const variance =
          scores.length > 1
            ? scores.reduce((sum, s) => sum + Math.pow(s - ams, 2), 0) /
              scores.length
            : 0;
        const stdDev = Math.sqrt(variance);
        const avgTime =
          moveTimes.length > 0
            ? moveTimes.reduce((a, b) => a + b, 0) / moveTimes.length
            : 0;

        fetch("/api/save-game", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            result: resultNum,
            playerColor,
            aiElo: STOCKFISH_LEVELS[currentDifficulty]?.elo || 1000,
            totalMoves: gameEvaluations.length,
            excellentMoves: gameEvaluations.filter(
              (e) => e.type === "excellent" || e.type === "brilliant"
            ).length,
            goodMoves: gameEvaluations.filter((e) => e.type === "good").length,
            inaccurateMoves: gameEvaluations.filter(
              (e) => e.type === "inaccuracy"
            ).length,
            mistakes: gameEvaluations.filter((e) => e.type === "mistake")
              .length,
            blunders: gameEvaluations.filter((e) => e.type === "blunder")
              .length,
            ams,
            stdDeviation: stdDev,
            avgTimePerMove: avgTime,
            playerEloBefore: prevElo,
            playerEloAfter: newStats.skillRating,
          }),
        }).catch(console.error);

        // Clear session
        fetch("/api/session", { method: "DELETE" }).catch(console.error);
      } else {
        localStorage.removeItem("chessAI_session");
      }
    }
  }, [
    gameState.isCheckmate,
    gameState.isStalemate,
    gameState.isDraw,
    gameState.turn,
    playerColor,
    currentDifficulty,
    playerStats,
    user,
    gameEvaluations,
    moveTimes,
  ]);

  // AI move effect
  useEffect(() => {
    if (!gameStarted || !playerStats) return;
    if (gameState.turn === playerColor) return;
    if (gameState.isCheckmate || gameState.isStalemate || gameState.isDraw)
      return;
    if (aiMoveInProgress.current) return;

    const makeAIMove = async () => {
      aiMoveInProgress.current = true;
      setIsThinking(true);

      await new Promise((resolve) => setTimeout(resolve, 300));

      try {
        const aiMove = await getAIMoveAsync(
          gameState,
          currentDifficulty,
          playerStats
        );

        if (aiMove) {
          const newState = makeMove(gameState, aiMove.from, aiMove.to);
          if (newState) {
            setGameState(newState);
            setGameHistory((prev) => [
              ...prev.slice(0, historyIndex + 1),
              newState,
            ]);
            setHistoryIndex((prev) => prev + 1);
            setAiLastMove(aiMove); // Track AI move
            setLastMove(null); // Clear player's last move highlight
            const notation = moveToAlgebraic(
              gameState,
              newState.history[newState.history.length - 1]
            );
            setMoveNotations((prev) => [...prev, notation]);
            setMoveStartTime(Date.now()); // Reset timer for player
          }
        }
      } catch (error) {
        console.error("AI move error:", error);
      } finally {
        setIsThinking(false);
        aiMoveInProgress.current = false;
      }
    };

    makeAIMove();
  }, [
    gameState,
    gameStarted,
    playerColor,
    currentDifficulty,
    playerStats,
    historyIndex,
  ]);

  const requestAIAnalysis = async (
    state: GameState,
    evaluation: MoveEvaluation
  ) => {
    if (evaluation.type === "good" || evaluation.type === "excellent") return;

    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/analyze-move", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameState: state,
          evaluation,
          moveHistory: moveNotations,
          playerStats: playerStats
            ? {
                skillRating: playerStats.skillRating,
                averageAccuracy: playerStats.averageAccuracy,
              }
            : null,
          allEvaluations: gameEvaluations,
          moveTimes,
        }),
      });
      const data = await response.json();
      setAIAnalysis(data.analysis);
    } catch (error) {
      console.error("Failed to get AI analysis:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSquareClick = useCallback(
    (square: Square) => {
      if (!gameStarted || !playerStats) return;
      if (gameState.turn !== playerColor) return;
      if (isThinking) return;
      if (gameState.isCheckmate || gameState.isStalemate || gameState.isDraw)
        return;

      const [row, col] = [
        8 - Number.parseInt(square[1]),
        square.charCodeAt(0) - 97,
      ];
      const clickedPiece = gameState.board[row]?.[col];

      if (selectedSquare) {
        if (clickedPiece && clickedPiece.color === playerColor) {
          setSelectedSquare(square);
          setValidMoves(getValidMoves(gameState, square));
          return;
        }

        if (validMoves.includes(square)) {
          const stateBefore = gameState;
          const newState = makeMove(gameState, selectedSquare, square);

          if (newState) {
            const moveTime = (Date.now() - moveStartTime) / 1000;
            setMoveTimes((prev) => [...prev, moveTime]);

            const evaluation = evaluatePlayerMove(
              stateBefore,
              selectedSquare,
              square
            );

            if (
              evaluation.type === "blunder" ||
              evaluation.type === "mistake"
            ) {
              setPendingBlunderEval(evaluation);
              setShowBlunderAlert(true);
              // Still make the move but show alert
            }

            setCurrentEvaluation(evaluation);
            setGameEvaluations((prev) => [...prev, evaluation]);
            setPlayerStats((prev) =>
              prev ? updateStatsAfterMove(prev, evaluation) : prev
            );

            if (evaluation.type !== "good" && evaluation.type !== "excellent") {
              requestAIAnalysis(stateBefore, evaluation);
            } else {
              setAIAnalysis("");
            }

            setGameState(newState);
            setGameHistory((prev) => [
              ...prev.slice(0, historyIndex + 1),
              newState,
            ]);
            setHistoryIndex((prev) => prev + 1);
            setLastMove({ from: selectedSquare, to: square });
            setAiLastMove(null); // Clear AI move highlight
            const notation = moveToAlgebraic(
              stateBefore,
              newState.history[newState.history.length - 1]
            );
            setMoveNotations((prev) => [...prev, notation]);

            const newDifficulty = getAdaptiveDifficulty(
              eloToDifficulty(playerStats.skillRating),
              playerStats,
              gameEvaluations
            ) as DifficultyLevel;
            setCurrentDifficulty(newDifficulty);
          }
        }

        setSelectedSquare(null);
        setValidMoves([]);
      } else {
        if (clickedPiece && clickedPiece.color === playerColor) {
          setSelectedSquare(square);
          setValidMoves(getValidMoves(gameState, square));
        }
      }
    },
    [
      gameState,
      selectedSquare,
      validMoves,
      gameStarted,
      playerColor,
      isThinking,
      playerStats,
      gameEvaluations,
      historyIndex,
      moveStartTime,
    ]
  );

  const handleBlunderUndo = () => {
    if (historyIndex > 0) {
      const newIndex = Math.max(0, historyIndex - 2);
      setHistoryIndex(newIndex);
      setGameState(gameHistory[newIndex]);
      setMoveNotations((prev) => prev.slice(0, newIndex));
      setGameEvaluations((prev) => prev.slice(0, -1));
      setMoveTimes((prev) => prev.slice(0, -1));
      setSelectedSquare(null);
      setValidMoves([]);
      setLastMove(null);
      setCurrentEvaluation(null);
      setMoveStartTime(Date.now());
      setAiLastMove(null);
    }
    setShowBlunderAlert(false);
    setPendingBlunderEval(null);
  };

  const handleStartGame = (color: "w" | "b", initialElo: number) => {
    const stats = playerStats || createDefaultStats(initialElo);
    if (!playerStats) {
      stats.skillRating = initialElo;
    }
    setPlayerStats(stats);
    setPlayerColor(color);
    const difficulty = eloToDifficulty(stats.skillRating) as DifficultyLevel;
    setCurrentDifficulty(difficulty);

    const initialState = createInitialState();
    setGameState(initialState);
    setGameHistory([initialState]);
    setHistoryIndex(0);
    setSelectedSquare(null);
    setValidMoves([]);
    setLastMove(null);
    setAiLastMove(null);
    setMoveNotations([]);
    setCurrentEvaluation(null);
    setGameEvaluations([]);
    setAIAnalysis("");
    setMoveTimes([]);
    setMoveStartTime(Date.now());
    setShowSetupModal(false);
    setInitialEloSet(true);
    aiMoveInProgress.current = false;
    setGameStarted(true);

    // Update profile if logged in
    if (user) {
      const supabase = createClient();
      supabase
        .from("player_profiles")
        .update({
          initial_elo_set: true,
          preferred_color: color,
          skill_rating: initialElo,
        })
        .eq("id", user.id)
        .then(() => {});
    }
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = Math.max(0, historyIndex - 2);
      setHistoryIndex(newIndex);
      setGameState(gameHistory[newIndex]);
      setMoveNotations((prev) => prev.slice(0, newIndex));
      setSelectedSquare(null);
      setValidMoves([]);
      setLastMove(null);
      setAiLastMove(null);
    }
  };

  const handleRedo = () => {
    if (historyIndex < gameHistory.length - 1) {
      const newIndex = Math.min(gameHistory.length - 1, historyIndex + 2);
      setHistoryIndex(newIndex);
      setGameState(gameHistory[newIndex]);
    }
  };

  const handleCopyPGN = () => {
    const pairs: string[] = [];
    for (let i = 0; i < moveNotations.length; i += 2) {
      const moveNum = Math.floor(i / 2) + 1;
      const white = moveNotations[i];
      const black = moveNotations[i + 1] || "";
      pairs.push(`${moveNum}. ${white} ${black}`);
    }
    navigator.clipboard.writeText(pairs.join(" "));
  };

  const handleNewGame = () => {
    setShowSetupModal(true);
  };

  const handleCloseModal = () => {
    if (gameStarted) {
      setShowSetupModal(false);
    }
  };

  useEffect(() => {
    if (!isLoadingSession && !gameStarted && !initialEloSet) {
      setShowSetupModal(true);
    }
  }, [isLoadingSession, gameStarted, initialEloSet]);

  const isFirstGame = !initialEloSet;
  const aiElo = STOCKFISH_LEVELS[currentDifficulty]?.elo || 1000;

  if (isLoadingSession) {
    return (
      <div className="h-screen w-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-background overflow-hidden flex flex-col">
      <GameSetupModal
        open={showSetupModal}
        onStartGame={handleStartGame}
        onClose={handleCloseModal}
        isFirstGame={isFirstGame}
        currentElo={playerStats?.skillRating || 1000}
      />

      <BlunderAlert
        open={showBlunderAlert}
        evaluation={pendingBlunderEval}
        onUndo={handleBlunderUndo}
        onDismiss={() => {
          setShowBlunderAlert(false);
          setPendingBlunderEval(null);
        }}
      />

      {/* Compact Header */}
      <header className="flex-shrink-0 h-12 px-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
            C
          </div>
          <span className="font-bold text-foreground">ChessMaster</span>
        </div>
        <div className="flex items-center gap-3">
          {gameStarted && playerStats ? (
            <div className="flex items-center gap-3 text-xs">
              <span className="text-muted-foreground">
                ELO:{" "}
                <span className="font-mono font-bold text-primary">
                  {playerStats.skillRating}
                </span>
              </span>
              <span className="text-muted-foreground">
                vs AI: <span className="font-mono">~{aiElo}</span>
              </span>
              <span className="text-muted-foreground">
                Lv: <span className="font-bold">{currentDifficulty}</span>
              </span>
            </div>
          ) : (
            <Button
              size="sm"
              onClick={() => setShowSetupModal(true)}
              className="h-7 px-3 text-xs"
            >
              Start Game
            </Button>
          )}

          {user ? (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-xs"
              onClick={async () => {
                const supabase = createClient();
                await supabase.auth.signOut();
                window.location.reload();
              }}
            >
              Logout
            </Button>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-xs"
              onClick={() => (window.location.href = "/auth/login")}
            >
              Login
            </Button>
          )}
        </div>
      </header>

      {/* Main Content - fills remaining height */}
      <main className="flex-1 min-h-0 flex">
        {/* Left: Evaluation Bar */}
        <div className="flex-shrink-0 w-8 p-1 flex items-stretch">
          <EvaluationBar evaluation={positionEval} playerColor={playerColor} />
        </div>

        {/* Center: Chess Board - takes available space */}
        <div className="flex-shrink-0 p-2 flex items-center justify-center">
          <ChessBoard
            gameState={gameState}
            selectedSquare={selectedSquare}
            validMoves={validMoves}
            lastMove={lastMove}
            aiLastMove={aiLastMove}
            onSquareClick={handleSquareClick}
            flipped={playerColor === "b"}
            isThinking={isThinking}
            playerColor={playerColor}
          />
        </div>

        {/* Right: Sidebar - fills remaining width */}
        <div className="flex-1 min-w-0 flex flex-col p-2 pl-0 gap-2">
          {/* AI Feedback */}
          <div className="flex-shrink-0">
            <AIFeedback
              evaluation={currentEvaluation}
              analysis={aiAnalysis}
              isAnalyzing={isAnalyzing}
              isThinking={isThinking}
              playerStats={playerStats}
              aiElo={aiElo}
              difficulty={currentDifficulty}
            />
          </div>

          {/* Move History - fills remaining space */}
          <div className="flex-1 min-h-0">
            <MoveHistoryPanel
              moveNotations={moveNotations}
              gameState={gameState}
              isThinking={isThinking}
            />
          </div>

          {/* Game Controls */}
          <div className="flex-shrink-0">
            <GameControls
              onUndo={handleUndo}
              onRedo={handleRedo}
              onCopyPGN={handleCopyPGN}
              onNewGame={handleNewGame}
              canUndo={historyIndex > 0 && gameStarted}
              canRedo={historyIndex < gameHistory.length - 1}
              gameStarted={gameStarted}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
