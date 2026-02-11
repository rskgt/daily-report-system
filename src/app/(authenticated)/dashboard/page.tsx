import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AUTH_TOKEN_COOKIE, verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FileText, MessageSquare, Plus } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

async function getDashboardData(userId: number) {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59,
    999,
  );

  const [submittedCount, draftCount, recentReports, commentCount] =
    await Promise.all([
      prisma.dailyReport.count({
        where: {
          userId,
          status: "SUBMITTED",
          reportDate: { gte: monthStart, lte: monthEnd },
        },
      }),
      prisma.dailyReport.count({
        where: {
          userId,
          status: "DRAFT",
          reportDate: { gte: monthStart, lte: monthEnd },
        },
      }),
      prisma.dailyReport.findMany({
        where: { userId },
        orderBy: { reportDate: "desc" },
        take: 5,
        select: {
          id: true,
          reportDate: true,
          status: true,
        },
      }),
      prisma.comment.count({
        where: {
          dailyReport: { userId },
        },
      }),
    ]);

  return {
    monthlySubmitted: submittedCount,
    monthlyDraft: draftCount,
    commentCount,
    recentReports: recentReports.map((r) => ({
      id: r.id,
      date: r.reportDate.toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }),
      status:
        r.status === "SUBMITTED" ? ("submitted" as const) : ("draft" as const),
    })),
  };
}

/**
 * ダッシュボード画面
 * ユーザーのホーム画面として、日報サマリーや未読コメント等を表示
 */
export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_TOKEN_COOKIE)?.value;
  if (!token) {
    redirect("/login");
  }

  let userId: number;
  try {
    const payload = verifyToken(token);
    userId = payload.userId;
  } catch {
    redirect("/login");
  }

  const data = await getDashboardData(userId);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">ダッシュボード</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* 今月の日報サマリー */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">今月の日報</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.monthlySubmitted}件</div>
            <p className="text-xs text-muted-foreground">
              提出済み / 下書き: {data.monthlyDraft}件
            </p>
          </CardContent>
        </Card>

        {/* 未読コメント */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">コメント</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.commentCount}件</div>
            <p className="text-xs text-muted-foreground">
              自分の日報へのコメント
            </p>
          </CardContent>
        </Card>

        {/* クイックアクション */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              クイックアクション
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/reports/new">
                <Plus className="mr-2 h-4 w-4" />
                本日の日報を作成
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* 最近の日報 */}
      <Card>
        <CardHeader>
          <CardTitle>最近の日報</CardTitle>
        </CardHeader>
        <CardContent>
          {data.recentReports.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              まだ日報がありません
            </p>
          ) : (
            <div className="space-y-2">
              {data.recentReports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">{report.date}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        report.status === "submitted"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {report.status === "submitted" ? "提出済み" : "下書き"}
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/reports/${report.id}`}>詳細</Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
