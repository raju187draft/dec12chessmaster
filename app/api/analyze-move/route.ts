import { GoogleGenAI } from "@google/genai";
import { gameStateToFEN, type GameState } from "@/lib/chess-engine";
import type { MoveEvaluation } from "@/lib/adaptive-ai";

export const maxDuration = 30;

function getMoveScore(type: MoveEvaluation["type"]): number {
  switch (type) {
    case "brilliant":
      return 1.0;
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
}

function getALMLScore(centipawnLoss: number): number {
  // 0 cp loss = 100, 300+ cp loss = 0
  const score = Math.max(0, Math.min(100, 100 - centipawnLoss / 3));
  return Math.round(score);
}

export async function POST(req: Request) {
  const {
    gameState,
    evaluation,
    moveHistory,
    playerStats,
    allEvaluations, // Added for calculating AMS and STD
    moveTimes, // Added for time tracking
  }: {
    gameState: GameState;
    evaluation: MoveEvaluation;
    moveHistory: string[];
    playerStats: { skillRating: number; averageAccuracy: number } | null;
    allEvaluations?: MoveEvaluation[];
    moveTimes?: number[];
  } = await req.json();

  const fen = gameStateToFEN(gameState);

  const evaluations = allEvaluations || [evaluation];
  const scores = evaluations.map((e) => getMoveScore(e.type));
  const ams =
    scores.length > 0
      ? scores.reduce((a, b) => a + b, 0) / scores.length
      : 0.75;
  const mean = ams;
  const variance =
    scores.length > 1
      ? scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) /
        scores.length
      : 0;
  const stdDeviation = Math.sqrt(variance);

  // Count move types
  const blunders = evaluations.filter((e) => e.type === "blunder").length;
  const mistakes = evaluations.filter((e) => e.type === "mistake").length;
  const inaccuracies = evaluations.filter(
    (e) => e.type === "inaccuracy"
  ).length;
  const excellentMoves = evaluations.filter(
    (e) => e.type === "excellent" || e.type === "brilliant"
  ).length;

  // Average time per move
  const avgTimePerMove =
    moveTimes && moveTimes.length > 0
      ? moveTimes.reduce((a, b) => a + b, 0) / moveTimes.length
      : 0;

  // ALML score for current move
  const almlScore = getALMLScore(evaluation.centipawnLoss || 0);

  const prompt = `You are a chess coach analyzing a player's move. Be encouraging but honest.

Current position (FEN): ${fen}
Move played: ${evaluation.from} to ${evaluation.to}
Move evaluation: ${evaluation.type}
Centipawn loss: ${evaluation.centipawnLoss || 0} cp
ALML Score: ${almlScore}/100
${
  evaluation.bestMove
    ? `Better move was: ${evaluation.bestMove.from} to ${evaluation.bestMove.to}`
    : ""
}
Recent moves: ${moveHistory.slice(-10).join(", ") || "Game just started"}
Player ELO rating: ~${playerStats?.skillRating || 1000}
Player accuracy this game: ${playerStats?.averageAccuracy || 70}%

Game Statistics:
- Average Move Score (AMS): ${ams.toFixed(3)} (${
    ams >= 0.9
      ? "Excellent"
      : ams >= 0.75
      ? "Great"
      : ams >= 0.5
      ? "Good"
      : "Needs Improvement"
  })
- Standard Deviation: ${stdDeviation.toFixed(3)}
- Blunders: ${blunders}, Mistakes: ${mistakes}, Inaccuracies: ${inaccuracies}
- Excellent Moves: ${excellentMoves}

Provide a brief, helpful comment (2-3 sentences max) about this move:
- If it's a blunder/mistake: Explain WHY it's bad and what tactical/strategic element they missed
- If it's an inaccuracy: Gently point out the better continuation
- If it's good/excellent/brilliant: Encourage them and explain what made it strong
- If there's a tactical theme (fork, pin, skewer, discovered attack, etc.), mention it
- Tailor your language to their skill level (simpler for lower ELO, more technical for higher)
- Be conversational and supportive, like a friendly coach

Response (keep it short and helpful):`;

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

  try {
    const { text } = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return Response.json({
      analysis: text,
      stats: {
        ams,
        amsLabel:
          ams >= 0.9
            ? "Excellent"
            : ams >= 0.75
            ? "Great"
            : ams >= 0.5
            ? "Good"
            : "Needs Improvement",
        stdDeviation,
        avgTimePerMove,
        blunders,
        mistakes,
        inaccuracies,
        excellentMoves,
        almlScore,
      },
    });
  } catch (error) {
    console.error("AI analysis error:", error);
    const fallback = getFallbackAnalysis(evaluation);
    return Response.json({
      analysis: fallback,
      stats: {
        ams,
        amsLabel:
          ams >= 0.9
            ? "Excellent"
            : ams >= 0.75
            ? "Great"
            : ams >= 0.5
            ? "Good"
            : "Needs Improvement",
        stdDeviation,
        avgTimePerMove,
        blunders,
        mistakes,
        inaccuracies,
        excellentMoves,
        almlScore,
      },
    });
  }
}

function getFallbackAnalysis(evaluation: MoveEvaluation): string {
  const cpLoss = evaluation.centipawnLoss || 0;

  switch (evaluation.type) {
    case "brilliant":
      return "Brilliant! You found an exceptional move that significantly improves your position.";
    case "excellent":
      return "Excellent move! You're playing with great precision and understanding.";
    case "good":
      return "Solid move. Keep up the good play!";
    case "inaccuracy":
      return `Small inaccuracy (${cpLoss}cp loss). ${
        evaluation.bestMove
          ? `${evaluation.bestMove.from}-${evaluation.bestMove.to} would give you a slightly better position.`
          : "Look for more active moves."
      }`;
    case "mistake":
      return `That's a mistake (${cpLoss}cp loss). ${
        evaluation.bestMove
          ? `${evaluation.bestMove.from}-${evaluation.bestMove.to} was stronger.`
          : ""
      } Think about piece activity and king safety!`;
    case "blunder":
      return `Significant error (${cpLoss}cp loss)! ${
        evaluation.bestMove
          ? `${evaluation.bestMove.from}-${evaluation.bestMove.to} was much better.`
          : ""
      } Take your time and check for tactics before moving.`;
    default:
      return "Interesting move. Let's see how the game develops.";
  }
}
