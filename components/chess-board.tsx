"use client";

import { useMemo, useState } from "react";
import { Chess, type Square } from "chess.js";

const glyphs: Record<string, string> = { wK:"♔", wQ:"♕", wR:"♖", wB:"♗", wN:"♘", wP:"♙", bK:"♚", bQ:"♛", bR:"♜", bB:"♝", bN:"♞", bP:"♟" };
const files = ["a","b","c","d","e","f","g","h"];

type Props = { game: Chess; onMove?: (san: string, nextGame: Chess) => void; orientation?: "white" | "black" };

export default function ChessBoard({ game, onMove, orientation = "white" }: Props) {
  const [selected, setSelected] = useState<Square | null>(null);
  const legalTargets = useMemo(() => selected ? game.moves({ square: selected, verbose: true }).map(m => m.to) : [], [game, selected]);
  const ranks = orientation === "white" ? [8,7,6,5,4,3,2,1] : [1,2,3,4,5,6,7,8];
  const shownFiles = orientation === "white" ? files : [...files].reverse();

  function clickSquare(square: Square) {
    const piece = game.get(square);
    if (selected && legalTargets.includes(square)) {
      try {
        const nextGame = new Chess(game.fen());
        const move = nextGame.move({ from: selected, to: square, promotion: "q" });
        setSelected(null);
        onMove?.(move.san, nextGame);
        return;
      } catch {}
    }
    if (piece && piece.color === game.turn()) setSelected(square);
    else setSelected(null);
  }

  return <div className="game-board" aria-label="Chess board">
    {ranks.flatMap((rank, r) => shownFiles.map((file, f) => {
      const square = `${file}${rank}` as Square;
      const piece = game.get(square);
      const dark = (r + f) % 2 === 1;
      const legal = legalTargets.includes(square);
      const capture = legal && Boolean(piece);
      return <button key={square} onClick={() => clickSquare(square)} className={`game-square ${dark ? "dark" : "light"} ${selected === square ? "selected" : ""} ${capture ? "capture" : legal ? "legal" : ""}`} aria-label={square}>
        {piece && <span className="piece">{glyphs[`${piece.color}${piece.type.toUpperCase()}`]}</span>}
      </button>;
    }))}
  </div>;
}
