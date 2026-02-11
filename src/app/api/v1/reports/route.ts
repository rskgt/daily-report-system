import { authenticateRequest, isAuthError } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createReportSchema } from "@/lib/validations";
import type { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

/**
 * 権限に応じた日報の where 条件を構築する
 * - ADMIN: 全社員の日報
 * - MANAGER: 同部署の下位ロール(SALES)の日報 + 自分の日報
 * - SALES: 自分の日報のみ
 */
function buildReportWhereByRole(
  userId: number,
  role: string,
  departmentId: number | null,
): Prisma.DailyReportWhereInput {
  if (role === "ADMIN") {
    return {};
  }
  if (role === "MANAGER") {
    if (departmentId) {
      return {
        OR: [{ user: { departmentId, role: "SALES" } }, { userId }],
      };
    }
    return { userId };
  }
  return { userId };
}

export async function GET(request: NextRequest) {
  const authResult = await authenticateRequest(request);
  if (isAuthError(authResult)) {
    return authResult;
  }

  const { id: userId, role, departmentId } = authResult;
  console.log(
    `[Reports GET] userId=${userId}, role=${role}, departmentId=${departmentId}`,
  );

  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(
      100,
      Math.max(1, Number(searchParams.get("limit")) || 20),
    );
    const skip = (page - 1) * limit;

    const where = buildReportWhereByRole(userId, role, departmentId);
    console.log("[Reports GET] where条件:", JSON.stringify(where));

    const [reports, totalCount] = await Promise.all([
      prisma.dailyReport.findMany({
        where,
        orderBy: { reportDate: "desc" },
        skip,
        take: limit,
        include: {
          user: {
            select: { id: true, name: true },
          },
          _count: {
            select: { visitRecords: true, comments: true },
          },
        },
      }),
      prisma.dailyReport.count({ where }),
    ]);

    console.log(
      `[Reports GET] 取得件数: ${reports.length} / 全${totalCount}件`,
    );

    return NextResponse.json({
      success: true,
      data: {
        reports: reports.map((r) => ({
          id: r.id,
          report_date: r.reportDate.toISOString().split("T")[0],
          status: r.status.toLowerCase(),
          submitted_at: r.submittedAt?.toISOString() ?? null,
          user: r.user,
          visit_count: r._count.visitRecords,
          comment_count: r._count.comments,
        })),
        pagination: {
          current_page: page,
          total_pages: Math.ceil(totalCount / limit),
          total_count: totalCount,
        },
      },
    });
  } catch (error) {
    console.error("日報一覧取得エラー:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "サーバーエラーが発生しました",
        },
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const authResult = await authenticateRequest(request);
  if (isAuthError(authResult)) {
    return authResult;
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
          message: "リクエストボディが不正なJSON形式です",
        },
      },
      { status: 400 },
    );
  }

  try {
    const parsed = createReportSchema.safeParse(body);
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

    const { report_date, status, visit_records } = parsed.data;

    // 同一ユーザー・同一日の日報が既に存在するかチェック
    const existing = await prisma.dailyReport.findUnique({
      where: {
        userId_reportDate: {
          userId: authResult.id,
          reportDate: new Date(report_date),
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "DUPLICATE_REPORT",
            message: "この日付の日報は既に作成されています",
          },
        },
        { status: 400 },
      );
    }

    const report = await prisma.$transaction(async (tx) => {
      const created = await tx.dailyReport.create({
        data: {
          userId: authResult.id,
          reportDate: new Date(report_date),
          status: status === "submitted" ? "SUBMITTED" : "DRAFT",
          submittedAt: status === "submitted" ? new Date() : null,
          visitRecords: {
            create: visit_records.map((record) => ({
              customerId: record.customer_id,
              visitDatetime: new Date(record.visit_datetime),
              purpose: record.purpose,
              content: record.content,
              problem: record.problem ?? null,
              plan: record.plan ?? null,
              displayOrder: record.display_order,
            })),
          },
        },
      });

      return created;
    });

    revalidatePath("/dashboard");

    return NextResponse.json(
      {
        success: true,
        data: {
          id: report.id,
          report_date: report_date,
          status: status,
          created_at: report.createdAt.toISOString(),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("日報作成エラー:", error);
    const detail =
      error instanceof Error
        ? { message: error.message, stack: error.stack }
        : { message: String(error) };
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "サーバーエラーが発生しました",
          ...(process.env.NODE_ENV !== "production" && { detail }),
        },
      },
      { status: 500 },
    );
  }
}
