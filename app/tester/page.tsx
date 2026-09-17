"use client";
import { useMemo, useState } from "react";
import { Chess } from "chess.js";
import ChessBoard from "@/components/chess-board";

export default function TesterPage(){
 const [fen,setFen]=useState("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
 const [game,setGame]=useState(()=>new Chess()); const [error,setError]=useState("");
 const evalText=useMemo(()=>{let material=0;for(const row of game.board())for(const p of row)if(p)material+=(p.color==="w"?1:-1)*({p:1,n:3,b:3,r:5,q:9,k:0}[p.type]??0);return `${material>=0?"+":""}${material}.0`},[game]);
 function load(){try{setGame(new Chess(fen));setError("")}catch{setError("Invalid FEN position")}}
 return <div className="cr-shell"><nav className="cr-nav"><a href="/" className="cr-brand"><span className="cr-mark">♞</span><span>ChessRankers</span></a><div className="cr-links"><a href="/play">Play AI</a><a href="/solo">Solo Chess</a><a href="/pvp">Play a Friend</a><a className="active" href="/tester">Move Tester</a><a href="/leaderboard">Leaderboard</a><a href="/profile">Profile</a></div></nav><main className="chess-page"><div className="match-top"><div><h1>Move Tester</h1><p>Analyze positions without changing Elo, wins, losses, draws or total games.</p></div><span className="mode-pill">UNRATED</span></div><section className="match-layout"><div className="board-wrap"><ChessBoard game={game}/><div className="board-meta"><span>Evaluation preview</span><strong>{evalText}</strong></div></div><aside className="side-stack"><div className="info-card"><h3>Position</h3><textarea value={fen} onChange={e=>setFen(e.target.value)} rows={5} style={{width:"100%",resize:"vertical",padding:12,borderRadius:10,border:"1px solid var(--line)",background:"var(--panel2)"}}/><button className="cr-btn primary" style={{marginTop:10,width:"100%"}} onClick={load}>Load FEN</button>{error&&<p style={{color:"#ef8b8b",fontSize:12}}>{error}</p>}</div><div className="info-card"><h3>Safety rail</h3><strong>NO ELO · NO W/L · NO GAMES</strong><p className="cr-note">This mode is for testing moves and positions only. It cannot affect competitive records.</p></div></aside></section></main></div>}
