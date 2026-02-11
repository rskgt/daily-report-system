import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AUTH_TOKEN_COOKIE, verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, Pencil } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CommentSection } from "./_components/CommentSection";

async function getReport(reportId: number, userId: number, role: string) {
  const report = await prisma.dailyReport.findUnique({
    where: { id: reportId },
    include: {
      user: {
        select: { id: true, name: true },
      },
      visitRecords: {
        orderBy: { displayOrder: "asc" },
        include: {
          customer: {
            select: { id: true, name: true },
          },
        },
      },
      comments: {
        orderBy: { createdAt: "asc" },
        include: {
          user: {
            select: { id: true, name: true },
          },
        },
      },
    },
  });

  if (!report) return null;

  // 自分の日報、または上長・管理者のみ閲覧可
  const isOwner = report.userId === userId;
  const isManagerOrAdmin = role === "MANAGER" || role === "ADMIN";
  if (!isOwner && !isManagerOrAdmin) return null;

  return report;
}

function formatDate(date: Date) {
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatDateTime(date: Date) {
  return date.toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
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

  const { id } = await params;
  const reportId = Number(id);
  if (Number.isNaN(reportId)) {
    notFound();
  }

  const report = await getReport(reportId, userId, role);
  if (!report) {
    notFound();
  }

  const isOwner = report.userId === userId;
  const isDraft = report.status === "DRAFT";

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">日報詳細</h1>
        <div className="flex gap-2">
          {isOwner && isDraft && (
            <Button variant="outline" asChild>
              <Link href={`/reports/${report.id}/edit`}>
                <Pencil className="mr-2 h-4 w-4" />
                編集
              </Link>
            </Button>
          )}
          <Button variant="ghost" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              一覧に戻る
            </Link>
          </Button>
        </div>
      </div>

      {/* 基本情報 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">報告日: </span>
              <span className="font-medium">
                {formatDate(report.reportDate)}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">担当者: </span>
              <span className="font-medium">{report.user.name}</span>
            </div>
            <div>
              <span className="text-muted-foreground">ステータス: </span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  report.status === "SUBMITTED"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {report.status === "SUBMITTED" ? "提出済み" : "下書き"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 訪問記録 */}
      {report.visitRecords.map((record, index) => (
        <Card key={record.id}>
          <CardHeader>
            <CardTitle className="text-base">訪問記録 #{index + 1}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">訪問日時</p>
                <p className="text-sm font-medium">
                  {formatDateTime(record.visitDatetime)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">顧客</p>
                <p className="text-sm font-medium">{record.customer.name}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">訪問目的</p>
              <p className="text-sm font-medium">{record.purpose}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">訪問内容</p>
              <p className="whitespace-pre-wrap text-sm">{record.content}</p>
            </div>

            {record.problem && (
              <div>
                <p className="text-sm text-muted-foreground">課題（Problem）</p>
                <p className="whitespace-pre-wrap text-sm">{record.problem}</p>
              </div>
            )}

            {record.plan && (
              <div>
                <p className="text-sm text-muted-foreground">計画（Plan）</p>
                <p className="whitespace-pre-wrap text-sm">{record.plan}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {/* コメント */}
      <Card>
        <CardHeader>
          <CardTitle>コメント</CardTitle>
        </CardHeader>
        <CardContent>
          <CommentSection
            reportId={report.id}
            comments={report.comments.map((c) => ({
              id: c.id,
              content: c.content,
              user: c.user,
              createdAt: c.createdAt.toISOString(),
            }))}
            canComment={role === "MANAGER" || role === "ADMIN" || isOwner}
            currentUserId={userId}
            currentUserRole={role}
          />
        </CardContent>
      </Card>
    </div>
  );
}
