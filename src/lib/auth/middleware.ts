import { prisma } from "@/lib/prisma";
import { type NextRequest, NextResponse } from "next/server";
import { type JwtPayload, verifyToken } from "./jwt";

export const AUTH_TOKEN_COOKIE = "auth-token";

export interface AuthenticatedUser {
  id: number;
  name: string;
  email: string;
  role: string;
  departmentId: number | null;
  managerId: number | null;
}

/**
 * リクエストからBearerトークンを抽出する
 * Authorization ヘッダー → Cookie の順にフォールバック
 */
function extractToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  return request.cookies.get(AUTH_TOKEN_COOKIE)?.value ?? null;
}

/**
 * トークンのみを検証してペイロードを返す（DB問い合わせなし）
 * ルート側で独自のDBクエリを行いたい場合に使用する
 */
export function verifyAuthToken(
  request: NextRequest,
): JwtPayload | NextResponse {
  const token = extractToken(request);
  if (!token) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "認証トークンが必要です",
        },
      },
      { status: 401 },
    );
  }

  try {
    return verifyToken(token);
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "認証トークンが無効または期限切れです",
        },
      },
      { status: 401 },
    );
  }
}

/**
 * 認証を検証してユーザー情報を返す
 * 認証失敗時はエラーレスポンスを返す
 */
export async function authenticateRequest(
  request: NextRequest,
): Promise<AuthenticatedUser | NextResponse> {
  const tokenResult = verifyAuthToken(request);
  if (isTokenError(tokenResult)) {
    return tokenResult;
  }

  const user = await prisma.user.findUnique({
    where: { id: tokenResult.userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      departmentId: true,
      managerId: true,
      isActive: true,
    },
  });

  if (!user || !user.isActive) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "ユーザーが見つからないか無効化されています",
        },
      },
      { status: 401 },
    );
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    departmentId: user.departmentId,
    managerId: user.managerId,
  };
}

/**
 * 認証結果がエラーレスポンスかどうかを判定する
 */
export function isAuthError(
  result: AuthenticatedUser | NextResponse,
): result is NextResponse {
  return result instanceof NextResponse;
}

/**
 * トークン検証結果がエラーレスポンスかどうかを判定する
 */
export function isTokenError(
  result: JwtPayload | NextResponse,
): result is NextResponse {
  return result instanceof NextResponse;
}
