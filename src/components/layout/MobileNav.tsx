"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "./Sidebar";

interface MobileNavProps {
  /** シートが開いているかどうか */
  isOpen: boolean;
  /** シートを閉じる関数 */
  onClose: () => void;
}

/**
 * モバイル用ナビゲーションドロワー
 * 画面左からスライドして表示
 */
export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const pathname = usePathname();

  // TODO: 認証機能実装後、実際のユーザー権限に基づいてフィルタリング
  const visibleNavItems = navItems;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="left"
        className="w-72 p-0"
        id="mobile-navigation"
        aria-label="モバイルナビゲーション"
      >
        <SheetHeader className="border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <span className="text-sm font-bold">営</span>
              </div>
              <span className="text-lg">営業日報システム</span>
            </SheetTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label="メニューを閉じる"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </SheetHeader>

        <nav className="flex-1 space-y-1 p-4" aria-label="メインナビゲーション">
          {visibleNavItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
