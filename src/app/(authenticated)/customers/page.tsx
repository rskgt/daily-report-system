import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteButton } from "@/components/ui/delete-button";
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
import { Plus } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

async function getCustomers() {
  return prisma.customer.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    take: 500,
  });
}

/**
 * 顧客一覧画面
 * 全ロール閲覧可。MANAGER/ADMINのみ新規登録・編集・削除が可能。
 */
export default async function CustomersPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_TOKEN_COOKIE)?.value;
  if (!token) {
    redirect("/login");
  }

  let role: string;
  try {
    const payload = verifyToken(token);
    role = payload.role;
  } catch {
    redirect("/login");
  }

  const customers = await getCustomers();
  const canEdit = role === "ADMIN" || role === "MANAGER";
  const canDelete = role === "ADMIN";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">顧客管理</h1>
        {canEdit && (
          <Button asChild>
            <Link href="/customers/new">
              <Plus className="mr-2 h-4 w-4" />
              新規登録
            </Link>
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">顧客一覧</CardTitle>
        </CardHeader>
        <CardContent>
          {customers.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              顧客が登録されていません
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>顧客名</TableHead>
                  <TableHead>担当者</TableHead>
                  <TableHead>電話番号</TableHead>
                  <TableHead>メールアドレス</TableHead>
                  <TableHead>住所</TableHead>
                  {canEdit && (
                    <TableHead className="text-right">操作</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">
                      {customer.name}
                    </TableCell>
                    <TableCell>{customer.contactPerson ?? "-"}</TableCell>
                    <TableCell>{customer.phone ?? "-"}</TableCell>
                    <TableCell>{customer.email ?? "-"}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {customer.address ?? "-"}
                    </TableCell>
                    {canEdit && (
                      <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/customers/${customer.id}/edit`}>
                            編集
                          </Link>
                        </Button>
                        {canDelete && (
                          <DeleteButton
                            endpoint={`/api/v1/customers/${customer.id}`}
                            confirmMessage={`「${customer.name}」を削除しますか？`}
                          />
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
