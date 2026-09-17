import { createClient } from "@/lib/supabase/server";
export const dynamic = "force-dynamic";

const labels: Record<string,string> = { material:"Material", checks:"Checks", captures:"Captures", threats:"Threats", piece_activity:"Piece Activity", king_safety:"King Safety", position:"Position", time_thinking:"Time to Think", challenge:"Challenge" };
const factors = Object.keys(labels);

function Breakdown({ sums, title, elo }: { sums: Record<string,number>; title:string; elo:number }) {
  const positive = factors.map((key) => [key, sums[key] || 0] as const).filter(([,value]) => value > 0);
  const total = Math.max(1, positive.reduce((sum,[,value]) => sum + value, 0));
  let cursor = 0;
  const stops = positive.map(([key,value], index) => { const start=cursor; cursor += value/total*100; const opacity=Math.max(.25,1-index/Math.max(1,positive.length)); return `rgba(214,179,106,${opacity}) ${start}% ${cursor}%`; });
  return <section className="cr-card cr-feature"><strong>{title}</strong><div style={{width:170,height:170,borderRadius:"50%",margin:"18px auto",background:stops.length?`conic-gradient(${stops.join(",")})`:"var(--panel2)",display:"grid",placeItems:"center"}}><div style={{width:92,height:92,borderRadius:"50%",background:"var(--panel)",display:"grid",placeItems:"center",fontWeight:800}}>{elo}</div></div><span className="cr-note">Positive rating composition from recorded factor contributions.</span></section>;
}

function FactorList({ sums }: { sums: Record<string,number> }) {
 return <div>{factors.map((key)=>{const value=Math.round(sums[key]||0);const width=Math.min(100,Math.abs(value));return <div className="factor-row" key={key}><span>{labels[key]}</span><b>{value>0?`+${value}`:value}</b><div className="progress"><i style={{width:`${width}%`}}/></div></div>})}</div>;
}

export default async function ProfilePage(){
 const supabase=await createClient();
 const {data:claims}=await supabase.auth.getClaims();
 const id=claims?.claims?.sub as string|undefined;
 let profile:any=null, chessStats:any=null, soloStats:any=null, events:any[]=[];
 let chessFactors:any[]=[]; let soloEvents:any[]=[]; let soloFactors:any[]=[];
 if(id){
  const [p,c,s,e,se]=await Promise.all([
   supabase.from("profiles").select("username,chess_elo,solo_elo,pvp_wins,pvp_losses,pvp_draws").eq("id",id).maybeSingle(),
   supabase.from("player_chess_stats").select("games,wins,draws,losses,avg_moves").eq("id",id).maybeSingle(),
   supabase.from("player_solo_stats").select("runs,completed_runs,total_score,avg_duration_seconds").eq("id",id).maybeSingle(),
   supabase.from("rating_events").select("id,rating_before,rating_after,rating_delta,created_at").eq("player_id",id).order("created_at",{ascending:false}).limit(100),
   supabase.from("solo_rating_events").select("id,rating_before,rating_after,rating_delta,created_at").eq("player_id",id).order("created_at",{ascending:false}).limit(100),
  ]);
  profile=p.data; chessStats=c.data; soloStats=s.data; events=e.data||[]; soloEvents=se.data||[];
  const eventIds=events.map((x)=>x.id); const soloIds=soloEvents.map((x)=>x.id);
  const [cf,sf]=await Promise.all([
   eventIds.length?supabase.from("rating_factor_contributions").select("factor,contribution,rating_event_id").in("rating_event_id",eventIds):Promise.resolve({data:[]}),
   soloIds.length?supabase.from("solo_factor_contributions").select("factor,contribution,solo_rating_event_id").in("solo_rating_event_id",soloIds):Promise.resolve({data:[]}),
  ]);
  chessFactors=cf.data||[]; soloFactors=sf.data||[];
 }
 const sumFactors=(rows:any[])=>rows.reduce((acc,row)=>{acc[row.factor]=(acc[row.factor]||0)+Number(row.contribution||0);return acc;},{} as Record<string,number>);
 const chessSums=sumFactors(chessFactors), soloSums=sumFactors(soloFactors);
 return <div className="cr-shell"><nav className="cr-nav"><a href="/" className="cr-brand"><span className="cr-mark">♞</span><span>ChessRankers</span></a><div className="cr-links"><a href="/play">Play AI</a><a href="/solo">Solo Chess</a><a href="/pvp">Play a Friend</a><a href="/tester">Move Tester</a><a href="/leaderboard">Leaderboard</a><a className="active" href="/profile">Profile</a></div></nav><main className="chess-page"><div className="match-top"><div><h1>{profile?.username||"Player"}</h1><p>Your ratings, separate records and explainable performance history.</p></div></div><div className="cr-stat-grid"><div className="cr-stat"><b>{profile?.chess_elo??0}</b><span>Chess Elo</span></div><div className="cr-stat"><b>{profile?.solo_elo??0}</b><span>Solo Elo</span></div><div className="cr-stat"><b>{chessStats?.games??0}</b><span>Rated AI games</span></div><div className="cr-stat"><b>{profile?.pvp_wins??0} / {profile?.pvp_draws??0} / {profile?.pvp_losses??0}</b><span>PvP W / D / L</span></div></div><div className="cr-feature-grid"><Breakdown sums={chessSums} title="Chess Elo Breakdown" elo={profile?.chess_elo??0}/><section className="cr-card cr-feature"><strong>Chess factors</strong><FactorList sums={chessSums}/><p className="cr-note">Positive values helped rating events; negative values indicate performance that reduced the contribution.</p></section><Breakdown sums={soloSums} title="Solo Elo Breakdown" elo={profile?.solo_elo??0}/><section className="cr-card cr-feature"><strong>Solo factors</strong><FactorList sums={soloSums}/><p className="cr-note">Solo analysis is independent of normal Chess Elo and PvP.</p></section><section className="cr-card cr-feature"><strong>Recent Chess rating history</strong>{events.slice(0,10).length?events.slice(0,10).map((e)=><div className="move-row" key={e.id}><span>{new Date(e.created_at).toLocaleDateString()}</span><span>{e.rating_before} → {e.rating_after}</span><strong>{e.rating_delta>0?`+${e.rating_delta}`:e.rating_delta}</strong></div>):<span>No rated games yet.</span>}</section><section className="cr-card cr-feature"><strong>Stats</strong><p>Wins: {chessStats?.wins??0} · Draws: {chessStats?.draws??0} · Losses: {chessStats?.losses??0}</p><p>Solo runs: {soloStats?.runs??0} · Completed: {soloStats?.completed_runs??0} · Total score: {Math.round(Number(soloStats?.total_score??0))}</p><p className="cr-note">PvP has its own W/D/L record and never changes either Elo. Move Tester and Infinite Board are unrated.</p></section></div></main></div>;
}
