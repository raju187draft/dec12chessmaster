(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/lib/chess-engine.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Chess piece types and board representation
__turbopack_context__.s([
    "coordsToSquare",
    ()=>coordsToSquare,
    "createInitialState",
    ()=>createInitialState,
    "gameStateToFEN",
    ()=>gameStateToFEN,
    "getAllLegalMoves",
    ()=>getAllLegalMoves,
    "getPieceAt",
    ()=>getPieceAt,
    "getValidMoves",
    ()=>getValidMoves,
    "isKingInCheck",
    ()=>isKingInCheck,
    "makeMove",
    ()=>makeMove,
    "moveToAlgebraic",
    ()=>moveToAlgebraic,
    "squareToCoords",
    ()=>squareToCoords
]);
const INITIAL_BOARD = [
    [
        {
            type: "r",
            color: "b"
        },
        {
            type: "n",
            color: "b"
        },
        {
            type: "b",
            color: "b"
        },
        {
            type: "q",
            color: "b"
        },
        {
            type: "k",
            color: "b"
        },
        {
            type: "b",
            color: "b"
        },
        {
            type: "n",
            color: "b"
        },
        {
            type: "r",
            color: "b"
        }
    ],
    [
        {
            type: "p",
            color: "b"
        },
        {
            type: "p",
            color: "b"
        },
        {
            type: "p",
            color: "b"
        },
        {
            type: "p",
            color: "b"
        },
        {
            type: "p",
            color: "b"
        },
        {
            type: "p",
            color: "b"
        },
        {
            type: "p",
            color: "b"
        },
        {
            type: "p",
            color: "b"
        }
    ],
    [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null
    ],
    [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null
    ],
    [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null
    ],
    [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null
    ],
    [
        {
            type: "p",
            color: "w"
        },
        {
            type: "p",
            color: "w"
        },
        {
            type: "p",
            color: "w"
        },
        {
            type: "p",
            color: "w"
        },
        {
            type: "p",
            color: "w"
        },
        {
            type: "p",
            color: "w"
        },
        {
            type: "p",
            color: "w"
        },
        {
            type: "p",
            color: "w"
        }
    ],
    [
        {
            type: "r",
            color: "w"
        },
        {
            type: "n",
            color: "w"
        },
        {
            type: "b",
            color: "w"
        },
        {
            type: "q",
            color: "w"
        },
        {
            type: "k",
            color: "w"
        },
        {
            type: "b",
            color: "w"
        },
        {
            type: "n",
            color: "w"
        },
        {
            type: "r",
            color: "w"
        }
    ]
];
function createInitialState() {
    return {
        board: INITIAL_BOARD.map((row)=>row.map((piece)=>piece ? {
                    ...piece
                } : null)),
        turn: "w",
        castling: {
            w: {
                k: true,
                q: true
            },
            b: {
                k: true,
                q: true
            }
        },
        enPassant: null,
        halfMoves: 0,
        fullMoves: 1,
        history: [],
        isCheck: false,
        isCheckmate: false,
        isStalemate: false,
        isDraw: false
    };
}
function squareToCoords(square) {
    const col = square.charCodeAt(0) - 97;
    const row = 8 - Number.parseInt(square[1]);
    return [
        row,
        col
    ];
}
function coordsToSquare(row, col) {
    return String.fromCharCode(97 + col) + (8 - row);
}
function getPieceAt(state, square) {
    const [row, col] = squareToCoords(square);
    return state.board[row]?.[col] ?? null;
}
function setPieceAt(board, square, piece) {
    const [row, col] = squareToCoords(square);
    board[row][col] = piece;
}
function cloneBoard(board) {
    return board.map((row)=>row.map((piece)=>piece ? {
                ...piece
            } : null));
}
function cloneState(state) {
    return {
        board: cloneBoard(state.board),
        turn: state.turn,
        castling: {
            w: {
                ...state.castling.w
            },
            b: {
                ...state.castling.b
            }
        },
        enPassant: state.enPassant,
        halfMoves: state.halfMoves,
        fullMoves: state.fullMoves,
        history: [
            ...state.history
        ],
        isCheck: state.isCheck,
        isCheckmate: state.isCheckmate,
        isStalemate: state.isStalemate,
        isDraw: state.isDraw
    };
}
// Get pseudo-legal moves (doesn't check for leaving king in check)
function getPseudoLegalMoves(state, square) {
    const piece = getPieceAt(state, square);
    if (!piece) return [];
    const [row, col] = squareToCoords(square);
    const moves = [];
    switch(piece.type){
        case "p":
            moves.push(...getPawnMoves(state, row, col, piece.color));
            break;
        case "n":
            moves.push(...getKnightMoves(state, row, col, piece.color));
            break;
        case "b":
            moves.push(...getBishopMoves(state, row, col, piece.color));
            break;
        case "r":
            moves.push(...getRookMoves(state, row, col, piece.color));
            break;
        case "q":
            moves.push(...getQueenMoves(state, row, col, piece.color));
            break;
        case "k":
            moves.push(...getKingMoves(state, row, col, piece.color));
            break;
    }
    return moves;
}
function getValidMoves(state, square) {
    const piece = getPieceAt(state, square);
    if (!piece || piece.color !== state.turn) return [];
    const moves = getPseudoLegalMoves(state, square);
    // Filter out moves that would leave king in check
    return moves.filter((to)=>{
        const testState = makeQuickMove(state, square, to);
        return !isKingInCheck(testState, piece.color);
    });
}
function getPawnMoves(state, row, col, color) {
    const moves = [];
    const direction = color === "w" ? -1 : 1;
    const startRow = color === "w" ? 6 : 1;
    // Forward move
    const newRow = row + direction;
    if (newRow >= 0 && newRow < 8 && !state.board[newRow][col]) {
        moves.push(coordsToSquare(newRow, col));
        // Double move from start
        if (row === startRow && !state.board[row + 2 * direction][col]) {
            moves.push(coordsToSquare(row + 2 * direction, col));
        }
    }
    // Captures
    for (const dc of [
        -1,
        1
    ]){
        const newCol = col + dc;
        if (newCol >= 0 && newCol < 8 && newRow >= 0 && newRow < 8) {
            const target = state.board[newRow]?.[newCol];
            if (target && target.color !== color) {
                moves.push(coordsToSquare(newRow, newCol));
            }
            // En passant
            if (state.enPassant === coordsToSquare(newRow, newCol)) {
                moves.push(coordsToSquare(newRow, newCol));
            }
        }
    }
    return moves;
}
function getKnightMoves(state, row, col, color) {
    const moves = [];
    const offsets = [
        [
            -2,
            -1
        ],
        [
            -2,
            1
        ],
        [
            -1,
            -2
        ],
        [
            -1,
            2
        ],
        [
            1,
            -2
        ],
        [
            1,
            2
        ],
        [
            2,
            -1
        ],
        [
            2,
            1
        ]
    ];
    for (const [dr, dc] of offsets){
        const newRow = row + dr;
        const newCol = col + dc;
        if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
            const target = state.board[newRow][newCol];
            if (!target || target.color !== color) {
                moves.push(coordsToSquare(newRow, newCol));
            }
        }
    }
    return moves;
}
function getSlidingMoves(state, row, col, color, directions) {
    const moves = [];
    for (const [dr, dc] of directions){
        let newRow = row + dr;
        let newCol = col + dc;
        while(newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8){
            const target = state.board[newRow][newCol];
            if (!target) {
                moves.push(coordsToSquare(newRow, newCol));
            } else {
                if (target.color !== color) {
                    moves.push(coordsToSquare(newRow, newCol));
                }
                break;
            }
            newRow += dr;
            newCol += dc;
        }
    }
    return moves;
}
function getBishopMoves(state, row, col, color) {
    return getSlidingMoves(state, row, col, color, [
        [
            -1,
            -1
        ],
        [
            -1,
            1
        ],
        [
            1,
            -1
        ],
        [
            1,
            1
        ]
    ]);
}
function getRookMoves(state, row, col, color) {
    return getSlidingMoves(state, row, col, color, [
        [
            -1,
            0
        ],
        [
            1,
            0
        ],
        [
            0,
            -1
        ],
        [
            0,
            1
        ]
    ]);
}
function getQueenMoves(state, row, col, color) {
    return [
        ...getBishopMoves(state, row, col, color),
        ...getRookMoves(state, row, col, color)
    ];
}
function getKingMoves(state, row, col, color) {
    const moves = [];
    const offsets = [
        [
            -1,
            -1
        ],
        [
            -1,
            0
        ],
        [
            -1,
            1
        ],
        [
            0,
            -1
        ],
        [
            0,
            1
        ],
        [
            1,
            -1
        ],
        [
            1,
            0
        ],
        [
            1,
            1
        ]
    ];
    for (const [dr, dc] of offsets){
        const newRow = row + dr;
        const newCol = col + dc;
        if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
            const target = state.board[newRow][newCol];
            if (!target || target.color !== color) {
                moves.push(coordsToSquare(newRow, newCol));
            }
        }
    }
    // Castling
    const castleRow = color === "w" ? 7 : 0;
    if (row === castleRow && col === 4 && !isKingInCheck(state, color)) {
        // Kingside
        if (state.castling[color].k && !state.board[castleRow][5] && !state.board[castleRow][6] && state.board[castleRow][7]?.type === "r") {
            const test1 = makeQuickMove(state, coordsToSquare(row, col), coordsToSquare(row, 5));
            const test2 = makeQuickMove(state, coordsToSquare(row, col), coordsToSquare(row, 6));
            if (!isKingInCheck(test1, color) && !isKingInCheck(test2, color)) {
                moves.push(coordsToSquare(castleRow, 6));
            }
        }
        // Queenside
        if (state.castling[color].q && !state.board[castleRow][3] && !state.board[castleRow][2] && !state.board[castleRow][1] && state.board[castleRow][0]?.type === "r") {
            const test1 = makeQuickMove(state, coordsToSquare(row, col), coordsToSquare(row, 3));
            const test2 = makeQuickMove(state, coordsToSquare(row, col), coordsToSquare(row, 2));
            if (!isKingInCheck(test1, color) && !isKingInCheck(test2, color)) {
                moves.push(coordsToSquare(castleRow, 2));
            }
        }
    }
    return moves;
}
function findKing(state, color) {
    for(let row = 0; row < 8; row++){
        for(let col = 0; col < 8; col++){
            const piece = state.board[row][col];
            if (piece?.type === "k" && piece.color === color) {
                return coordsToSquare(row, col);
            }
        }
    }
    return null;
}
function isKingInCheck(state, color) {
    const kingSquare = findKing(state, color);
    if (!kingSquare) return false;
    const [kingRow, kingCol] = squareToCoords(kingSquare);
    const enemyColor = color === "w" ? "b" : "w";
    // Check for attacks from each piece type
    // Knights
    const knightOffsets = [
        [
            -2,
            -1
        ],
        [
            -2,
            1
        ],
        [
            -1,
            -2
        ],
        [
            -1,
            2
        ],
        [
            1,
            -2
        ],
        [
            1,
            2
        ],
        [
            2,
            -1
        ],
        [
            2,
            1
        ]
    ];
    for (const [dr, dc] of knightOffsets){
        const r = kingRow + dr;
        const c = kingCol + dc;
        if (r >= 0 && r < 8 && c >= 0 && c < 8) {
            const piece = state.board[r][c];
            if (piece?.type === "n" && piece.color === enemyColor) return true;
        }
    }
    // Pawns
    const pawnDir = color === "w" ? -1 : 1;
    for (const dc of [
        -1,
        1
    ]){
        const r = kingRow + pawnDir;
        const c = kingCol + dc;
        if (r >= 0 && r < 8 && c >= 0 && c < 8) {
            const piece = state.board[r][c];
            if (piece?.type === "p" && piece.color === enemyColor) return true;
        }
    }
    // King (for proximity checks)
    const kingOffsets = [
        [
            -1,
            -1
        ],
        [
            -1,
            0
        ],
        [
            -1,
            1
        ],
        [
            0,
            -1
        ],
        [
            0,
            1
        ],
        [
            1,
            -1
        ],
        [
            1,
            0
        ],
        [
            1,
            1
        ]
    ];
    for (const [dr, dc] of kingOffsets){
        const r = kingRow + dr;
        const c = kingCol + dc;
        if (r >= 0 && r < 8 && c >= 0 && c < 8) {
            const piece = state.board[r][c];
            if (piece?.type === "k" && piece.color === enemyColor) return true;
        }
    }
    // Sliding pieces (bishop, rook, queen)
    const diagonals = [
        [
            -1,
            -1
        ],
        [
            -1,
            1
        ],
        [
            1,
            -1
        ],
        [
            1,
            1
        ]
    ];
    const straights = [
        [
            -1,
            0
        ],
        [
            1,
            0
        ],
        [
            0,
            -1
        ],
        [
            0,
            1
        ]
    ];
    for (const [dr, dc] of diagonals){
        let r = kingRow + dr;
        let c = kingCol + dc;
        while(r >= 0 && r < 8 && c >= 0 && c < 8){
            const piece = state.board[r][c];
            if (piece) {
                if (piece.color === enemyColor && (piece.type === "b" || piece.type === "q")) {
                    return true;
                }
                break;
            }
            r += dr;
            c += dc;
        }
    }
    for (const [dr, dc] of straights){
        let r = kingRow + dr;
        let c = kingCol + dc;
        while(r >= 0 && r < 8 && c >= 0 && c < 8){
            const piece = state.board[r][c];
            if (piece) {
                if (piece.color === enemyColor && (piece.type === "r" || piece.type === "q")) {
                    return true;
                }
                break;
            }
            r += dr;
            c += dc;
        }
    }
    return false;
}
function makeQuickMove(state, from, to) {
    const newBoard = cloneBoard(state.board);
    const [fromRow, fromCol] = squareToCoords(from);
    const [toRow, toCol] = squareToCoords(to);
    const piece = state.board[fromRow][fromCol];
    if (!piece) return state;
    newBoard[toRow][toCol] = {
        ...piece
    };
    newBoard[fromRow][fromCol] = null;
    // Handle en passant capture
    if (piece.type === "p" && to === state.enPassant) {
        const captureRow = piece.color === "w" ? toRow + 1 : toRow - 1;
        newBoard[captureRow][toCol] = null;
    }
    // Handle castling rook movement
    if (piece.type === "k" && Math.abs(toCol - fromCol) === 2) {
        if (toCol === 6) {
            newBoard[fromRow][5] = newBoard[fromRow][7];
            newBoard[fromRow][7] = null;
        } else if (toCol === 2) {
            newBoard[fromRow][3] = newBoard[fromRow][0];
            newBoard[fromRow][0] = null;
        }
    }
    return {
        ...state,
        board: newBoard,
        turn: state.turn === "w" ? "b" : "w"
    };
}
function makeMove(state, from, to, promotion) {
    const validMoves = getValidMoves(state, from);
    if (!validMoves.includes(to)) return null;
    const newState = cloneState(state);
    const [fromRow, fromCol] = squareToCoords(from);
    const piece = newState.board[fromRow][fromCol];
    if (!piece) return null;
    const [toRow, toCol] = squareToCoords(to);
    const captured = newState.board[toRow][toCol];
    // Create move record
    const move = {
        from,
        to,
        piece: piece.type,
        captured: captured?.type
    };
    // Handle special moves
    // En passant capture
    if (piece.type === "p" && to === state.enPassant) {
        const captureRow = piece.color === "w" ? toRow + 1 : toRow - 1;
        newState.board[captureRow][toCol] = null;
        move.enPassant = true;
        move.captured = "p";
    }
    // Castling
    if (piece.type === "k" && Math.abs(toCol - fromCol) === 2) {
        if (toCol === 6) {
            // Kingside
            newState.board[fromRow][5] = newState.board[fromRow][7];
            newState.board[fromRow][7] = null;
            move.castle = "k";
        } else if (toCol === 2) {
            // Queenside
            newState.board[fromRow][3] = newState.board[fromRow][0];
            newState.board[fromRow][0] = null;
            move.castle = "q";
        }
    }
    // Pawn promotion
    if (piece.type === "p" && (toRow === 0 || toRow === 7)) {
        piece.type = promotion || "q";
        move.promotion = piece.type;
    }
    // Move the piece
    newState.board[toRow][toCol] = piece;
    newState.board[fromRow][fromCol] = null;
    // Update castling rights
    if (piece.type === "k") {
        newState.castling[piece.color].k = false;
        newState.castling[piece.color].q = false;
    }
    if (piece.type === "r") {
        if (fromCol === 0) newState.castling[piece.color].q = false;
        if (fromCol === 7) newState.castling[piece.color].k = false;
    }
    // Set en passant square
    if (piece.type === "p" && Math.abs(toRow - fromRow) === 2) {
        newState.enPassant = coordsToSquare((fromRow + toRow) / 2, fromCol);
    } else {
        newState.enPassant = null;
    }
    // Update move counters
    if (piece.type === "p" || captured) {
        newState.halfMoves = 0;
    } else {
        newState.halfMoves++;
    }
    if (piece.color === "b") {
        newState.fullMoves++;
    }
    // Switch turn
    newState.turn = piece.color === "w" ? "b" : "w";
    // Check for check/checkmate/stalemate
    newState.isCheck = isKingInCheck(newState, newState.turn);
    move.check = newState.isCheck;
    const hasLegalMoves = hasAnyLegalMove(newState);
    if (!hasLegalMoves) {
        if (newState.isCheck) {
            newState.isCheckmate = true;
            move.checkmate = true;
        } else {
            newState.isStalemate = true;
        }
    }
    // Check for draw by 50-move rule
    if (newState.halfMoves >= 100) {
        newState.isDraw = true;
    }
    newState.history = [
        ...state.history,
        move
    ];
    return newState;
}
function hasAnyLegalMove(state) {
    for(let row = 0; row < 8; row++){
        for(let col = 0; col < 8; col++){
            const piece = state.board[row][col];
            if (piece && piece.color === state.turn) {
                const square = coordsToSquare(row, col);
                const moves = getPseudoLegalMoves(state, square);
                for (const to of moves){
                    const testState = makeQuickMove(state, square, to);
                    if (!isKingInCheck(testState, piece.color)) {
                        return true // Found at least one legal move
                        ;
                    }
                }
            }
        }
    }
    return false;
}
function getAllLegalMoves(state) {
    const moves = [];
    for(let row = 0; row < 8; row++){
        for(let col = 0; col < 8; col++){
            const piece = state.board[row][col];
            if (piece && piece.color === state.turn) {
                const square = coordsToSquare(row, col);
                const validMoves = getValidMoves(state, square);
                for (const to of validMoves){
                    moves.push({
                        from: square,
                        to
                    });
                }
            }
        }
    }
    return moves;
}
function moveToAlgebraic(state, move) {
    const pieceSymbols = {
        p: "",
        n: "N",
        b: "B",
        r: "R",
        q: "Q",
        k: "K"
    };
    if (move.castle === "k") return "O-O";
    if (move.castle === "q") return "O-O-O";
    let notation = pieceSymbols[move.piece];
    if (move.captured) {
        if (move.piece === "p") {
            notation += move.from[0];
        }
        notation += "x";
    }
    notation += move.to;
    if (move.promotion) {
        notation += "=" + pieceSymbols[move.promotion];
    }
    if (move.checkmate) {
        notation += "#";
    } else if (move.check) {
        notation += "+";
    }
    return notation;
}
function gameStateToFEN(state) {
    const pieceToFEN = {
        wp: "P",
        wn: "N",
        wb: "B",
        wr: "R",
        wq: "Q",
        wk: "K",
        bp: "p",
        bn: "n",
        bb: "b",
        br: "r",
        bq: "q",
        bk: "k"
    };
    let fen = "";
    // Board position
    for(let row = 0; row < 8; row++){
        let empty = 0;
        for(let col = 0; col < 8; col++){
            const piece = state.board[row][col];
            if (piece) {
                if (empty > 0) {
                    fen += empty;
                    empty = 0;
                }
                fen += pieceToFEN[piece.color + piece.type];
            } else {
                empty++;
            }
        }
        if (empty > 0) fen += empty;
        if (row < 7) fen += "/";
    }
    fen += " " + state.turn;
    let castling = "";
    if (state.castling.w.k) castling += "K";
    if (state.castling.w.q) castling += "Q";
    if (state.castling.b.k) castling += "k";
    if (state.castling.b.q) castling += "q";
    fen += " " + (castling || "-");
    fen += " " + (state.enPassant || "-");
    fen += " " + state.halfMoves;
    fen += " " + state.fullMoves;
    return fen;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/utils.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "cn",
    ()=>cn
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/clsx/dist/clsx.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/tailwind-merge/dist/bundle-mjs.mjs [app-client] (ecmascript)");
;
;
function cn(...inputs) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["twMerge"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["clsx"])(inputs));
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/chess-board.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ChessBoard",
    ()=>ChessBoard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$chess$2d$engine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/chess-engine.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-client] (ecmascript)");
