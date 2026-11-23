import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/session";

export async function GET(request: NextRequest) {
  return NextResponse.json({ authenticated: await isAdminRequest(request) });
}
