import { authenticateRequest, isAuthError } from "@/lib/auth";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const authResult = await authenticateRequest(request);
  if (isAuthError(authResult)) {
    return authResult;
  }

  return NextResponse.json({
    success: true,
    data: {
      message: "ログアウトしました",
    },
  });
}