"use client";
;
;
;
const PIECE_SYMBOLS = {
    wp: "♙",
    wn: "♘",
    wb: "♗",
    wr: "♖",
    wq: "♕",
    wk: "♔",
    bp: "♟",
    bn: "♞",
    bb: "♝",
    br: "♜",
    bq: "♛",
    bk: "♚"
};
function ChessBoard({ gameState, selectedSquare, validMoves, lastMove, aiLastMove, onSquareClick, flipped = false, isThinking = false, playerColor = "w" }) {
    const rows = flipped ? [
        7,
        6,
        5,
        4,
        3,
        2,
        1,
        0
    ] : [
        0,
        1,
        2,
        3,
        4,
        5,
        6,
        7
    ];
    const cols = flipped ? [
        7,
        6,
        5,
        4,
        3,
        2,
        1,
        0
    ] : [
        0,
        1,
        2,
        3,
        4,
        5,
        6,
        7
    ];
    const renderSquare = (row, col)=>{
        const square = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$chess$2d$engine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["coordsToSquare"])(row, col);
        const piece = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$chess$2d$engine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getPieceAt"])(gameState, square);
        const isLight = (row + col) % 2 === 0;
        const isSelected = selectedSquare === square;
        const isValidMove = validMoves.includes(square);
        const isPlayerMoveSquare = lastMove?.from === square || lastMove?.to === square;
        const isAIMoveSquare = aiLastMove?.from === square || aiLastMove?.to === square;
        const isCheck = piece?.type === "k" && piece.color === gameState.turn && gameState.isCheck;
        const hasPiece = piece !== null;
        const isPlayerPiece = piece?.color === playerColor;
        const isPlayerTurn = gameState.turn === playerColor;
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
            onClick: ()=>onSquareClick(square),
            disabled: isThinking,
            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("relative aspect-square flex items-center justify-center transition-all", "text-2xl sm:text-3xl md:text-4xl lg:text-5xl", isLight ? "bg-board-light" : "bg-board-dark", isLight && "wood-texture", isSelected && "ring-2 ring-primary ring-inset", isPlayerMoveSquare && "bg-yellow-400/50", isAIMoveSquare && !isPlayerMoveSquare && "bg-blue-400/50", isCheck && "bg-highlight-check", isThinking && "cursor-not-allowed opacity-80", !isThinking && isPlayerPiece && isPlayerTurn && !isSelected && "hover:brightness-110 cursor-pointer"),
            children: [
                isValidMove && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("absolute inset-0 flex items-center justify-center z-10", hasPiece ? "ring-2 ring-inset ring-primary/60" : ""),
                    children: !hasPiece && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "w-2 h-2 md:w-3 md:h-3 rounded-full bg-primary/50"
                    }, void 0, false, {
                        fileName: "[project]/components/chess-board.tsx",
                        lineNumber: 100,
                        columnNumber: 15
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/components/chess-board.tsx",
                    lineNumber: 93,
                    columnNumber: 11
                }, this),
                piece && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("select-none drop-shadow-md transition-transform relative z-0", piece.color === "w" ? "text-white [text-shadow:_1px_1px_2px_rgb(0_0_0_/_60%)]" : "text-gray-900", isSelected && "scale-110"),
                    children: PIECE_SYMBOLS[piece.color + piece.type]
                }, void 0, false, {
                    fileName: "[project]/components/chess-board.tsx",
                    lineNumber: 106,
                    columnNumber: 11
                }, this),
                col === (flipped ? 7 : 0) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "absolute left-0.5 top-0.5 text-[9px] font-medium text-muted-foreground/70",
                    children: 8 - row
                }, void 0, false, {
                    fileName: "[project]/components/chess-board.tsx",
                    lineNumber: 120,
                    columnNumber: 11
                }, this),
                row === (flipped ? 0 : 7) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "absolute right-0.5 bottom-0.5 text-[9px] font-medium text-muted-foreground/70",
                    children: String.fromCharCode(97 + col)
                }, void 0, false, {
                    fileName: "[project]/components/chess-board.tsx",
                    lineNumber: 125,
                    columnNumber: 11
                }, this)
            ]
        }, square, true, {
            fileName: "[project]/components/chess-board.tsx",
            lineNumber: 71,
            columnNumber: 7
        }, this);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "relative",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "grid grid-cols-8 rounded overflow-hidden border-4 border-board-border shadow-xl",
            style: {
                width: "calc(100vh - 80px)",
                height: "calc(100vh - 80px)",
                maxWidth: "600px",
                maxHeight: "600px"
            },
            children: rows.map((row)=>cols.map((col)=>renderSquare(row, col)))
        }, void 0, false, {
            fileName: "[project]/components/chess-board.tsx",
            lineNumber: 135,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/chess-board.tsx",
        lineNumber: 134,
        columnNumber: 5
    }, this);
}
_c = ChessBoard;
var _c;
__turbopack_context__.k.register(_c, "ChessBoard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ui/card.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Card",
    ()=>Card,
    "CardAction",
    ()=>CardAction,
    "CardContent",
    ()=>CardContent,
    "CardDescription",
    ()=>CardDescription,
    "CardFooter",
    ()=>CardFooter,
    "CardHeader",
    ()=>CardHeader,
    "CardTitle",
    ()=>CardTitle
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-client] (ecmascript)");
;
;
function Card({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/card.tsx",
        lineNumber: 7,
        columnNumber: 5
    }, this);
}
_c = Card;
function CardHeader({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-header",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/card.tsx",
        lineNumber: 20,
        columnNumber: 5
    }, this);
}
_c1 = CardHeader;
function CardTitle({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-title",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('leading-none font-semibold', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/card.tsx",
        lineNumber: 33,
        columnNumber: 5
    }, this);
}
_c2 = CardTitle;
function CardDescription({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-description",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('text-muted-foreground text-sm', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/card.tsx",
        lineNumber: 43,
        columnNumber: 5
    }, this);
}
_c3 = CardDescription;
function CardAction({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-action",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('col-start-2 row-span-2 row-start-1 self-start justify-self-end', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/card.tsx",
        lineNumber: 53,
        columnNumber: 5
    }, this);
}
_c4 = CardAction;
function CardContent({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-content",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('px-6', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/card.tsx",
        lineNumber: 66,
        columnNumber: 5
    }, this);
}
_c5 = CardContent;
function CardFooter({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-footer",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex items-center px-6 [.border-t]:pt-6', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/card.tsx",
        lineNumber: 76,
        columnNumber: 5
    }, this);
}
_c6 = CardFooter;
;
var _c, _c1, _c2, _c3, _c4, _c5, _c6;
__turbopack_context__.k.register(_c, "Card");
__turbopack_context__.k.register(_c1, "CardHeader");
__turbopack_context__.k.register(_c2, "CardTitle");
__turbopack_context__.k.register(_c3, "CardDescription");
__turbopack_context__.k.register(_c4, "CardAction");
__turbopack_context__.k.register(_c5, "CardContent");
__turbopack_context__.k.register(_c6, "CardFooter");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ui/badge.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Badge",
    ()=>Badge,
    "badgeVariants",
    ()=>badgeVariants
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-slot/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/class-variance-authority/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-client] (ecmascript)");
;
;
;
;
const badgeVariants = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cva"])('inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden', {
    variants: {
        variant: {
            default: 'border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90',
            secondary: 'border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90',
            destructive: 'border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
            outline: 'text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground'
        }
    },
    defaultVariants: {
        variant: 'default'
    }
});
function Badge({ className, variant, asChild = false, ...props }) {
    const Comp = asChild ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Slot"] : 'span';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Comp, {
        "data-slot": "badge",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])(badgeVariants({
            variant
        }), className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/badge.tsx",
        lineNumber: 38,
        columnNumber: 5
    }, this);
}
_c = Badge;
;
var _c;
__turbopack_context__.k.register(_c, "Badge");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/move-history-panel.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MoveHistoryPanel",
    ()=>MoveHistoryPanel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/card.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/badge.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
