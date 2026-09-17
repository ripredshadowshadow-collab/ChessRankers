"use client";

import { useMemo, useState } from "react";
import { Chess } from "chess.js";
import ChessBoard from "@/components/chess-board";

export default function PlayPage() {
  const [game, setGame] = useState(() => new Chess());
  const [moves, setMoves] = useState<string[]>([]);
  const [botElo, setBotElo] = useState(1200);
  const [cycle, setCycle] = useState(10);

  const moveRows = useMemo(() => {
    const rows: { n:number; white?:string; black?:string }[] = [];
    for (let i = 0; i < moves.length; i += 2) rows.push({ n: i/2+1, white:moves[i], black:moves[i+1] });
    return rows;
  }, [moves]);

  function refreshAfterMove() {
    setGame(new Chess(game.fen()));
    const history = game.history();
    setMoves(history);
    if (history.length % 10 === 0) setBotElo(v => Math.min(3000, v + 50));
    setCycle(Math.ceil(Math.max(1, history.length + 1) / 10) * 10);
  }

  function reset() {
    setGame(new Chess());
    setMoves([]);
    setBotElo(1200);
    setCycle(10);
  }

  return <div className="cr-shell">
    <nav className="cr-nav">
      <a href="/" className="cr-brand"><span className="cr-mark">♞</span><span>ChessRankers</span></a>
      <div className="cr-links"><a className="active" href="/play">Play AI</a><a href="/solo">Solo Chess</a><a href="/pvp">Play a Friend</a><a href="/tester">Move Tester</a><a href="/leaderboard">Leaderboard</a><a href="/profile">Profile</a></div>
    </nav>

    <main className="chess-page">
      <div className="match-top">
        <div><h1>Rated AI</h1><p>Competitive match · Elo starts at 0 · opponent adapts every 10 moves</p></div>
        <span className="mode-pill">RATED</span>
      </div>

      <section className="match-layout">
        <div className="board-wrap">
          <div className="player-card" style={{marginBottom:10}}><div className="player-line"><span className="player-name">Adaptive Opponent</span><span className="player-rating">{botElo} Elo</span></div><div className="clock active">10:00</div></div>
          <ChessBoard game={game} onMove={refreshAfterMove} />
          <div className="board-meta"><span>Your side · White</span><strong>Next evaluation: move {cycle}</strong></div>
        </div>

        <aside className="side-stack">
          <div className="player-card"><div className="player-line"><span className="player-name">You</span><span className="player-rating">0 Elo</span></div><div className="clock">10:00</div></div>
          <div className="info-card"><h3>Adaptive opponent</h3><div className="ai-strength"><strong>{botElo}</strong><span className="player-rating">effective Elo</span></div><p style={{color:"var(--muted)",fontSize:12,lineHeight:1.5}}>Strength is adjusted from demonstrated play. The player does not choose a bot rating.</p></div>
          <div className="info-card"><h3>Performance factors</h3><div className="factor-list">
            {[["Material",72],["Checks",44],["Captures",61],["Threats",55],["Piece activity",67],["King safety",48],["Position",59],["Time to think",52],["Challenge",63]].map(([name,value]) => <div className="factor-row" key={name as string}><span>{name}</span><b>{value}%</b><div className="progress"><i style={{width:`${value}%`}} /></div></div>)}
          </div></div>
          <div className="info-card"><h3>Moves</h3><div className="move-list">{moveRows.length ? moveRows.map(r => <div className="move-row" key={r.n}><span>{r.n}.</span><span>{r.white}</span><span>{r.black ?? ""}</span></div>) : <span style={{color:"var(--muted)",fontSize:12}}>Make your first move.</span>}</div></div>
          <div className="controls"><button className="control" onClick={reset}>New game</button><button className="control" onClick={() => setGame(new Chess())}>Reset position</button><button className="control">Resign</button><button className="control">Draw</button></div>
        </aside>
      </section>
    </main>
  </div>;
}
