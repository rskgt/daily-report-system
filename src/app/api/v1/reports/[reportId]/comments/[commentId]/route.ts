import { authenticateRequest, isAuthError } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { type NextRequest, NextResponse } from "next/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ reportId: string; commentId: string }> },
) {
  const authResult = await authenticateRequest(request);
  if (isAuthError(authResult)) {
    return authResult;
  }

  const { reportId: reportIdStr, commentId: commentIdStr } = await params;
  const reportId = Number(reportIdStr);
  const commentId = Number(commentIdStr);

  if (
    Number.isNaN(reportId) ||
    reportId <= 0 ||
    Number.isNaN(commentId) ||
    commentId <= 0
  ) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "VALIDATION_ERROR", message: "IDが不正です" },
      },
      { status: 400 },
    );
  }

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
  });

  if (!comment || comment.dailyReportId !== reportId) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "NOT_FOUND", message: "コメントが見つかりません" },
      },
      { status: 404 },
    );
  }

  // 投稿者本人 or ADMINのみ削除可能
  const isOwner = comment.userId === authResult.id;
  const isAdmin = authResult.role === "ADMIN";
  if (!isOwner && !isAdmin) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "このコメントを削除する権限がありません",
        },
      },
      { status: 403 },
    );
  }

  await prisma.comment.delete({ where: { id: commentId } });

  return NextResponse.json({
    success: true,
    data: { message: "コメントを削除しました" },
  });
}
