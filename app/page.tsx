const pieces: Record<string, string> = {
  a8: "♜", b8: "♞", c8: "♝", d8: "♛", e8: "♚", f8: "♝", g8: "♞", h8: "♜",
  a7: "♟", b7: "♟", c7: "♟", d7: "♟", e7: "♟", f7: "♟", g7: "♟", h7: "♟",
  a2: "♙", b2: "♙", c2: "♙", d2: "♙", e2: "♙", f2: "♙", g2: "♙", h2: "♙",
  a1: "♖", b1: "♘", c1: "♗", d1: "♕", e1: "♔", f1: "♗", g1: "♘", h1: "♖",
  e4: "♙", d5: "♟"
};

function MiniBoard() {
  const files = "abcdefgh";
  return <div className="cr-board">{Array.from({ length: 64 }, (_, i) => {
    const file = files[i % 8];
    const rank = 8 - Math.floor(i / 8);
    const square = `${file}${rank}`;
    const dark = (i + Math.floor(i / 8)) % 2 === 1;
    return <div key={square} className={`cr-square ${dark ? "cr-dark" : "cr-light"}`}>{pieces[square] ?? ""}</div>;
  })}</div>;
}

export default function Home() {
  return <div className="cr-shell">
    <nav className="cr-nav">
      <a href="/" className="cr-brand"><span className="cr-mark">♞</span><span>ChessRankers</span></a>
      <div className="cr-links">
        <a href="/play">Play AI</a><a href="/solo">Solo Chess</a><a href="/pvp">Play a Friend</a><a href="/tester">Move Tester</a><a href="/leaderboard">Leaderboard</a><a href="/profile">Profile</a>
      </div>
    </nav>

    <main className="cr-main">
      <section className="cr-hero">
        <div>
          <div className="cr-kicker">Adaptive AI Chess Arena</div>
          <h1>Play. Improve.<br />Earn your rank.</h1>
          <p className="cr-sub">ChessRankers is a competitive AI chess arena where the opponent adapts to your performance and your gameplay becomes the basis of a real Elo-style rating.</p>
          <div className="cr-actions"><a className="cr-btn primary" href="/play">Play Rated AI</a><a className="cr-btn" href="/pvp">Play a Friend</a></div>
          <div className="cr-stat-grid"><div className="cr-stat"><b>0</b><span>Starting Elo</span></div><div className="cr-stat"><b>10</b><span>Move evaluation cycle</span></div><div className="cr-stat"><b>∞</b><span>Unrated analysis</span></div></div>
        </div>
        <div className="cr-card"><MiniBoard /><div style={{display:"flex",justifyContent:"space-between",marginTop:16}}><span style={{color:"#8f9aaa",fontSize:13}}>Adaptive opponent</span><strong>~1200 Elo</strong></div><div className="cr-note">Bot strength is adjusted from your demonstrated performance—not selected by the player.</div></div>
      </section>

      <section className="cr-section"><h2>One arena, separate records</h2><p>Rated AI, Solo Chess and private Player vs Player games are separate experiences. AI testing never changes your wins, losses, draws or total games.</p>
        <div className="cr-feature-grid">
          <div className="cr-card cr-feature"><strong>Rated AI</strong><span>Adaptive Stockfish-based opposition, clocks, legal chess rules and Elo-style rating changes.</span></div>
          <div className="cr-card cr-feature"><strong>Player vs Player</strong><span>Private games only through a direct invite link or an in-game request sent to another account. PvP changes PvP W/L/D only and never changes Elo.</span></div>
          <div className="cr-card cr-feature"><strong>Solo Chess</strong><span>Capture-puzzle gameplay with its own Solo Elo and completely separate ranking.</span></div>
          <div className="cr-card cr-feature"><strong>Move Tester</strong><span>Experiment with positions and variations without affecting Elo, wins, losses or total games.</span></div>
          <div className="cr-card cr-feature"><strong>Infinite Board</strong><span>Build arbitrary positions, choose the side to move and test them against AI without affecting your competitive record.</span></div>
        </div>
      </section>
    </main>
  </div>;
}
