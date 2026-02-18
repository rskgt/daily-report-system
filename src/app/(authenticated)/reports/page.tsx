import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AUTH_TOKEN_COOKIE, verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { Plus } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ReportFilters } from "./_components/ReportFilters";

interface FilterParams {
  userName?: string;
  dateFrom?: string;
  dateTo?: string;
  /** "confirmed" | "unconfirmed" */
  status?: string;
}

function buildWhereByRole(
  userId: number,
  role: string,
  departmentId: number | null,
): Prisma.DailyReportWhereInput {
  if (role === "ADMIN") return {};
  if (role === "MANAGER") {
    return departmentId
      ? { OR: [{ user: { departmentId, role: "SALES" } }, { userId }] }
      : { userId };
  }
  return { userId };
}

async function getReports(
  userId: number,
  role: string,
  departmentId: number | null,
  filters: FilterParams,
) {
  const roleWhere = buildWhereByRole(userId, role, departmentId);

  const conditions: Prisma.DailyReportWhereInput[] = [roleWhere];

  // 投稿者名フィルター
  if (filters.userName) {
    conditions.push({
      user: { name: { contains: filters.userName } },
    });
  }

  // 日付範囲フィルター
  if (filters.dateFrom) {
    conditions.push({
      reportDate: { gte: new Date(filters.dateFrom) },
    });
  }
  if (filters.dateTo) {
    // 終了日は当日を含む
    const endDate = new Date(filters.dateTo);
    endDate.setDate(endDate.getDate() + 1);
    conditions.push({
      reportDate: { lt: endDate },
    });
  }

  const where: Prisma.DailyReportWhereInput =
    conditions.length === 1 ? conditions[0] : { AND: conditions };

  const reports = await prisma.dailyReport.findMany({
    where,
    orderBy: { reportDate: "desc" },
    take: 200,
    include: {
      user: {
        select: { id: true, name: true },
      },
      visitRecords: {
        orderBy: { displayOrder: "asc" },
        take: 1,
        include: {
          customer: {
            select: { name: true },
          },
        },
      },
      comments: {
        select: { userId: true },
      },
      _count: {
        select: { visitRecords: true },
      },
    },
  });

  return reports;
}

function formatDate(date: Date) {
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_TOKEN_COOKIE)?.value;
  if (!token) {
    redirect("/login");
  }

  let userId: number;
  let role: string;
  try {
    const payload = verifyToken(token);
    userId = payload.userId;
    role = payload.role;
  } catch {
    redirect("/login");
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { departmentId: true },
  });
  const departmentId = currentUser?.departmentId ?? null;

  const params = await searchParams;
  const hasComments = params.has_comments === "true";
  const filters: FilterParams = {
    userName:
      typeof params.user_name === "string" ? params.user_name : undefined,
    dateFrom:
      typeof params.date_from === "string" ? params.date_from : undefined,
    dateTo: typeof params.date_to === "string" ? params.date_to : undefined,
    status: typeof params.status === "string" ? params.status : undefined,
  };

  const reports = await getReports(userId, role, departmentId, filters);

  const showUserFilter = role === "MANAGER" || role === "ADMIN";

  // 確認済み/未確認フィルター適用
  // 「確認済み」= 自分(閲覧者)がコメントを残している日報
  // 「未確認」= 自分がコメントを残していない日報
  const filteredReports = reports.filter((report) => {
    // コメント有りフィルター（ダッシュボードからの遷移）
    if (hasComments && report.comments.length === 0) return false;
    if (!filters.status || filters.status === "all") return true;
    const hasMyComment = report.comments.some((c) => c.userId === userId);
    return filters.status === "confirmed" ? hasMyComment : !hasMyComment;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">日報一覧</h1>
        <Button asChild>
          <Link href="/reports/new">
            <Plus className="mr-2 h-4 w-4" />
            新規作成
          </Link>
        </Button>
      </div>

      {/* フィルター */}
      <Card>
        <CardContent className="pt-6">
          <Suspense fallback={null}>
            <ReportFilters showUserFilter={showUserFilter} />
          </Suspense>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {role === "SALES"
              ? "自分の日報"
              : role === "MANAGER"
                ? "部署の日報"
                : "全社員の日報"}
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({filteredReports.length}件)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredReports.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              該当する日報がありません
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12" />
                  <TableHead>日付</TableHead>
                  <TableHead>担当者</TableHead>
                  <TableHead>主な訪問先</TableHead>
                  <TableHead className="text-center">訪問件数</TableHead>
                  <TableHead className="text-center">ステータス</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map((report) => {
                  const firstCustomer =
                    report.visitRecords[0]?.customer.name ?? "-";
                  const visitCount = report._count.visitRecords;
                  const hasMyComment = report.comments.some(
                    (c) => c.userId === userId,
                  );
                  // 自分の日報以外で、自分がコメントしていない場合は未確認
                  const showUnconfirmed =
                    report.user.id !== userId && !hasMyComment;

                  return (
                    <TableRow key={report.id}>
                      <TableCell className="pr-0">
                        {showUnconfirmed && (
                          <Badge
                            variant="destructive"
                            className="px-1.5 py-0 text-[10px]"
                          >
                            未確認
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatDate(report.reportDate)}
                      </TableCell>
                      <TableCell>{report.user.name}</TableCell>
                      <TableCell>
                        {firstCustomer}
                        {visitCount > 1 && (
                          <span className="ml-1 text-xs text-muted-foreground">
                            他{visitCount - 1}件
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {visitCount}件
                      </TableCell>
                      <TableCell className="text-center">
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-xs ${
                            report.status === "SUBMITTED"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {report.status === "SUBMITTED"
                            ? "提出済み"
                            : "下書き"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/reports/${report.id}`}>詳細</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
