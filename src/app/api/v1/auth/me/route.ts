import { isTokenError, verifyAuthToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const tokenResult = verifyAuthToken(request);
  if (isTokenError(tokenResult)) {
    return tokenResult;
  }

  const user = await prisma.user.findUnique({
    where: { id: tokenResult.userId },
    include: {
      department: {
        select: { id: true, name: true },
      },
      manager: {
        select: { id: true, name: true },
      },
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

  return NextResponse.json({
    success: true,
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role.toLowerCase(),
      department: user.department
        ? { id: user.department.id, name: user.department.name }
        : null,
      manager: user.manager
        ? { id: user.manager.id, name: user.manager.name }
        : null,
    },
  });
}
