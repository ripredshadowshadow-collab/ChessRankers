import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.clone();
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const next = url.searchParams.get("next") || "/play";
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/play";
  url.searchParams.delete("token_hash");
  url.searchParams.delete("type");
  url.searchParams.delete("next");

  if (!tokenHash || !type) {
    url.pathname = "/auth";
    url.searchParams.set("error", "Invalid confirmation link.");
    return NextResponse.redirect(url);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
  if (error) {
    url.pathname = "/auth";
    url.searchParams.set("error", "This confirmation link is invalid or expired.");
    return NextResponse.redirect(url);
  }

  url.pathname = safeNext;
  return NextResponse.redirect(url);
}
