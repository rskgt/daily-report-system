"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Menu, User } from "lucide-react";
import Link from "next/link";

interface HeaderProps {
  /** モバイルメニューの開閉を制御する関数 */
  onMenuToggle: () => void;
  /** モバイルメニューが開いているかどうか */
  isMenuOpen: boolean;
}

/**
 * 認証済みユーザー向けヘッダーコンポーネント
 * ロゴ、ユーザー情報、ログアウトボタンを表示
 */
export function Header({ onMenuToggle, isMenuOpen }: HeaderProps) {
  // TODO: 認証機能実装後、実際のユーザー情報に置き換え
  const mockUser = {
    name: "山田太郎",
    email: "yamada@example.com",
    role: "sales" as const,
  };

  // ユーザー名からイニシャルを取得
  const getInitials = (name: string): string => {
    const parts = name.split(/\s+/);
    if (parts.length >= 2) {
      return parts[0].charAt(0) + parts[1].charAt(0);
    }
    return name.slice(0, 2);
  };

  const handleLogout = () => {
    // TODO: 認証機能実装後、実際のログアウト処理に置き換え
    console.log("ログアウト処理");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4 lg:px-6">
        {/* モバイルメニューボタン */}
        <Button
          variant="ghost"
          size="icon"
          className="mr-2 lg:hidden"
          onClick={onMenuToggle}
          aria-label={isMenuOpen ? "メニューを閉じる" : "メニューを開く"}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* ロゴとシステム名 */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-semibold"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span className="text-sm font-bold">営</span>
          </div>
          <span className="hidden text-lg sm:inline-block">
            営業日報システム
          </span>
        </Link>

        {/* スペーサー */}
        <div className="flex-1" />

        {/* ユーザーメニュー */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative flex items-center gap-2 px-2"
              aria-label="ユーザーメニューを開く"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {getInitials(mockUser.name)}
                </AvatarFallback>
              </Avatar>
              <span className="hidden text-sm font-medium md:inline-block">
                {mockUser.name}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="flex items-center gap-2 p-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {getInitials(mockUser.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {mockUser.name}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {mockUser.email}
                </p>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile" className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                プロフィール
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              ログアウト
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
