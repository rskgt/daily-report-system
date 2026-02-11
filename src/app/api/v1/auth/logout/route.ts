import {
  AUTH_TOKEN_COOKIE,
  authenticateRequest,
  isAuthError,
} from "@/lib/auth";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const authResult = await authenticateRequest(request);
  if (isAuthError(authResult)) {
    return authResult;
  }

  const response = NextResponse.json({
    success: true,
    data: {
      message: "ログアウトしました",
    },
  });

  response.cookies.set(AUTH_TOKEN_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}
