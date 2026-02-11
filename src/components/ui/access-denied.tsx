import { ShieldAlert } from "lucide-react";
import Link from "next/link";
import { Button } from "./button";
import { Card, CardContent } from "./card";

interface AccessDeniedProps {
  backHref: string;
  backLabel?: string;
}

export function AccessDenied({
  backHref,
  backLabel = "一覧に戻る",
}: AccessDeniedProps) {
  return (
    <div className="flex items-center justify-center py-12">
      <Card className="max-w-md w-full">
        <CardContent className="flex flex-col items-center gap-4 pt-6">
          <ShieldAlert className="h-12 w-12 text-destructive" />
          <h2 className="text-lg font-semibold">アクセス権限がありません</h2>
          <p className="text-sm text-muted-foreground text-center">
            この操作を行う権限がありません。
          </p>
          <Button asChild variant="outline">
            <Link href={backHref}>{backLabel}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