function MoveHistoryPanel({ moveNotations, gameState, isThinking }) {
    _s();
    const pairs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "MoveHistoryPanel.useMemo[pairs]": ()=>{
            const result = [];
            for(let i = 0; i < moveNotations.length; i += 2){
                result.push([
                    moveNotations[i],
                    moveNotations[i + 1]
                ]);
            }
            return result;
        }
    }["MoveHistoryPanel.useMemo[pairs]"], [
        moveNotations
    ]);
    const status = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "MoveHistoryPanel.useMemo[status]": ()=>{
            if (gameState.isCheckmate) {
                const winner = gameState.turn === "w" ? "Black" : "White";
                return {
                    text: `Checkmate! ${winner} wins`,
                    color: "text-yellow-500"
                };
            }
            if (gameState.isStalemate) return {
                text: "Stalemate",
                color: "text-muted-foreground"
            };
            if (gameState.isDraw) return {
                text: "Draw",
                color: "text-muted-foreground"
            };
            if (gameState.isCheck) return {
                text: "Check!",
                color: "text-red-500"
            };
            return null;
        }
    }["MoveHistoryPanel.useMemo[status]"], [
        gameState.isCheckmate,
        gameState.isStalemate,
        gameState.isDraw,
        gameState.isCheck,
        gameState.turn
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
        className: "bg-card border-border h-full flex flex-col",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardHeader"], {
                className: "py-1.5 px-2 flex-shrink-0",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center justify-between",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardTitle"], {
                            className: "text-xs font-medium",
                            children: "Move History"
                        }, void 0, false, {
                            fileName: "[project]/components/move-history-panel.tsx",
                            lineNumber: 38,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                            variant: "outline",
                            className: "text-[9px] px-1 py-0 h-4 font-mono",
                            children: gameState.turn === "w" ? "White" : "Black"
                        }, void 0, false, {
                            fileName: "[project]/components/move-history-panel.tsx",
                            lineNumber: 39,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/move-history-panel.tsx",
                    lineNumber: 37,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/move-history-panel.tsx",
                lineNumber: 36,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
                className: "px-2 pb-2 flex-1 min-h-0 overflow-hidden",
                children: [
                    status && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `flex items-center gap-1 mb-1.5 p-1 bg-secondary/50 rounded text-[11px] ${status.color}`,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "font-medium",
                            children: status.text
                        }, void 0, false, {
                            fileName: "[project]/components/move-history-panel.tsx",
                            lineNumber: 47,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/move-history-panel.tsx",
                        lineNumber: 46,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "h-full overflow-y-auto",
                        children: pairs.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-[11px] text-muted-foreground text-center py-3",
                            children: "No moves yet"
                        }, void 0, false, {
                            fileName: "[project]/components/move-history-panel.tsx",
                            lineNumber: 53,
                            columnNumber: 13
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "space-y-px",
                            children: [
                                pairs.map((pair, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center text-[11px] font-mono py-0.5 hover:bg-secondary/30 rounded px-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "w-5 text-muted-foreground",
                                                children: [
                                                    index + 1,
                                                    "."
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/move-history-panel.tsx",
                                                lineNumber: 61,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "w-12 text-foreground",
                                                children: pair[0]
                                            }, void 0, false, {
                                                fileName: "[project]/components/move-history-panel.tsx",
                                                lineNumber: 62,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "w-12 text-foreground",
                                                children: pair[1] || ""
                                            }, void 0, false, {
                                                fileName: "[project]/components/move-history-panel.tsx",
                                                lineNumber: 63,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, index, true, {
                                        fileName: "[project]/components/move-history-panel.tsx",
                                        lineNumber: 57,
                                        columnNumber: 17
                                    }, this)),
                                isThinking && moveNotations.length % 2 === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center text-[11px] font-mono py-0.5 px-1",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "w-5 text-muted-foreground",
                                            children: [
                                                pairs.length + 1,
                                                "."
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/move-history-panel.tsx",
                                            lineNumber: 68,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "w-12 text-muted-foreground animate-pulse",
                                            children: "..."
                                        }, void 0, false, {
                                            fileName: "[project]/components/move-history-panel.tsx",
                                            lineNumber: 69,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/move-history-panel.tsx",
                                    lineNumber: 67,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/move-history-panel.tsx",
                            lineNumber: 55,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/move-history-panel.tsx",
                        lineNumber: 51,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/move-history-panel.tsx",
                lineNumber: 44,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/move-history-panel.tsx",
        lineNumber: 35,
        columnNumber: 5
    }, this);
}
_s(MoveHistoryPanel, "7W01oH0PZPYnJrUQVtNeSSVwBpU=");
_c = MoveHistoryPanel;
var _c;
__turbopack_context__.k.register(_c, "MoveHistoryPanel");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ai-feedback.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AIFeedback",
    ()=>AIFeedback
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/card.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/badge.tsx [app-client] (ecmascript)");
"use client";
;
;
;
const EVALUATION_CONFIG = {
    brilliant: {
        label: "Brilliant!",
        color: "bg-cyan-500 text-white"
    },
    excellent: {
        label: "Excellent",
        color: "bg-green-500 text-white"
    },
    good: {
        label: "Good",
        color: "bg-emerald-600 text-white"
    },
    inaccuracy: {
        label: "Inaccuracy",
        color: "bg-yellow-500 text-black"
    },
    mistake: {
        label: "Mistake",
        color: "bg-orange-500 text-white"
    },
    blunder: {
        label: "Blunder",
        color: "bg-red-500 text-white"
    }
};
function AIFeedback({ evaluation, analysis, isAnalyzing, isThinking, playerStats, aiElo, difficulty }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
        className: "bg-card border-border",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
            className: "p-2 space-y-2",
            children: [
                playerStats && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center justify-between text-[11px] border-b border-border pb-1.5",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-muted-foreground",
                            children: [
                                "You:",
                                " ",
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "font-mono font-bold text-primary",
                                    children: playerStats.skillRating
                                }, void 0, false, {
                                    fileName: "[project]/components/ai-feedback.tsx",
                                    lineNumber: 43,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/ai-feedback.tsx",
                            lineNumber: 41,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-muted-foreground",
                            children: [
                                "AI: ",
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "font-mono",
                                    children: [
                                        "~",
                                        aiElo
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/ai-feedback.tsx",
                                    lineNumber: 48,
                                    columnNumber: 19
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/ai-feedback.tsx",
                            lineNumber: 47,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                            variant: "outline",
                            className: "text-[10px] px-1 py-0 h-4",
                            children: [
                                "Lv.",
                                difficulty
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/ai-feedback.tsx",
                            lineNumber: 50,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/ai-feedback.tsx",
                    lineNumber: 40,
                    columnNumber: 11
                }, this),
                isThinking ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center gap-2 py-1",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "w-2 h-2 bg-primary rounded-full animate-pulse"
                        }, void 0, false, {
                            fileName: "[project]/components/ai-feedback.tsx",
                            lineNumber: 58,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-xs text-muted-foreground",
                            children: "AI considering move..."
                        }, void 0, false, {
                            fileName: "[project]/components/ai-feedback.tsx",
                            lineNumber: 59,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/ai-feedback.tsx",
                    lineNumber: 57,
                    columnNumber: 11
                }, this) : !evaluation ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-xs text-muted-foreground py-1",
                    children: "Make a move for feedback"
                }, void 0, false, {
                    fileName: "[project]/components/ai-feedback.tsx",
                    lineNumber: 64,
                    columnNumber: 11
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center justify-between",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-1.5",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                            className: EVALUATION_CONFIG[evaluation.type].color + " text-[10px] px-1.5 h-5",
                                            children: EVALUATION_CONFIG[evaluation.type].label
                                        }, void 0, false, {
                                            fileName: "[project]/components/ai-feedback.tsx",
                                            lineNumber: 71,
                                            columnNumber: 17
                                        }, this),
                                        evaluation.centipawnLoss > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-[15px] text-muted-foreground font-mono",
                                            children: [
                                                "-",
                                                evaluation.centipawnLoss,
                                                "cp"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/ai-feedback.tsx",
                                            lineNumber: 80,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/ai-feedback.tsx",
                                    lineNumber: 70,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-[15px] text-muted-foreground font-mono",
                                    children: [
                                        evaluation.from,
                                        "-",
                                        evaluation.to
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/ai-feedback.tsx",
                                    lineNumber: 85,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/ai-feedback.tsx",
                            lineNumber: 69,
                            columnNumber: 13
                        }, this),
                        evaluation.bestMove && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-[11px] text-muted-foreground",
                            children: [
                                "Better:",
                                " ",
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "font-mono text-foreground",
                                    children: [
                                        evaluation.bestMove.from,
                                        "-",
                                        evaluation.bestMove.to
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/ai-feedback.tsx",
                                    lineNumber: 93,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/ai-feedback.tsx",
                            lineNumber: 91,
                            columnNumber: 15
                        }, this),
                        isAnalyzing ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-1.5 text-[15px] text-muted-foreground",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "w-1.5 h-1.5 bg-primary rounded-full animate-spin"
                                }, void 0, false, {
                                    fileName: "[project]/components/ai-feedback.tsx",
                                    lineNumber: 101,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    children: "Analyzing..."
                                }, void 0, false, {
                                    fileName: "[project]/components/ai-feedback.tsx",
                                    lineNumber: 102,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/ai-feedback.tsx",
                            lineNumber: 100,
                            columnNumber: 15
                        }, this) : analysis ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "p-1.5 bg-secondary/50 rounded text-[15px] text-foreground leading-relaxed max-h-20 overflow-y-auto",
                            children: analysis
                        }, void 0, false, {
                            fileName: "[project]/components/ai-feedback.tsx",
                            lineNumber: 105,
                            columnNumber: 15
                        }, this) : null
                    ]
                }, void 0, true)
            ]
        }, void 0, true, {
            fileName: "[project]/components/ai-feedback.tsx",
            lineNumber: 38,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/ai-feedback.tsx",
        lineNumber: 37,
        columnNumber: 5
    }, this);
}
_c = AIFeedback;
var _c;
__turbopack_context__.k.register(_c, "AIFeedback");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ui/dialog.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Dialog",
    ()=>Dialog,
    "DialogClose",
    ()=>DialogClose,
    "DialogContent",
    ()=>DialogContent,
    "DialogDescription",
    ()=>DialogDescription,
    "DialogFooter",
    ()=>DialogFooter,
    "DialogHeader",
    ()=>DialogHeader,
    "DialogOverlay",
    ()=>DialogOverlay,
    "DialogPortal",
    ()=>DialogPortal,
    "DialogTitle",
    ()=>DialogTitle,
    "DialogTrigger",
    ()=>DialogTrigger
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-dialog/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__XIcon$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as XIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-client] (ecmascript)");
'use client';
;
;
;
;
function Dialog({ ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Root"], {
        "data-slot": "dialog",
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/dialog.tsx",
        lineNumber: 12,
        columnNumber: 10
    }, this);
}
_c = Dialog;
function DialogTrigger({ ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Trigger"], {
        "data-slot": "dialog-trigger",
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/dialog.tsx",
        lineNumber: 18,
        columnNumber: 10
    }, this);
}
_c1 = DialogTrigger;
function DialogPortal({ ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Portal"], {
        "data-slot": "dialog-portal",
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/dialog.tsx",
        lineNumber: 24,
        columnNumber: 10
    }, this);
}
_c2 = DialogPortal;
function DialogClose({ ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Close"], {
        "data-slot": "dialog-close",
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/dialog.tsx",
        lineNumber: 30,
        columnNumber: 10
    }, this);
}
_c3 = DialogClose;
function DialogOverlay({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Overlay"], {
        "data-slot": "dialog-overlay",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/dialog.tsx",
        lineNumber: 38,
        columnNumber: 5
    }, this);
}
_c4 = DialogOverlay;
function DialogContent({ className, children, showCloseButton = true, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(DialogPortal, {
        "data-slot": "dialog-portal",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(DialogOverlay, {}, void 0, false, {
                fileName: "[project]/components/ui/dialog.tsx",
                lineNumber: 59,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Content"], {
                "data-slot": "dialog-content",
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg', className),
                ...props,
                children: [
                    children,
                    showCloseButton && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Close"], {
                        "data-slot": "dialog-close",
                        className: "ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__XIcon$3e$__["XIcon"], {}, void 0, false, {
                                fileName: "[project]/components/ui/dialog.tsx",
                                lineNumber: 74,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "sr-only",
                                children: "Close"
                            }, void 0, false, {
                                fileName: "[project]/components/ui/dialog.tsx",
                                lineNumber: 75,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/ui/dialog.tsx",
                        lineNumber: 70,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/ui/dialog.tsx",
                lineNumber: 60,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/ui/dialog.tsx",
        lineNumber: 58,
        columnNumber: 5
    }, this);
}
_c5 = DialogContent;
function DialogHeader({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "dialog-header",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex flex-col gap-2 text-center sm:text-left', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/dialog.tsx",
        lineNumber: 85,
        columnNumber: 5
    }, this);
}
_c6 = DialogHeader;
function DialogFooter({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "dialog-footer",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/dialog.tsx",
        lineNumber: 95,
        columnNumber: 5
    }, this);
}
_c7 = DialogFooter;
function DialogTitle({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Title"], {
        "data-slot": "dialog-title",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('text-lg leading-none font-semibold', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/dialog.tsx",
        lineNumber: 111,
        columnNumber: 5
    }, this);
}
_c8 = DialogTitle;
function DialogDescription({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Description"], {
        "data-slot": "dialog-description",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('text-muted-foreground text-sm', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/dialog.tsx",
        lineNumber: 124,
        columnNumber: 5
    }, this);
}
_c9 = DialogDescription;
;
var _c, _c1, _c2, _c3, _c4, _c5, _c6, _c7, _c8, _c9;
__turbopack_context__.k.register(_c, "Dialog");
__turbopack_context__.k.register(_c1, "DialogTrigger");
__turbopack_context__.k.register(_c2, "DialogPortal");
__turbopack_context__.k.register(_c3, "DialogClose");
__turbopack_context__.k.register(_c4, "DialogOverlay");
__turbopack_context__.k.register(_c5, "DialogContent");
__turbopack_context__.k.register(_c6, "DialogHeader");
__turbopack_context__.k.register(_c7, "DialogFooter");
__turbopack_context__.k.register(_c8, "DialogTitle");
__turbopack_context__.k.register(_c9, "DialogDescription");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ui/button.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Button",
    ()=>Button,
    "buttonVariants",
    ()=>buttonVariants
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-slot/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/class-variance-authority/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-client] (ecmascript)");
;
;
;
;
const buttonVariants = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cva"])("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive", {
    variants: {
        variant: {
            default: 'bg-primary text-primary-foreground hover:bg-primary/90',
            destructive: 'bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
            outline: 'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50',
            secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
            ghost: 'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
            link: 'text-primary underline-offset-4 hover:underline'
        },
        size: {
            default: 'h-9 px-4 py-2 has-[>svg]:px-3',
            sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
            lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
            icon: 'size-9',
            'icon-sm': 'size-8',
            'icon-lg': 'size-10'
        }
    },
    defaultVariants: {
        variant: 'default',
        size: 'default'
    }
});
function Button({ className, variant, size, asChild = false, ...props }) {
    const Comp = asChild ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Slot"] : 'button';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Comp, {
        "data-slot": "button",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])(buttonVariants({
            variant,
            size,
            className
        })),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/button.tsx",
        lineNumber: 52,
        columnNumber: 5
    }, this);
}
_c = Button;
;
var _c;
__turbopack_context__.k.register(_c, "Button");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ui/input.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Input",
    ()=>Input
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-client] (ecmascript)");
;
;
function Input({ className, type, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
        type: type,
        "data-slot": "input",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm', 'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]', 'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/input.tsx",
        lineNumber: 7,
        columnNumber: 5
    }, this);
}
_c = Input;
;
var _c;
__turbopack_context__.k.register(_c, "Input");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ui/label.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Label",
    ()=>Label
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$label$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-label/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-client] (ecmascript)");
'use client';
;
;
;
function Label({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$label$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Root"], {
        "data-slot": "label",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/label.tsx",
        lineNumber: 13,
        columnNumber: 5
    }, this);
}
_c = Label;
;
var _c;
__turbopack_context__.k.register(_c, "Label");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/game-setup-modal.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GameSetupModal",
    ()=>GameSetupModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/dialog.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/input.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/label.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$crown$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Crown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/crown.js [app-client] (ecmascript) <export default as Crown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$play$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Play$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/play.js [app-client] (ecmascript) <export default as Play>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
