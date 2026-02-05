import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, MessageSquare, Plus } from "lucide-react";
import Link from "next/link";

/**
 * ダッシュボード画面
 * ユーザーのホーム画面として、日報サマリーや未読コメント等を表示
 */
export default function DashboardPage() {
  // TODO: 実際のデータを取得して表示
  const mockData = {
    monthlySubmitted: 15,
    monthlyDraft: 2,
    unreadComments: 3,
    recentReports: [
      { id: 1, date: "2026/02/03", status: "submitted" as const },
      { id: 2, date: "2026/02/02", status: "submitted" as const },
      { id: 3, date: "2026/02/01", status: "draft" as const },
    ],
  };

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
            <div className="text-2xl font-bold">
              {mockData.monthlySubmitted}件
            </div>
            <p className="text-xs text-muted-foreground">
              提出済み / 下書き: {mockData.monthlyDraft}件
            </p>
          </CardContent>
        </Card>

        {/* 未読コメント */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">未読コメント</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockData.unreadComments}件
            </div>
            <p className="text-xs text-muted-foreground">
              新しいコメントがあります
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
          <div className="space-y-2">
            {mockData.recentReports.map((report) => (
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
        </CardContent>
      </Card>
    </div>
  );
}
