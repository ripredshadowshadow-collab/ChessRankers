"use client";
import { useState } from "react";
export default function SoloPage(){
 const [score,setScore]=useState(0);
 return <div className="cr-shell"><nav className="cr-nav"><a href="/" className="cr-brand"><span className="cr-mark">♞</span><span>ChessRankers</span></a><div className="cr-links"><a href="/play">Play AI</a><a className="active" href="/solo">Solo Chess</a><a href="/pvp">Play a Friend</a><a href="/tester">Move Tester</a><a href="/leaderboard">Leaderboard</a><a href="/profile">Profile</a></div></nav><main className="chess-page"><div className="match-top"><div><h1>Solo Chess</h1><p>Capture-puzzle mode with its own Elo. Completely separate from Chess Elo and PvP.</p></div><span className="mode-pill">SOLO ELO</span></div><div className="empty-state"><div className="cr-card"><h2>Solo arena foundation</h2><p>Solo Elo starts at 0. Puzzle scoring and the nine-factor performance breakdown will be connected to real gameplay next.</p><button className="cr-btn primary" onClick={()=>setScore(score+1)}>Test score · {score}</button></div></div></main></div>;
}
