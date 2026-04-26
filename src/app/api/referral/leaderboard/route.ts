import { NextResponse } from "next/server";
import { getMonthlyLeaderboard } from "@/lib/referral";

export async function GET() {
  const leaderboard = await getMonthlyLeaderboard(10);
  return NextResponse.json(leaderboard);
}
