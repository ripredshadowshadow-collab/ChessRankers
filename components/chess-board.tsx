"use client";

import { useMemo, useState } from "react";
import { Chess } from "chess.js";

const glyphs: Record<string, string> = {
  wK: "♔", wQ: "♕", wR: "♖", wB: "♗", wN: "♘", wP: "♙",
  bK: "♚", bQ: "♛", bR: "♜", bB: "♝", bN: "♞", bP: "♟",
};
const files = ["a","b","c","d","e","f","g","h"];

export default function ChessBoard({ game, onMove }: { game: Chess; onMove?: () => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const board = game.board();
  const legalTargets = useMemo(() => selected ? game.moves({ square: selected as never, verbose: true }).map(m => m.to) : [], [game, selected]);

  function clickSquare(square: string) {
    const piece = game.get(square as never);
    if (selected) {
      if (legalTargets.includes(square)) {
        try { game.move({ from: selected, to: square, promotion: "q" }); setSelected(null); onMove?.(); return; } catch {}
      }
      if (piece && piece.color === game.turn()) { setSelected(square); return; }
      setSelected(null); return;
    }
    if (piece && piece.color === game.turn()) setSelected(square);
  }

  return (
    <div className="game-board" aria-label="Chess board">
      {board.flatMap((rank, r) => rank.map((piece, f) => {
        const square = `${files[f]}${8-r}`;
        const dark = (r + f) % 2 === 1;
        const legal = legalTargets.includes(square);
        const capture = legal && Boolean(piece);
        return <button key={square} onClick={() => clickSquare(square)} className={`game-square ${dark ? "dark" : "light"} ${selected === square ? "selected" : ""} ${capture ? "capture" : legal ? "legal" : ""}`} aria-label={square}>
          {piece && <span className="piece">{glyphs[`${piece.color}${piece.type.toUpperCase()}`]}</span>}
        </button>;
      }))}
    </div>
  );
}
