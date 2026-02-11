"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";

interface ReportFiltersProps {
  showUserFilter: boolean;
}

export function ReportFilters({ showUserFilter }: ReportFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [userName, setUserName] = useState(searchParams.get("user_name") ?? "");
  const [dateFrom, setDateFrom] = useState(searchParams.get("date_from") ?? "");
  const [dateTo, setDateTo] = useState(searchParams.get("date_to") ?? "");
  const [status, setStatus] = useState(searchParams.get("status") ?? "all");

  const applyFilters = useCallback(() => {
    const params = new URLSearchParams();
    if (userName.trim()) params.set("user_name", userName.trim());
    if (dateFrom) params.set("date_from", dateFrom);
    if (dateTo) params.set("date_to", dateTo);
    if (status && status !== "all") params.set("status", status);

    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }, [userName, dateFrom, dateTo, status, pathname, router]);

  const clearFilters = useCallback(() => {
    setUserName("");
    setDateFrom("");
    setDateTo("");
    setStatus("all");
    router.push(pathname);
  }, [pathname, router]);

  const hasFilters =
    userName.trim() || dateFrom || dateTo || (status && status !== "all");

  return (
    <div className="flex flex-wrap items-end gap-3">
      {showUserFilter && (
        <div className="space-y-1">
          <label
            htmlFor="filter-user-name"
            className="text-xs text-muted-foreground"
          >
            投稿者名
          </label>
          <Input
            id="filter-user-name"
            placeholder="名前で検索"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="h-9 w-36"
          />
        </div>
      )}
      <div className="space-y-1">
        <label
          htmlFor="filter-date-from"
          className="text-xs text-muted-foreground"
        >
          開始日
        </label>
        <Input
          id="filter-date-from"
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="h-9 w-40"
        />
      </div>
      <div className="space-y-1">
        <label
          htmlFor="filter-date-to"
          className="text-xs text-muted-foreground"
        >
          終了日
        </label>
        <Input
          id="filter-date-to"
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="h-9 w-40"
        />
      </div>
      <div className="space-y-1">
        <span className="text-xs text-muted-foreground">ステータス</span>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="h-9 w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべて</SelectItem>
            <SelectItem value="confirmed">確認済み</SelectItem>
            <SelectItem value="unconfirmed">未確認</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button size="sm" className="h-9" onClick={applyFilters}>
        <Search className="mr-1 h-3.5 w-3.5" />
        検索
      </Button>
      {hasFilters && (
        <Button
          size="sm"
          variant="ghost"
          className="h-9"
          onClick={clearFilters}
        >
          <X className="mr-1 h-3.5 w-3.5" />
          クリア
        </Button>
      )}
    </div>
  );
}
