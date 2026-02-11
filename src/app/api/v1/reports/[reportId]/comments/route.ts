import { authenticateRequest, isAuthError } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createCommentSchema } from "@/lib/validations";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ reportId: string }> },
) {
  const authResult = await authenticateRequest(request);
  if (isAuthError(authResult)) {
    return authResult;
  }

  const { reportId: reportIdStr } = await params;
  const reportId = Number(reportIdStr);
  if (Number.isNaN(reportId) || reportId <= 0) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "日報IDが不正です",
        },
      },
      { status: 400 },
    );
  }

  // 日報の存在確認
  const report = await prisma.dailyReport.findUnique({
    where: { id: reportId },
  });

  if (!report) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "日報が見つかりません",
        },
      },
      { status: 404 },
    );
  }

  // コメント権限チェック: 上長・管理者のみ（または自分の日報）
  const isOwner = report.userId === authResult.id;
  const isManagerOrAdmin =
    authResult.role === "MANAGER" || authResult.role === "ADMIN";
  if (!isOwner && !isManagerOrAdmin) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "この日報にコメントする権限がありません",
        },
      },
      { status: 403 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "リクエストボディが不正です",
        },
      },
      { status: 400 },
    );
  }

  const parsed = createCommentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: parsed.error.errors[0].message,
        },
      },
      { status: 400 },
    );
  }

  const comment = await prisma.comment.create({
    data: {
      dailyReportId: reportId,
      userId: authResult.id,
      content: parsed.data.content,
    },
    include: {
      user: {
        select: { id: true, name: true },
      },
    },
  });

  return NextResponse.json(
    {
      success: true,
      data: {
        id: comment.id,
        content: comment.content,
        user: comment.user,
        created_at: comment.createdAt.toISOString(),
      },
    },
    { status: 201 },
  );
}