const ELO_PRESETS = [
    {
        value: 400,
        label: "Complete Beginner",
        description: "Just learning the rules"
    },
    {
        value: 800,
        label: "Casual Player",
        description: "Know basics, play occasionally"
    },
    {
        value: 1000,
        label: "Club Player",
        description: "Regular player, understand tactics"
    },
    {
        value: 1200,
        label: "Intermediate",
        description: "Solid fundamentals"
    },
    {
        value: 1500,
        label: "Advanced",
        description: "Strong tactical and positional play"
    },
    {
        value: 1800,
        label: "Expert",
        description: "Tournament level player"
    },
    {
        value: 2000,
        label: "Master",
        description: "Highly skilled player"
    }
];
function GameSetupModal({ open, onStartGame, onClose, isFirstGame, currentElo }) {
    _s();
    const [selectedColor, setSelectedColor] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("w");
    const [eloInput, setEloInput] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(isFirstGame ? "1000" : currentElo.toString());
    const [selectedPreset, setSelectedPreset] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(isFirstGame ? 1000 : null);
    const handlePresetClick = (value)=>{
        setSelectedPreset(value);
        setEloInput(value.toString());
    };
    const handleStart = ()=>{
        const elo = Math.max(100, Math.min(3000, Number.parseInt(eloInput) || 1000));
        onStartGame(selectedColor, elo);
    };
    const handleClose = ()=>{
        if (!isFirstGame && onClose) {
            onClose();
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Dialog"], {
        open: open,
        onOpenChange: (isOpen)=>!isOpen && handleClose(),
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DialogContent"], {
            className: "sm:max-w-lg bg-card border-border",
            showCloseButton: !isFirstGame,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DialogHeader"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DialogTitle"], {
                            className: "flex items-center gap-2 text-xl",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$crown$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Crown$3e$__["Crown"], {
                                    className: "w-5 h-5 text-primary"
                                }, void 0, false, {
                                    fileName: "[project]/components/game-setup-modal.tsx",
                                    lineNumber: 55,
                                    columnNumber: 13
                                }, this),
                                isFirstGame ? "Welcome to ChessMind AI!" : "New Game Setup"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/game-setup-modal.tsx",
                            lineNumber: 54,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DialogDescription"], {
                            children: isFirstGame ? "Set up your profile to get started with adaptive AI training." : "Configure your next game against the adaptive AI."
                        }, void 0, false, {
                            fileName: "[project]/components/game-setup-modal.tsx",
                            lineNumber: 58,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/game-setup-modal.tsx",
                    lineNumber: 53,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "space-y-6 py-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "space-y-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                    className: "text-base font-semibold",
                                    children: "Choose Your Color"
                                }, void 0, false, {
                                    fileName: "[project]/components/game-setup-modal.tsx",
                                    lineNumber: 68,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid grid-cols-2 gap-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            onClick: ()=>setSelectedColor("w"),
                                            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2", selectedColor === "w" ? "border-primary bg-primary/10" : "border-border hover:border-primary/50 bg-secondary/30"),
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "w-12 h-12 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center text-3xl shadow-md",
                                                    children: "♔"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/game-setup-modal.tsx",
                                                    lineNumber: 80,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "font-medium text-foreground",
                                                    children: "Play as White"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/game-setup-modal.tsx",
                                                    lineNumber: 83,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-xs text-muted-foreground",
                                                    children: "Move first"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/game-setup-modal.tsx",
                                                    lineNumber: 84,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/game-setup-modal.tsx",
                                            lineNumber: 70,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            onClick: ()=>setSelectedColor("b"),
                                            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2", selectedColor === "b" ? "border-primary bg-primary/10" : "border-border hover:border-primary/50 bg-secondary/30"),
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "w-12 h-12 rounded-full bg-gray-900 border-2 border-gray-700 flex items-center justify-center text-3xl shadow-md",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-white",
                                                        children: "♚"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/game-setup-modal.tsx",
                                                        lineNumber: 97,
                                                        columnNumber: 19
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/components/game-setup-modal.tsx",
                                                    lineNumber: 96,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "font-medium text-foreground",
                                                    children: "Play as Black"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/game-setup-modal.tsx",
                                                    lineNumber: 99,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-xs text-muted-foreground",
                                                    children: "Respond to White"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/game-setup-modal.tsx",
                                                    lineNumber: 100,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/game-setup-modal.tsx",
                                            lineNumber: 86,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/game-setup-modal.tsx",
                                    lineNumber: 69,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/game-setup-modal.tsx",
                            lineNumber: 67,
                            columnNumber: 11
                        }, this),
                        isFirstGame && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "space-y-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                    className: "text-base font-semibold",
                                    children: "What's Your Skill Level?"
                                }, void 0, false, {
                                    fileName: "[project]/components/game-setup-modal.tsx",
                                    lineNumber: 108,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm text-muted-foreground",
                                    children: "Select your approximate ELO rating. The AI will adapt to your skill level."
                                }, void 0, false, {
                                    fileName: "[project]/components/game-setup-modal.tsx",
                                    lineNumber: 109,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto pr-1",
                                    children: ELO_PRESETS.map((preset)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            onClick: ()=>handlePresetClick(preset.value),
                                            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("p-3 rounded-lg border text-left transition-all", selectedPreset === preset.value ? "border-primary bg-primary/10" : "border-border hover:border-primary/50 bg-secondary/30"),
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex justify-between items-center",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "font-medium text-sm text-foreground",
                                                            children: preset.label
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/game-setup-modal.tsx",
                                                            lineNumber: 127,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-xs font-mono text-primary",
                                                            children: preset.value
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/game-setup-modal.tsx",
                                                            lineNumber: 128,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/game-setup-modal.tsx",
                                                    lineNumber: 126,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-xs text-muted-foreground mt-1",
                                                    children: preset.description
                                                }, void 0, false, {
                                                    fileName: "[project]/components/game-setup-modal.tsx",
                                                    lineNumber: 130,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, preset.value, true, {
                                            fileName: "[project]/components/game-setup-modal.tsx",
                                            lineNumber: 115,
                                            columnNumber: 19
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/components/game-setup-modal.tsx",
                                    lineNumber: 113,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-3 pt-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                            htmlFor: "custom-elo",
                                            className: "text-sm whitespace-nowrap",
                                            children: "Or enter custom ELO:"
                                        }, void 0, false, {
                                            fileName: "[project]/components/game-setup-modal.tsx",
                                            lineNumber: 136,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                            id: "custom-elo",
                                            type: "number",
                                            min: 100,
                                            max: 3000,
                                            value: eloInput,
                                            onChange: (e)=>{
                                                setEloInput(e.target.value);
                                                setSelectedPreset(null);
                                            },
                                            className: "w-24 font-mono"
                                        }, void 0, false, {
                                            fileName: "[project]/components/game-setup-modal.tsx",
                                            lineNumber: 139,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/game-setup-modal.tsx",
                                    lineNumber: 135,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/game-setup-modal.tsx",
                            lineNumber: 107,
                            columnNumber: 13
                        }, this),
                        !isFirstGame && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "p-4 rounded-lg bg-secondary/50 border border-border",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex justify-between items-center",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-sm text-muted-foreground",
                                            children: "Your Current ELO"
                                        }, void 0, false, {
                                            fileName: "[project]/components/game-setup-modal.tsx",
                                            lineNumber: 159,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-2xl font-bold font-mono text-primary",
                                            children: currentElo
                                        }, void 0, false, {
                                            fileName: "[project]/components/game-setup-modal.tsx",
                                            lineNumber: 160,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/game-setup-modal.tsx",
                                    lineNumber: 158,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-xs text-muted-foreground mt-2",
                                    children: "The AI will match your skill level and adapt as you play."
                                }, void 0, false, {
                                    fileName: "[project]/components/game-setup-modal.tsx",
                                    lineNumber: 162,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/game-setup-modal.tsx",
                            lineNumber: 157,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                            onClick: handleStart,
                            className: "w-full",
                            size: "lg",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$play$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Play$3e$__["Play"], {
                                    className: "w-4 h-4 mr-2"
                                }, void 0, false, {
                                    fileName: "[project]/components/game-setup-modal.tsx",
                                    lineNumber: 169,
                                    columnNumber: 13
                                }, this),
                                "Start Game"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/game-setup-modal.tsx",
                            lineNumber: 168,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/game-setup-modal.tsx",
                    lineNumber: 65,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/game-setup-modal.tsx",
            lineNumber: 52,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/game-setup-modal.tsx",
        lineNumber: 51,
        columnNumber: 5
    }, this);
}
_s(GameSetupModal, "dIKaP53Ceut2jgMIrIKXzQqjUdg=");
_c = GameSetupModal;
var _c;
__turbopack_context__.k.register(_c, "GameSetupModal");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/stockfish-eval.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "STOCKFISH_LEVELS",
    ()=>STOCKFISH_LEVELS,
    "STOCKFISH_THRESHOLDS",
    ()=>STOCKFISH_THRESHOLDS,
    "calculateAccuracy",
    ()=>calculateAccuracy,
    "calculateEloChange",
    ()=>calculateEloChange,
    "eloToDifficulty",
    ()=>eloToDifficulty,
    "getAIOpponentElo",
    ()=>getAIOpponentElo,
    "getAdaptiveDifficulty",
    ()=>getAdaptiveDifficulty,
    "getEvaluationBarValue",
    ()=>getEvaluationBarValue,
    "getEvaluationDescription",
    ()=>getEvaluationDescription,
    "getMoveGrade",
    ()=>getMoveGrade
]);
const STOCKFISH_THRESHOLDS = {
    BRILLIANT: -200,
    EXCELLENT: -50,
    GOOD: 0,
    INACCURACY: 50,
    MISTAKE: 150,
    BLUNDER: 300
};
const STOCKFISH_LEVELS = {
    1: {
        elo: 400,
        depth: 1,
        errorRate: 0.4,
        blunderRate: 0.15,
        skillLevel: 0
    },
    2: {
        elo: 600,
        depth: 2,
        errorRate: 0.35,
        blunderRate: 0.12,
        skillLevel: 2
    },
    3: {
        elo: 800,
        depth: 3,
        errorRate: 0.3,
        blunderRate: 0.1,
        skillLevel: 4
    },
    4: {
        elo: 1000,
        depth: 4,
        errorRate: 0.25,
        blunderRate: 0.08,
        skillLevel: 6
    },
    5: {
        elo: 1200,
        depth: 5,
        errorRate: 0.2,
        blunderRate: 0.06,
        skillLevel: 8
    },
    6: {
        elo: 1400,
        depth: 6,
        errorRate: 0.15,
        blunderRate: 0.04,
        skillLevel: 10
    },
    7: {
        elo: 1600,
        depth: 8,
        errorRate: 0.1,
        blunderRate: 0.02,
        skillLevel: 12
    },
    8: {
        elo: 1800,
        depth: 10,
        errorRate: 0.05,
        blunderRate: 0.01,
        skillLevel: 15
    },
    9: {
        elo: 2000,
        depth: 12,
        errorRate: 0.02,
        blunderRate: 0.005,
        skillLevel: 18
    },
    10: {
        elo: 2200,
        depth: 15,
        errorRate: 0.01,
        blunderRate: 0.002,
        skillLevel: 20
    }
};
function eloToDifficulty(playerElo) {
    if (playerElo <= 500) return 1;
    if (playerElo <= 700) return 2;
    if (playerElo <= 900) return 3;
    if (playerElo <= 1100) return 4;
    if (playerElo <= 1300) return 5;
    if (playerElo <= 1500) return 6;
    if (playerElo <= 1700) return 7;
    if (playerElo <= 1900) return 8;
    if (playerElo <= 2100) return 9;
    return 10;
}
function calculateEloChange(playerElo, opponentElo, result) {
    // K-factor based on rating
    const K = playerElo < 1000 ? 40 : playerElo < 1400 ? 32 : playerElo < 2000 ? 24 : 16;
    // Expected score
    const expectedScore = 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400));
    // Actual score
    const actualScore = result === "win" ? 1 : result === "draw" ? 0.5 : 0;
    // ELO change
    return Math.round(K * (actualScore - expectedScore));
}
function calculateAccuracy(evaluations) {
    if (evaluations.length === 0) return 100;
    let totalAccuracy = 0;
    for (const eval_ of evaluations){
        switch(eval_.type){
            case "brilliant":
                totalAccuracy += 100;
                break;
            case "excellent":
                totalAccuracy += 95;
                break;
            case "good":
                totalAccuracy += 85;
                break;
            case "inaccuracy":
                totalAccuracy += 65;
                break;
            case "mistake":
                totalAccuracy += 40;
                break;
            case "blunder":
                totalAccuracy += 15;
                break;
        }
    }
    return Math.round(totalAccuracy / evaluations.length);
}
function getMoveGrade(centipawnLoss) {
    if (centipawnLoss <= STOCKFISH_THRESHOLDS.BRILLIANT) return "brilliant";
    if (centipawnLoss <= STOCKFISH_THRESHOLDS.EXCELLENT) return "excellent";
    if (centipawnLoss <= STOCKFISH_THRESHOLDS.GOOD) return "good";
    if (centipawnLoss <= STOCKFISH_THRESHOLDS.INACCURACY) return "inaccuracy";
    if (centipawnLoss <= STOCKFISH_THRESHOLDS.MISTAKE) return "mistake";
    return "blunder";
}
function getAdaptiveDifficulty(baseDifficulty, stats, gameEvaluations) {
    let adjustment = 0;
    // Recent game accuracy adjustment
    const recentAccuracy = calculateAccuracy(gameEvaluations);
    if (recentAccuracy > 85 && gameEvaluations.length >= 5) {
        adjustment += 1; // Player is doing very well
    } else if (recentAccuracy < 50 && gameEvaluations.length >= 5) {
        adjustment -= 1; // Player is struggling
    }
    // Win streak adjustment
    if (stats.currentStreak >= 3) {
        adjustment += 1;
    } else if (stats.currentStreak <= -3) {
        adjustment -= 1;
    }
    // Blunder rate adjustment
    const blunderRate = gameEvaluations.length > 0 ? gameEvaluations.filter((e)=>e.type === "blunder").length / gameEvaluations.length : 0;
    if (blunderRate > 0.2 && gameEvaluations.length >= 5) {
        adjustment -= 1; // Too many blunders, ease up
    }
    // Clamp to valid range
    return Math.max(1, Math.min(10, baseDifficulty + adjustment));
}
function getAIOpponentElo(difficulty, adaptiveBonus = 0) {
    const baseElo = STOCKFISH_LEVELS[difficulty]?.elo || 1000;
    return baseElo + adaptiveBonus;
}
function getEvaluationBarValue(centipawns) {
    // Use a sigmoid-like function to map centipawns to -1 to 1 range
    const maxAdvantage = 1000 // 10 pawns = fully winning
    ;
    return Math.tanh(centipawns / maxAdvantage);
}
function getEvaluationDescription(centipawns) {
    const pawns = centipawns / 100;
    if (Math.abs(pawns) < 0.3) return "Equal position";
    if (Math.abs(pawns) < 1) return `Slight ${pawns > 0 ? "white" : "black"} advantage`;
    if (Math.abs(pawns) < 2) return `${pawns > 0 ? "White" : "Black"} is better`;
    if (Math.abs(pawns) < 5) return `${pawns > 0 ? "White" : "Black"} has a winning advantage`;
    return `${pawns > 0 ? "White" : "Black"} is winning`;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/evaluation-bar.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "EvaluationBar",
    ()=>EvaluationBar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$stockfish$2d$eval$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/stockfish-eval.ts [app-client] (ecmascript)");
"use client";
;
;
;
function EvaluationBar({ evaluation, playerColor }) {
    const barValue = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$stockfish$2d$eval$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getEvaluationBarValue"])(evaluation);
    const percentage = (barValue + 1) / 2 * 100;
    const displayPercentage = playerColor === "b" ? 100 - percentage : percentage;
    const displayEval = Math.abs(evaluation / 100).toFixed(1);
    const isWhiteAdvantage = evaluation > 0;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col items-center gap-1 h-full w-full",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("text-[10px] font-mono font-bold px-1 py-0.5 rounded", isWhiteAdvantage ? "bg-eval-white text-background" : "bg-eval-black text-foreground"),
                children: [
                    isWhiteAdvantage ? "+" : "-",
                    displayEval
                ]
            }, void 0, true, {
                fileName: "[project]/components/evaluation-bar.tsx",
                lineNumber: 21,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative w-full flex-1 bg-eval-black rounded overflow-hidden border border-board-border",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute inset-x-0 bottom-0 bg-eval-white transition-all duration-300 ease-out",
                        style: {
                            height: `${displayPercentage}%`
                        }
                    }, void 0, false, {
                        fileName: "[project]/components/evaluation-bar.tsx",
                        lineNumber: 32,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute inset-x-0 top-1/2 h-px bg-primary/60 -translate-y-1/2"
                    }, void 0, false, {
                        fileName: "[project]/components/evaluation-bar.tsx",
                        lineNumber: 36,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/evaluation-bar.tsx",
                lineNumber: 31,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/evaluation-bar.tsx",
        lineNumber: 20,
        columnNumber: 5
    }, this);
}
_c = EvaluationBar;
var _c;
__turbopack_context__.k.register(_c, "EvaluationBar");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/game-controls.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GameControls",
    ()=>GameControls
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/card.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
function GameControls({ onUndo, onRedo, onCopyPGN, onNewGame, canUndo, canRedo, gameStarted }) {
    _s();
    const [copied, setCopied] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const handleCopy = ()=>{
        onCopyPGN();
        setCopied(true);
        setTimeout(()=>setCopied(false), 2000);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
        className: "bg-card border-border",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
            className: "p-1.5",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-1",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                        variant: "ghost",
                        size: "sm",
                        onClick: onUndo,
                        disabled: !canUndo,
                        className: "h-7 px-2 text-[11px] flex-1",
                        children: "Undo"
                    }, void 0, false, {
                        fileName: "[project]/components/game-controls.tsx",
                        lineNumber: 38,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                        variant: "ghost",
                        size: "sm",
                        onClick: onRedo,
                        disabled: !canRedo,
                        className: "h-7 px-2 text-[11px] flex-1",
                        children: "Redo"
                    }, void 0, false, {
                        fileName: "[project]/components/game-controls.tsx",
                        lineNumber: 47,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                        variant: "ghost",
                        size: "sm",
                        onClick: handleCopy,
                        disabled: !gameStarted,
                        className: "h-7 px-2 text-[11px] flex-1",
                        children: copied ? "Copied!" : "PGN"
                    }, void 0, false, {
                        fileName: "[project]/components/game-controls.tsx",
                        lineNumber: 56,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                        variant: "outline",
                        size: "sm",
                        onClick: onNewGame,
                        className: "h-7 px-2 text-[11px] flex-1 bg-transparent",
                        children: "New"
                    }, void 0, false, {
                        fileName: "[project]/components/game-controls.tsx",
                        lineNumber: 65,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/game-controls.tsx",
                lineNumber: 37,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/components/game-controls.tsx",
            lineNumber: 36,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/game-controls.tsx",
        lineNumber: 35,
        columnNumber: 5
    }, this);
}
_s(GameControls, "NE86rL3vg4NVcTTWDavsT0hUBJs=");
_c = GameControls;
var _c;
__turbopack_context__.k.register(_c, "GameControls");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/blunder-alert.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BlunderAlert",
    ()=>BlunderAlert
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/dialog.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/triangle-alert.js [app-client] (ecmascript) <export default as AlertTriangle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$undo$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Undo2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/undo-2.js [app-client] (ecmascript) <export default as Undo2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-right.js [app-client] (ecmascript) <export default as ArrowRight>");
"use client";
;
;
;
;
function BlunderAlert({ open, evaluation, onUndo, onDismiss }) {
    if (!evaluation) return null;
    const isBlunder = evaluation.type === "blunder";
    const isMistake = evaluation.type === "mistake";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Dialog"], {
        open: open,
        onOpenChange: (isOpen)=>!isOpen && onDismiss(),
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DialogContent"], {
            className: "sm:max-w-md bg-card border-border",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DialogHeader"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DialogTitle"], {
                            className: "flex items-center gap-2 text-xl",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__["AlertTriangle"], {
                                    className: isBlunder ? "text-red-500" : "text-orange-500"
                                }, void 0, false, {
                                    fileName: "[project]/components/blunder-alert.tsx",
                                    lineNumber: 37,
                                    columnNumber: 13
                                }, this),
                                isBlunder ? "Blunder Detected!" : "Mistake Detected!"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/blunder-alert.tsx",
                            lineNumber: 36,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DialogDescription"], {
                            children: isBlunder ? "You made a significant error. Let's learn from it!" : "That wasn't the best move. Here's what you could do better."
                        }, void 0, false, {
                            fileName: "[project]/components/blunder-alert.tsx",
                            lineNumber: 42,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/blunder-alert.tsx",
                    lineNumber: 35,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "space-y-4 py-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "p-4 rounded-lg bg-secondary/50 border border-border",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-2 mb-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-sm font-medium text-muted-foreground",
                                            children: "Your move:"
                                        }, void 0, false, {
                                            fileName: "[project]/components/blunder-alert.tsx",
                                            lineNumber: 52,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "font-mono font-bold",
                                            children: [
                                                evaluation.from,
                                                " → ",
                                                evaluation.to
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/blunder-alert.tsx",
                                            lineNumber: 55,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/blunder-alert.tsx",
                                    lineNumber: 51,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-sm text-red-400",
                                    children: [
                                        "Centipawn loss: ",
                                        evaluation.centipawnLoss,
                                        "cp"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/blunder-alert.tsx",
                                    lineNumber: 59,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/blunder-alert.tsx",
                            lineNumber: 50,
                            columnNumber: 11
                        }, this),
                        evaluation.bestMove && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "p-4 rounded-lg bg-green-500/10 border border-green-500/30",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-2 mb-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight$3e$__["ArrowRight"], {
                                            className: "w-4 h-4 text-green-500"
                                        }, void 0, false, {
                                            fileName: "[project]/components/blunder-alert.tsx",
                                            lineNumber: 67,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-sm font-medium text-green-400",
                                            children: "Best move was:"
                                        }, void 0, false, {
                                            fileName: "[project]/components/blunder-alert.tsx",
                                            lineNumber: 68,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/blunder-alert.tsx",
                                    lineNumber: 66,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "font-mono font-bold text-green-400 text-lg",
                                    children: [
                                        evaluation.bestMove.from,
                                        " → ",
                                        evaluation.bestMove.to
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/blunder-alert.tsx",
                                    lineNumber: 72,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-xs text-muted-foreground mt-2",
                                    children: "Try this move to practice finding the best continuation."
                                }, void 0, false, {
                                    fileName: "[project]/components/blunder-alert.tsx",
                                    lineNumber: 75,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/blunder-alert.tsx",
                            lineNumber: 65,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex gap-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                    onClick: onUndo,
                                    className: "flex-1",
                                    variant: "default",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$undo$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Undo2$3e$__["Undo2"], {
                                            className: "w-4 h-4 mr-2"
                                        }, void 0, false, {
                                            fileName: "[project]/components/blunder-alert.tsx",
                                            lineNumber: 83,
                                            columnNumber: 15
                                        }, this),
                                        "Undo & Try Again"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/blunder-alert.tsx",
                                    lineNumber: 82,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                    onClick: onDismiss,
                                    variant: "outline",
                                    className: "flex-1 bg-transparent",
                                    children: "Continue Anyway"
                                }, void 0, false, {
                                    fileName: "[project]/components/blunder-alert.tsx",
                                    lineNumber: 86,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/blunder-alert.tsx",
                            lineNumber: 81,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/blunder-alert.tsx",
                    lineNumber: 49,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/blunder-alert.tsx",
            lineNumber: 34,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/blunder-alert.tsx",
        lineNumber: 33,
        columnNumber: 5
    }, this);
}
_c = BlunderAlert;
var _c;
__turbopack_context__.k.register(_c, "BlunderAlert");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/adaptive-ai.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createDefaultStats",
    ()=>createDefaultStats,
    "evaluatePlayerMove",
    ()=>evaluatePlayerMove,
    "evaluatePosition",
    ()=>evaluatePosition,
    "generateMoveHint",
    ()=>generateMoveHint,
    "getAIMove",
    ()=>getAIMove,
    "getAIMoveAsync",
    ()=>getAIMoveAsync,
    "updateStatsAfterGame",
    ()=>updateStatsAfterGame,
    "updateStatsAfterMove",
    ()=>updateStatsAfterMove
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$chess$2d$engine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/chess-engine.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$stockfish$2d$eval$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/stockfish-eval.ts [app-client] (ecmascript)");
;
;
const PIECE_VALUES = {
    p: 100,
    n: 320,
    b: 330,
    r: 500,
    q: 900,
    k: 20000
};
const PAWN_TABLE = [
    [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0
    ],
    [
        50,
        50,
        50,
        50,
        50,
        50,
        50,
        50
    ],
    [
        10,
        10,
        20,
        30,
        30,
        20,
        10,
        10
    ],
    [
        5,
        5,
        10,
        25,
        25,
        10,
        5,
        5
    ],
    [
        0,
        0,
        0,
        20,
        20,
        0,
        0,
        0
    ],
    [
        5,
        -5,
        -10,
        0,
        0,
        -10,
        -5,
        5
    ],
    [
        5,
        10,
        10,
        -20,
        -20,
        10,
        10,
        5
    ],
    [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0
    ]
];
const KNIGHT_TABLE = [
    [
        -50,
        -40,
        -30,
        -30,
        -30,
        -30,
        -40,
        -50
    ],
    [
        -40,
        -20,
        0,
        0,
        0,
        0,
        -20,
        -40
    ],
    [
        -30,
        0,
        10,
        15,
        15,
        10,
        0,
        -30
    ],
    [
        -30,
        5,
        15,
        20,
        20,
        15,
        5,
        -30
    ],
    [
        -30,
        0,
        15,
        20,
        20,
        15,
        0,
        -30
    ],
    [
        -30,
        5,
        10,
        15,
        15,
        10,
        5,
        -30
    ],
    [
        -40,
        -20,
        0,
        5,
        5,
        0,
        -20,
        -40
    ],
    [
        -50,
        -40,
        -30,
        -30,
        -30,
        -30,
        -40,
        -50
    ]
];
const BISHOP_TABLE = [
    [
        -20,
        -10,
        -10,
        -10,
        -10,
        -10,
        -10,
        -20
    ],
    [
        -10,
        0,
        0,
        0,
        0,
        0,
        0,
        -10
    ],
    [
        -10,
        0,
        5,
        10,
        10,
        5,
        0,
        -10
    ],
    [
        -10,
        5,
        5,
        10,
        10,
        5,
        5,
        -10
    ],
    [
        -10,
        0,
        10,
        10,
        10,
        10,
        0,
        -10
    ],
    [
        -10,
        10,
        10,
        10,
        10,
        10,
        10,
        -10
    ],
    [
        -10,
        5,
        0,
        0,
        0,
        0,
        5,
        -10
    ],
    [
        -20,
        -10,
        -10,
        -10,
        -10,
        -10,
        -10,
        -20
    ]
];
const ROOK_TABLE = [
    [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0
    ],
    [
        5,
        10,
        10,
        10,
        10,
        10,
        10,
        5
    ],
    [
        -5,
        0,
        0,
        0,
        0,
        0,
        0,
        -5
    ],
    [
        -5,
        0,
        0,
        0,
        0,
        0,
        0,
        -5
    ],
    [
        -5,
        0,
        0,
        0,
        0,
        0,
        0,
        -5
    ],
    [
        -5,
        0,
        0,
        0,
        0,
        0,
        0,
        -5
    ],
    [
        -5,
        0,
        0,
        0,
        0,
        0,
        0,
        -5
    ],
    [
        0,
        0,
        0,
        5,
        5,
        0,
        0,
        0
    ]
];
const KING_TABLE = [
    [
        -30,
        -40,
        -40,
        -50,
        -50,
        -40,
        -40,
        -30
    ],
    [
        -30,
        -40,
        -40,
        -50,
        -50,
        -40,
        -40,
        -30
    ],
    [
        -30,
        -40,
        -40,
        -50,
        -50,
        -40,
        -40,
        -30
    ],
    [
        -30,
        -40,
        -40,
        -50,
        -50,
        -40,
        -40,
        -30
    ],
    [
        -20,
        -30,
        -30,
        -40,
        -40,
        -30,
        -30,
        -20
    ],
    [
        -10,
        -20,
        -20,
        -20,
        -20,
        -20,
        -20,
        -10
    ],
    [
        20,
        20,
        0,
        0,
        0,
        0,
        20,
        20
    ],
    [
        20,
        30,
        10,
        0,
        0,
        10,
        30,
        20
    ]
];
function getPieceSquareValue(piece, row, col) {
    if (!piece) return 0;
    const isWhite = piece.color === "w";
    const r = isWhite ? row : 7 - row;
    let table;
    switch(piece.type){
        case "p":
            table = PAWN_TABLE;
            break;
        case "n":
            table = KNIGHT_TABLE;
            break;
        case "b":
            table = BISHOP_TABLE;
            break;
        case "r":
            table = ROOK_TABLE;
            break;
        case "q":
            table = BISHOP_TABLE;
            break;
        case "k":
            table = KING_TABLE;
            break;
        default:
            return 0;
    }
    return table[r][col];
}
function evaluatePosition(state) {
    let score = 0;
    for(let row = 0; row < 8; row++){
        for(let col = 0; col < 8; col++){
            const piece = state.board[row][col];
            if (piece) {
                const value = PIECE_VALUES[piece.type] + getPieceSquareValue(piece, row, col);
                score += piece.color === "w" ? value : -value;
            }
        }
    }
    if (state.isCheckmate) {
        score = state.turn === "w" ? -99999 : 99999;
    }
    return score;
}
function minimax(state, depth, alpha, beta, maximizing, noiseLevel, nodeCount, maxNodes) {
    nodeCount.count++;
    if (nodeCount.count > maxNodes) {
        return evaluatePosition(state);
    }
    if (depth === 0 || state.isCheckmate || state.isStalemate || state.isDraw) {
        const eval_ = evaluatePosition(state);
        const noise = (Math.random() - 0.5) * noiseLevel * 100;
        return eval_ + noise;
    }
    const moves = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$chess$2d$engine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getAllLegalMoves"])(state);
    const maxMoves = Math.min(moves.length, depth > 1 ? 10 : 20);
    const limitedMoves = moves.slice(0, maxMoves);
    if (maximizing) {
        let maxEval = Number.NEGATIVE_INFINITY;
        for (const { from, to } of limitedMoves){
            const newState = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$chess$2d$engine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["makeMove"])(state, from, to);
            if (newState) {
                const eval_ = minimax(newState, depth - 1, alpha, beta, false, noiseLevel, nodeCount, maxNodes);
                maxEval = Math.max(maxEval, eval_);
                alpha = Math.max(alpha, eval_);
                if (beta <= alpha) break;
            }
        }
        return maxEval;
    } else {
        let minEval = Number.POSITIVE_INFINITY;
        for (const { from, to } of limitedMoves){
            const newState = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$chess$2d$engine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["makeMove"])(state, from, to);
            if (newState) {
                const eval_ = minimax(newState, depth - 1, alpha, beta, true, noiseLevel, nodeCount, maxNodes);
                minEval = Math.min(minEval, eval_);
                beta = Math.min(beta, eval_);
                if (beta <= alpha) break;
            }
        }
        return minEval;
    }
}
async function getAIMoveAsync(state, difficulty, playerStats) {
    return new Promise((resolve)=>{
        // Use setTimeout to allow UI to update
        setTimeout(()=>{
            const result = getAIMove(state, difficulty, playerStats);
            resolve(result);
        }, 10);
    });
}
function getAIMove(state, difficulty, playerStats) {
    const moves = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$chess$2d$engine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getAllLegalMoves"])(state);
    if (moves.length === 0) return null;
    const levelParams = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$stockfish$2d$eval$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["STOCKFISH_LEVELS"][difficulty];
    const depth = Math.min(levelParams.depth + 1, 4); // Increased depth for Stockfish 17
    const { errorRate, blunderRate } = levelParams;
    const noiseLevel = Math.max(0, (10 - difficulty) / 5);
    // Occasionally make a random move (blunder)
    if (Math.random() < blunderRate) {
        return moves[Math.floor(Math.random() * moves.length)];
    }
    const maxNodes = 8000;
    const nodeCount = {
        count: 0
    };
    const scoredMoves = [];
    for (const move of moves){
        if (nodeCount.count > maxNodes) break;
        const newState = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$chess$2d$engine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["makeMove"])(state, move.from, move.to);
        if (newState) {
            const score = minimax(newState, depth - 1, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, state.turn === "b", noiseLevel, nodeCount, maxNodes);
            scoredMoves.push({
                move,
                score
            });
        }
    }
    scoredMoves.sort((a, b)=>state.turn === "w" ? b.score - a.score : a.score - b.score);
    // At lower difficulties, sometimes pick a suboptimal move
    if (Math.random() < errorRate && scoredMoves.length > 1) {
        const poolSize = Math.min(5, scoredMoves.length);
        const index = Math.floor(Math.random() * poolSize);
        return scoredMoves[index].move;
    }
    return scoredMoves[0]?.move || moves[0];
}
function evaluatePlayerMove(stateBefore, from, to) {
    const moves = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$chess$2d$engine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getAllLegalMoves"])(stateBefore);
    const maxNodes = 4000;
    const nodeCount = {
        count: 0
    };
    const scoredMoves = [];
    for (const move of moves){
        if (nodeCount.count > maxNodes) break;
        const newState = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$chess$2d$engine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["makeMove"])(stateBefore, move.from, move.to);
        if (newState) {
            const score = minimax(newState, 2, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, stateBefore.turn === "b", 0, nodeCount, maxNodes);
            scoredMoves.push({
                from: move.from,
                to: move.to,
                score
            });
        }
    }
    scoredMoves.sort((a, b)=>stateBefore.turn === "w" ? b.score - a.score : a.score - b.score);
    const bestMove = scoredMoves[0];
    const playerMove = scoredMoves.find((m)=>m.from === from && m.to === to);
    if (!bestMove || !playerMove) {
        return {
            from,
            to,
            score: 0,
            type: "good",
            centipawnLoss: 0
        };
    }
    const centipawnLoss = stateBefore.turn === "w" ? bestMove.score - playerMove.score : playerMove.score - bestMove.score;
    const type = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$stockfish$2d$eval$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getMoveGrade"])(centipawnLoss);
    return {
        from,
        to,
        score: playerMove.score,
        type,
        centipawnLoss,
        bestMove: centipawnLoss > __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$stockfish$2d$eval$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["STOCKFISH_THRESHOLDS"].GOOD ? {
            from: bestMove.from,
            to: bestMove.to,
            score: bestMove.score
        } : undefined
    };
}
function createDefaultStats(initialElo = 1000) {
    return {
        gamesPlayed: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        blunders: 0,
        mistakes: 0,
        inaccuracies: 0,
        goodMoves: 0,
        excellentMoves: 0,
        brilliantMoves: 0,
        averageAccuracy: 70,
        currentStreak: 0,
        skillRating: initialElo,
        tacticsScore: 50,
        positionScore: 50,
        endgameScore: 50,
        totalCentipawnLoss: 0,
        totalMovesAnalyzed: 0
    };
}
function updateStatsAfterMove(stats, evaluation) {
    const newStats = {
        ...stats
    };
    switch(evaluation.type){
        case "blunder":
            newStats.blunders++;
            break;
        case "mistake":
            newStats.mistakes++;
            break;
        case "inaccuracy":
            newStats.inaccuracies++;
            break;
        case "good":
            newStats.goodMoves++;
            break;
        case "excellent":
            newStats.excellentMoves++;
            break;
        case "brilliant":
            newStats.brilliantMoves++;
            break;
    }
    newStats.totalCentipawnLoss += Math.max(0, evaluation.centipawnLoss);
    newStats.totalMovesAnalyzed++;
    const avgCentipawnLoss = newStats.totalCentipawnLoss / newStats.totalMovesAnalyzed;
    newStats.averageAccuracy = Math.round(Math.max(50, 100 - avgCentipawnLoss / 3));
    return newStats;
}
function updateStatsAfterGame(stats, result, aiDifficulty) {
    const newStats = {
        ...stats
    };
    newStats.gamesPlayed++;
    const aiElo = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$stockfish$2d$eval$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["STOCKFISH_LEVELS"][aiDifficulty]?.elo || 1000;
    const eloChange = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$stockfish$2d$eval$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculateEloChange"])(stats.skillRating, aiElo, result);
    switch(result){
        case "win":
            newStats.wins++;
            newStats.currentStreak = Math.max(0, newStats.currentStreak) + 1;
            break;
        case "loss":
            newStats.losses++;
            newStats.currentStreak = Math.min(0, newStats.currentStreak) - 1;
            break;
        case "draw":
            newStats.draws++;
            newStats.currentStreak = 0;
            break;
    }
    newStats.skillRating = Math.max(100, newStats.skillRating + eloChange);
    return newStats;
}
function generateMoveHint(evaluation) {
    const cpLoss = evaluation.centipawnLoss;
    if (evaluation.type === "brilliant") return "Brilliant! You found an exceptional move!";
    if (evaluation.type === "excellent") return "Excellent move! Nearly perfect play.";
    if (evaluation.type === "good") return "Good move. Solid continuation.";
    if (evaluation.type === "inaccuracy") {
        return `Inaccuracy (${cpLoss} cp lost). ${evaluation.bestMove ? `Best was ${evaluation.bestMove.from}-${evaluation.bestMove.to}` : ""}`;
    }
    if (evaluation.type === "mistake") {
        return `Mistake (${cpLoss} cp lost). ${evaluation.bestMove ? `${evaluation.bestMove.from}-${evaluation.bestMove.to} was stronger.` : ""}`;
    }
    if (evaluation.type === "blunder") {
        return `Blunder! (${cpLoss} cp lost). ${evaluation.bestMove ? `You missed ${evaluation.bestMove.from}-${evaluation.bestMove.to}.` : ""}`;
    }
    return "";
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/supabase/client.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createClient",
    ()=>createClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/ssr/dist/module/index.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createBrowserClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@supabase/ssr/dist/module/createBrowserClient.js [app-client] (ecmascript)");
;
function createClient() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createBrowserClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createBrowserClient"])(("TURBOPACK compile-time value", "https://swgcxinfcchvebrprhvs.supabase.co"), ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3Z2N4aW5mY2NodmVicnByaHZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1NzQ2NDAsImV4cCI6MjA4MDE1MDY0MH0.1gpgnKUUhJ17Xem297hhUZgqxLe_0utknA3QQw5WEWw"));
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/chess-game.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ChessGame",
    ()=>ChessGame
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
//import { Icon } from "@iconify/react";
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$chess$2d$board$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/chess-board.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$move$2d$history$2d$panel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/move-history-panel.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ai$2d$feedback$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ai-feedback.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$game$2d$setup$2d$modal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/game-setup-modal.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$evaluation$2d$bar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/evaluation-bar.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$game$2d$controls$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/game-controls.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$blunder$2d$alert$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/blunder-alert.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$chess$2d$engine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/chess-engine.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$adaptive$2d$ai$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/adaptive-ai.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$stockfish$2d$eval$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/stockfish-eval.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase/client.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
;
;
;
;
;
;
function ChessGame() {
    _s();
    const [gameState, setGameState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$chess$2d$engine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createInitialState"])());
    const [gameHistory, setGameHistory] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$chess$2d$engine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createInitialState"])()
    ]);
    const [historyIndex, setHistoryIndex] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [selectedSquare, setSelectedSquare] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [validMoves, setValidMoves] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [lastMove, setLastMove] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [aiLastMove, setAiLastMove] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null); // Track AI move separately
    const [playerStats, setPlayerStats] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isThinking, setIsThinking] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [moveNotations, setMoveNotations] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [currentEvaluation, setCurrentEvaluation] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [gameEvaluations, setGameEvaluations] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [aiAnalysis, setAIAnalysis] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [isAnalyzing, setIsAnalyzing] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [gameStarted, setGameStarted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [playerColor, setPlayerColor] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("w");
    const [showSetupModal, setShowSetupModal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [currentDifficulty, setCurrentDifficulty] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(5);
    const [positionEval, setPositionEval] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [moveTimes, setMoveTimes] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]); // Track move times
    const [moveStartTime, setMoveStartTime] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(Date.now());
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [initialEloSet, setInitialEloSet] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false); // Track if ELO was set
    const [showBlunderAlert, setShowBlunderAlert] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false); // Blunder alert
    const [pendingBlunderEval, setPendingBlunderEval] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isLoadingSession, setIsLoadingSession] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const aiMoveInProgress = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    const sessionSaveTimeout = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ChessGame.useEffect": ()=>{
            const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])();
            const checkAuth = {
                "ChessGame.useEffect.checkAuth": async ()=>{
                    const { data: { user } } = await supabase.auth.getUser();
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
                                    totalMovesAnalyzed: 0
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
                            } catch  {
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
                            } catch  {
                            // Ignore
                            }
                        }
                    }
                    setIsLoadingSession(false);
                }
            }["ChessGame.useEffect.checkAuth"];
            checkAuth();
            const { data: { subscription } } = supabase.auth.onAuthStateChange({
                "ChessGame.useEffect": (_, session)=>{
                    setUser(session?.user ?? null);
                }
            }["ChessGame.useEffect"]);
            return ({
                "ChessGame.useEffect": ()=>subscription.unsubscribe()
            })["ChessGame.useEffect"];
        }
    }["ChessGame.useEffect"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ChessGame.useEffect": ()=>{
            if (playerStats && !user) {
                localStorage.setItem("chessAI_playerStats", JSON.stringify(playerStats));
            }
        }
    }["ChessGame.useEffect"], [
        playerStats,
        user
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ChessGame.useEffect": ()=>{
            if (!gameStarted || isLoadingSession) return;
            if (sessionSaveTimeout.current) {
                clearTimeout(sessionSaveTimeout.current);
            }
            sessionSaveTimeout.current = setTimeout({
                "ChessGame.useEffect": ()=>{
                    const sessionData = {
                        gameState,
                        gameHistory,
                        moveNotations,
                        gameEvaluations,
                        playerColor,
                        currentDifficulty,
                        historyIndex,
                        moveTimes
                    };
                    if (user) {
                        fetch("/api/session", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify(sessionData)
                        }).catch(console.error);
                    } else {
                        localStorage.setItem("chessAI_session", JSON.stringify(sessionData));
                    }
                }
            }["ChessGame.useEffect"], 2000);
            return ({
                "ChessGame.useEffect": ()=>{
                    if (sessionSaveTimeout.current) {
                        clearTimeout(sessionSaveTimeout.current);
                    }
                }
            })["ChessGame.useEffect"];
        }
    }["ChessGame.useEffect"], [
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
        isLoadingSession
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ChessGame.useEffect": ()=>{
            setPositionEval((0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$adaptive$2d$ai$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["evaluatePosition"])(gameState));
        }
    }["ChessGame.useEffect"], [
        gameState
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ChessGame.useEffect": ()=>{
            if (!playerStats) return;
            if (gameState.isCheckmate || gameState.isStalemate || gameState.isDraw) {
                let result;
                let resultNum;
                if (gameState.isCheckmate) {
                    result = gameState.turn === playerColor ? "loss" : "win";
                    resultNum = result === "win" ? 1 : 0;
                } else {
                    result = "draw";
                    resultNum = 0.5;
                }
                const prevElo = playerStats.skillRating;
                const newStats = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$adaptive$2d$ai$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["updateStatsAfterGame"])(playerStats, result, currentDifficulty);
                setPlayerStats(newStats);
                // Save to database if logged in
                if (user) {
                    const scores = gameEvaluations.map({
                        "ChessGame.useEffect.scores": (e)=>{
                            switch(e.type){
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
                        }
                    }["ChessGame.useEffect.scores"]);
                    const ams = scores.length > 0 ? scores.reduce({
                        "ChessGame.useEffect": (a, b)=>a + b
                    }["ChessGame.useEffect"], 0) / scores.length : 0.75;
                    const variance = scores.length > 1 ? scores.reduce({
                        "ChessGame.useEffect": (sum, s)=>sum + Math.pow(s - ams, 2)
                    }["ChessGame.useEffect"], 0) / scores.length : 0;
                    const stdDev = Math.sqrt(variance);
                    const avgTime = moveTimes.length > 0 ? moveTimes.reduce({
                        "ChessGame.useEffect": (a, b)=>a + b
                    }["ChessGame.useEffect"], 0) / moveTimes.length : 0;
                    fetch("/api/save-game", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            result: resultNum,
                            playerColor,
                            aiElo: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$stockfish$2d$eval$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["STOCKFISH_LEVELS"][currentDifficulty]?.elo || 1000,
                            totalMoves: gameEvaluations.length,
                            excellentMoves: gameEvaluations.filter({
                                "ChessGame.useEffect": (e)=>e.type === "excellent" || e.type === "brilliant"
                            }["ChessGame.useEffect"]).length,
                            goodMoves: gameEvaluations.filter({
                                "ChessGame.useEffect": (e)=>e.type === "good"
                            }["ChessGame.useEffect"]).length,
                            inaccurateMoves: gameEvaluations.filter({
                                "ChessGame.useEffect": (e)=>e.type === "inaccuracy"
                            }["ChessGame.useEffect"]).length,
                            mistakes: gameEvaluations.filter({
                                "ChessGame.useEffect": (e)=>e.type === "mistake"
                            }["ChessGame.useEffect"]).length,
                            blunders: gameEvaluations.filter({
                                "ChessGame.useEffect": (e)=>e.type === "blunder"
                            }["ChessGame.useEffect"]).length,
                            ams,
                            stdDeviation: stdDev,
                            avgTimePerMove: avgTime,
                            playerEloBefore: prevElo,
                            playerEloAfter: newStats.skillRating
                        })
                    }).catch(console.error);
                    // Clear session
                    fetch("/api/session", {
                        method: "DELETE"
                    }).catch(console.error);
                } else {
                    localStorage.removeItem("chessAI_session");
                }
            }
        }
    }["ChessGame.useEffect"], [
        gameState.isCheckmate,
        gameState.isStalemate,
        gameState.isDraw,
        gameState.turn,
        playerColor,
        currentDifficulty,
        playerStats,
        user,
        gameEvaluations,
        moveTimes
    ]);
    // AI move effect
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ChessGame.useEffect": ()=>{
            if (!gameStarted || !playerStats) return;
            if (gameState.turn === playerColor) return;
            if (gameState.isCheckmate || gameState.isStalemate || gameState.isDraw) return;
            if (aiMoveInProgress.current) return;
            const makeAIMove = {
                "ChessGame.useEffect.makeAIMove": async ()=>{
                    aiMoveInProgress.current = true;
                    setIsThinking(true);
                    await new Promise({
                        "ChessGame.useEffect.makeAIMove": (resolve)=>setTimeout(resolve, 300)
                    }["ChessGame.useEffect.makeAIMove"]);
                    try {
                        const aiMove = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$adaptive$2d$ai$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getAIMoveAsync"])(gameState, currentDifficulty, playerStats);
                        if (aiMove) {
                            const newState = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$chess$2d$engine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["makeMove"])(gameState, aiMove.from, aiMove.to);
                            if (newState) {
                                setGameState(newState);
                                setGameHistory({
                                    "ChessGame.useEffect.makeAIMove": (prev)=>[
                                            ...prev.slice(0, historyIndex + 1),
                                            newState
                                        ]
                                }["ChessGame.useEffect.makeAIMove"]);
                                setHistoryIndex({
                                    "ChessGame.useEffect.makeAIMove": (prev)=>prev + 1
                                }["ChessGame.useEffect.makeAIMove"]);
                                setAiLastMove(aiMove); // Track AI move
                                setLastMove(null); // Clear player's last move highlight
                                const notation = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$chess$2d$engine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["moveToAlgebraic"])(gameState, newState.history[newState.history.length - 1]);
                                setMoveNotations({
                                    "ChessGame.useEffect.makeAIMove": (prev)=>[
                                            ...prev,
                                            notation
                                        ]
                                }["ChessGame.useEffect.makeAIMove"]);
                                setMoveStartTime(Date.now()); // Reset timer for player
                            }
                        }
                    } catch (error) {
                        console.error("AI move error:", error);
                    } finally{
                        setIsThinking(false);
                        aiMoveInProgress.current = false;
                    }
                }
            }["ChessGame.useEffect.makeAIMove"];
            makeAIMove();
        }
    }["ChessGame.useEffect"], [
        gameState,
        gameStarted,
        playerColor,
        currentDifficulty,
        playerStats,
        historyIndex
    ]);
    const requestAIAnalysis = async (state, evaluation)=>{
        if (evaluation.type === "good" || evaluation.type === "excellent") return;
        setIsAnalyzing(true);
        try {
            const response = await fetch("/api/analyze-move", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    gameState: state,
                    evaluation,
                    moveHistory: moveNotations,
                    playerStats: playerStats ? {
                        skillRating: playerStats.skillRating,
                        averageAccuracy: playerStats.averageAccuracy
                    } : null,
                    allEvaluations: gameEvaluations,
                    moveTimes
                })
            });
            const data = await response.json();
            setAIAnalysis(data.analysis);
        } catch (error) {
            console.error("Failed to get AI analysis:", error);
        } finally{
            setIsAnalyzing(false);
        }
    };
    const handleSquareClick = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ChessGame.useCallback[handleSquareClick]": (square)=>{
            if (!gameStarted || !playerStats) return;
            if (gameState.turn !== playerColor) return;
            if (isThinking) return;
            if (gameState.isCheckmate || gameState.isStalemate || gameState.isDraw) return;
            const [row, col] = [
                8 - Number.parseInt(square[1]),
                square.charCodeAt(0) - 97
            ];
            const clickedPiece = gameState.board[row]?.[col];
            if (selectedSquare) {
                if (clickedPiece && clickedPiece.color === playerColor) {
                    setSelectedSquare(square);
                    setValidMoves((0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$chess$2d$engine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getValidMoves"])(gameState, square));
                    return;
                }
                if (validMoves.includes(square)) {
                    const stateBefore = gameState;
                    const newState = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$chess$2d$engine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["makeMove"])(gameState, selectedSquare, square);
                    if (newState) {
                        const moveTime = (Date.now() - moveStartTime) / 1000;
                        setMoveTimes({
                            "ChessGame.useCallback[handleSquareClick]": (prev)=>[
                                    ...prev,
                                    moveTime
                                ]
                        }["ChessGame.useCallback[handleSquareClick]"]);
                        const evaluation = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$adaptive$2d$ai$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["evaluatePlayerMove"])(stateBefore, selectedSquare, square);
                        if (evaluation.type === "blunder" || evaluation.type === "mistake") {
                            setPendingBlunderEval(evaluation);
                            setShowBlunderAlert(true);
                        // Still make the move but show alert
                        }
                        setCurrentEvaluation(evaluation);
                        setGameEvaluations({
                            "ChessGame.useCallback[handleSquareClick]": (prev)=>[
                                    ...prev,
                                    evaluation
                                ]
                        }["ChessGame.useCallback[handleSquareClick]"]);
                        setPlayerStats({
                            "ChessGame.useCallback[handleSquareClick]": (prev)=>prev ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$adaptive$2d$ai$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["updateStatsAfterMove"])(prev, evaluation) : prev
                        }["ChessGame.useCallback[handleSquareClick]"]);
                        if (evaluation.type !== "good" && evaluation.type !== "excellent") {
                            requestAIAnalysis(stateBefore, evaluation);
                        } else {
                            setAIAnalysis("");
                        }
                        setGameState(newState);
                        setGameHistory({
                            "ChessGame.useCallback[handleSquareClick]": (prev)=>[
                                    ...prev.slice(0, historyIndex + 1),
                                    newState
                                ]
                        }["ChessGame.useCallback[handleSquareClick]"]);
                        setHistoryIndex({
                            "ChessGame.useCallback[handleSquareClick]": (prev)=>prev + 1
                        }["ChessGame.useCallback[handleSquareClick]"]);
                        setLastMove({
                            from: selectedSquare,
                            to: square
                        });
                        setAiLastMove(null); // Clear AI move highlight
                        const notation = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$chess$2d$engine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["moveToAlgebraic"])(stateBefore, newState.history[newState.history.length - 1]);
                        setMoveNotations({
                            "ChessGame.useCallback[handleSquareClick]": (prev)=>[
                                    ...prev,
                                    notation
                                ]
                        }["ChessGame.useCallback[handleSquareClick]"]);
                        const newDifficulty = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$stockfish$2d$eval$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getAdaptiveDifficulty"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$stockfish$2d$eval$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["eloToDifficulty"])(playerStats.skillRating), playerStats, gameEvaluations);
                        setCurrentDifficulty(newDifficulty);
                    }
                }
                setSelectedSquare(null);
                setValidMoves([]);
            } else {
                if (clickedPiece && clickedPiece.color === playerColor) {
                    setSelectedSquare(square);
                    setValidMoves((0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$chess$2d$engine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getValidMoves"])(gameState, square));
                }
            }
        }
    }["ChessGame.useCallback[handleSquareClick]"], [
        gameState,
        selectedSquare,
        validMoves,
        gameStarted,
        playerColor,
        isThinking,
        playerStats,
        gameEvaluations,
        historyIndex,
        moveStartTime
    ]);
    const handleBlunderUndo = ()=>{
        if (historyIndex > 0) {
            const newIndex = Math.max(0, historyIndex - 2);
            setHistoryIndex(newIndex);
            setGameState(gameHistory[newIndex]);
            setMoveNotations((prev)=>prev.slice(0, newIndex));
            setGameEvaluations((prev)=>prev.slice(0, -1));
            setMoveTimes((prev)=>prev.slice(0, -1));
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
    const handleStartGame = (color, initialElo)=>{
        const stats = playerStats || (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$adaptive$2d$ai$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createDefaultStats"])(initialElo);
        if (!playerStats) {
            stats.skillRating = initialElo;
        }
        setPlayerStats(stats);
        setPlayerColor(color);
        const difficulty = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$stockfish$2d$eval$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["eloToDifficulty"])(stats.skillRating);
        setCurrentDifficulty(difficulty);
        const initialState = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$chess$2d$engine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createInitialState"])();
        setGameState(initialState);
        setGameHistory([
            initialState
        ]);
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
            const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])();
            supabase.from("player_profiles").update({
                initial_elo_set: true,
                preferred_color: color,
                skill_rating: initialElo
            }).eq("id", user.id).then(()=>{});
        }
    };
    const handleUndo = ()=>{
        if (historyIndex > 0) {
            const newIndex = Math.max(0, historyIndex - 2);
            setHistoryIndex(newIndex);
            setGameState(gameHistory[newIndex]);
            setMoveNotations((prev)=>prev.slice(0, newIndex));
            setSelectedSquare(null);
            setValidMoves([]);
            setLastMove(null);
            setAiLastMove(null);
        }
    };
    const handleRedo = ()=>{
        if (historyIndex < gameHistory.length - 1) {
            const newIndex = Math.min(gameHistory.length - 1, historyIndex + 2);
            setHistoryIndex(newIndex);
            setGameState(gameHistory[newIndex]);
        }
    };
    const handleCopyPGN = ()=>{
        const pairs = [];
        for(let i = 0; i < moveNotations.length; i += 2){
            const moveNum = Math.floor(i / 2) + 1;
            const white = moveNotations[i];
            const black = moveNotations[i + 1] || "";
            pairs.push(`${moveNum}. ${white} ${black}`);
        }
        navigator.clipboard.writeText(pairs.join(" "));
    };
    const handleNewGame = ()=>{
        setShowSetupModal(true);
    };
    const handleCloseModal = ()=>{
        if (gameStarted) {
            setShowSetupModal(false);
        }
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ChessGame.useEffect": ()=>{
            if (!isLoadingSession && !gameStarted && !initialEloSet) {
                setShowSetupModal(true);
            }
        }
    }["ChessGame.useEffect"], [
        isLoadingSession,
        gameStarted,
        initialEloSet
    ]);
    const isFirstGame = !initialEloSet;
    const aiElo = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$stockfish$2d$eval$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["STOCKFISH_LEVELS"][currentDifficulty]?.elo || 1000;
    if (isLoadingSession) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "h-screen w-screen bg-background flex items-center justify-center",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-muted-foreground",
                children: "Loading..."
            }, void 0, false, {
                fileName: "[project]/components/chess-game.tsx",
                lineNumber: 654,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/components/chess-game.tsx",
            lineNumber: 653,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "h-screen w-screen bg-background overflow-hidden flex flex-col",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$game$2d$setup$2d$modal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GameSetupModal"], {
                open: showSetupModal,
                onStartGame: handleStartGame,
                onClose: handleCloseModal,
                isFirstGame: isFirstGame,
                currentElo: playerStats?.skillRating || 1000
            }, void 0, false, {
                fileName: "[project]/components/chess-game.tsx",
                lineNumber: 661,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$blunder$2d$alert$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BlunderAlert"], {
                open: showBlunderAlert,
                evaluation: pendingBlunderEval,
                onUndo: handleBlunderUndo,
                onDismiss: ()=>{
                    setShowBlunderAlert(false);
                    setPendingBlunderEval(null);
                }
            }, void 0, false, {
                fileName: "[project]/components/chess-game.tsx",
                lineNumber: 669,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: "flex-shrink-0 h-12 px-3 border-b border-border flex items-center justify-between",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-7 h-7 rounded bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold",
                                children: "C"
                            }, void 0, false, {
                                fileName: "[project]/components/chess-game.tsx",
                                lineNumber: 682,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "font-bold text-foreground",
                                children: "ChessMaster"
                            }, void 0, false, {
                                fileName: "[project]/components/chess-game.tsx",
                                lineNumber: 685,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/chess-game.tsx",
                        lineNumber: 681,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-3",
                        children: [
                            gameStarted && playerStats ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-3 text-xs",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-muted-foreground",
                                        children: [
                                            "ELO:",
                                            " ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "font-mono font-bold text-primary",
                                                children: playerStats.skillRating
                                            }, void 0, false, {
                                                fileName: "[project]/components/chess-game.tsx",
                                                lineNumber: 692,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/chess-game.tsx",
                                        lineNumber: 690,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-muted-foreground",
                                        children: [
                                            "vs AI: ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "font-mono",
                                                children: [
                                                    "~",
                                                    aiElo
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/chess-game.tsx",
                                                lineNumber: 697,
                                                columnNumber: 24
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/chess-game.tsx",
                                        lineNumber: 696,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-muted-foreground",
                                        children: [
                                            "Lv: ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "font-bold",
                                                children: currentDifficulty
                                            }, void 0, false, {
                                                fileName: "[project]/components/chess-game.tsx",
                                                lineNumber: 700,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/chess-game.tsx",
                                        lineNumber: 699,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/chess-game.tsx",
                                lineNumber: 689,
                                columnNumber: 13
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                size: "sm",
                                onClick: ()=>setShowSetupModal(true),
                                className: "h-7 px-3 text-xs",
                                children: "Start Game"
                            }, void 0, false, {
                                fileName: "[project]/components/chess-game.tsx",
                                lineNumber: 704,
                                columnNumber: 13
                            }, this),
                            user ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                size: "sm",
                                variant: "ghost",
                                className: "h-7 px-2 text-xs",
                                onClick: async ()=>{
                                    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])();
                                    await supabase.auth.signOut();
                                    window.location.reload();
                                },
                                children: "Logout"
                            }, void 0, false, {
                                fileName: "[project]/components/chess-game.tsx",
                                lineNumber: 714,
                                columnNumber: 13
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                size: "sm",
                                variant: "ghost",
                                className: "h-7 px-2 text-xs",
                                onClick: ()=>window.location.href = "/auth/login",
                                children: "Login"
                            }, void 0, false, {
                                fileName: "[project]/components/chess-game.tsx",
                                lineNumber: 727,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/chess-game.tsx",
                        lineNumber: 687,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/chess-game.tsx",
                lineNumber: 680,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                className: "flex-1 min-h-0 flex",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-shrink-0 w-8 p-1 flex items-stretch",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$evaluation$2d$bar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EvaluationBar"], {
                            evaluation: positionEval,
                            playerColor: playerColor
                        }, void 0, false, {
                            fileName: "[project]/components/chess-game.tsx",
                            lineNumber: 743,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/chess-game.tsx",
                        lineNumber: 742,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-shrink-0 p-2 flex items-center justify-center",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$chess$2d$board$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ChessBoard"], {
                            gameState: gameState,
                            selectedSquare: selectedSquare,
                            validMoves: validMoves,
                            lastMove: lastMove,
                            aiLastMove: aiLastMove,
                            onSquareClick: handleSquareClick,
                            flipped: playerColor === "b",
                            isThinking: isThinking,
                            playerColor: playerColor
                        }, void 0, false, {
                            fileName: "[project]/components/chess-game.tsx",
                            lineNumber: 748,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/chess-game.tsx",
                        lineNumber: 747,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1 min-w-0 flex flex-col p-2 pl-0 gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex-shrink-0",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ai$2d$feedback$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AIFeedback"], {
                                    evaluation: currentEvaluation,
                                    analysis: aiAnalysis,
                                    isAnalyzing: isAnalyzing,
                                    isThinking: isThinking,
                                    playerStats: playerStats,
                                    aiElo: aiElo,
                                    difficulty: currentDifficulty
                                }, void 0, false, {
                                    fileName: "[project]/components/chess-game.tsx",
                                    lineNumber: 765,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/chess-game.tsx",
                                lineNumber: 764,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex-1 min-h-0",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$move$2d$history$2d$panel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MoveHistoryPanel"], {
                                    moveNotations: moveNotations,
                                    gameState: gameState,
                                    isThinking: isThinking
                                }, void 0, false, {
                                    fileName: "[project]/components/chess-game.tsx",
                                    lineNumber: 778,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/chess-game.tsx",
                                lineNumber: 777,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex-shrink-0",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$game$2d$controls$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GameControls"], {
                                    onUndo: handleUndo,
                                    onRedo: handleRedo,
                                    onCopyPGN: handleCopyPGN,
                                    onNewGame: handleNewGame,
                                    canUndo: historyIndex > 0 && gameStarted,
                                    canRedo: historyIndex < gameHistory.length - 1,
                                    gameStarted: gameStarted
                                }, void 0, false, {
                                    fileName: "[project]/components/chess-game.tsx",
                                    lineNumber: 787,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/chess-game.tsx",
                                lineNumber: 786,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/chess-game.tsx",
                        lineNumber: 762,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/chess-game.tsx",
                lineNumber: 740,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/chess-game.tsx",
        lineNumber: 660,
        columnNumber: 5
    }, this);
}
_s(ChessGame, "wm3AWa/D3xyajE7ht9hXlFqh1dg=");
_c = ChessGame;
var _c;
__turbopack_context__.k.register(_c, "ChessGame");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_0065bd6c._.js.map