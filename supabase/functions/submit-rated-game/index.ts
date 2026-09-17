import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { Chess } from "npm:chess.js@1";

const factors=["material","checks","captures","threats","piece_activity","king_safety","position","time_thinking","challenge"] as const;
const clamp=(n:number,a:number,b:number)=>Math.max(a,Math.min(b,n));
function eloExpected(player:number,opp:number){return 1/(1+10**((opp-player)/400));}
function resultScore(result:string){return result==="win"?1:result==="draw"?.5:0;}

Deno.serve(async req=>{
 try{
  if(req.method!=="POST")return new Response("Method not allowed",{status:405});
  const auth=req.headers.get("Authorization"); if(!auth)return new Response("Unauthorized",{status:401});
  const supabase=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,{global:{headers:{Authorization:auth}}});
  const{data:{user},error:userError}=await supabase.auth.getUser(); if(userError||!user)return new Response("Unauthorized",{status:401});
  const body=await req.json(); const pgn=String(body.pgn||""); const requestedResult=String(body.result||""); const scope=String(body.game_scope||"rated_ai");
  if(scope!=="rated_ai")return new Response("Only rated AI games are accepted here",{status:400});
  if(!pgn||!["win","draw","loss"].includes(requestedResult))return new Response("Invalid game payload",{status:400});
  const game=new Chess(); try{game.loadPgn(pgn);}catch{return new Response("Invalid PGN",{status:400});}
  const history=game.history({verbose:true}); if(history.length<1)return new Response("Empty game",{status:400});
  const{data:profile,error:profileError}=await supabase.from("profiles").select("chess_elo").eq("id",user.id).single(); if(profileError||!profile)return new Response("Profile unavailable",{status:400});
  const starting=Number(profile.chess_elo)||0; const opponent=Math.max(0,Number(body.opponent_elo)||1200); const expected=eloExpected(starting,opponent); const actual=resultScore(requestedResult);
  const performance=clamp(Number(body.performance_score)||.5,0,1); const k=starting<10?50:starting<30?35:24; const delta=Math.round(k*(0.85+0.30*performance)*(actual-expected)); const final=Math.max(0,starting+delta);
  const{data:existing}=await supabase.from("rating_events").select("id").eq("player_id",user.id).eq("game_id",body.client_game_id||"00000000-0000-0000-0000-000000000000").maybeSingle(); if(existing)return Response.json({duplicate:true});
  const{data:rg,error:rgError}=await supabase.from("rated_games").insert({player_id:user.id,result:requestedResult,starting_elo:starting,opponent_elo:opponent,final_elo:final,pgn,move_count:history.length,started_at:body.started_at||new Date().toISOString(),completed_at:new Date().toISOString(),game_scope:"rated_ai"}).select("id").single(); if(rgError||!rg)return new Response("Could not record game",{status:500});
  const{data:re,error:reError}=await supabase.from("rating_events").insert({player_id:user.id,game_id:rg.id,rating_before:starting,rating_after:final,expected_score:expected,actual_score:actual,rating_delta:delta}).select("id").single(); if(reError||!re)return new Response("Could not record rating event",{status:500});
  const base=clamp(performance*100,0,100); const contributions=factors.map((factor,i)=>({rating_event_id:re.id,factor,contribution:clamp((base-50)+(i===0?5:0),-100,100)})); await supabase.from("rating_factor_contributions").insert(contributions);
  await supabase.from("profiles").update({chess_elo:final,updated_at:new Date().toISOString()}).eq("id",user.id);
  return Response.json({rating_before:starting,rating_after:final,rating_delta:delta,expected_score:expected});
 }catch(e){return new Response("Server error",{status:500});}
});
