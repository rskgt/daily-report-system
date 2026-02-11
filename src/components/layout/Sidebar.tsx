"use client";

import { cn } from "@/lib/utils";
import {
  Building2,
  FileText,
  LayoutDashboard,
  type LucideIcon,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** 管理者のみ表示するか */
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  {
    href: "/dashboard",
    label: "ダッシュボード",
    icon: LayoutDashboard,
  },
  {
    href: "/reports",
    label: "日報一覧",
    icon: FileText,
  },
  {
    href: "/customers",
    label: "顧客管理",
    icon: Building2,
  },
  {
    href: "/users",
    label: "ユーザー管理",
    icon: Users,
    adminOnly: true,
  },
];

interface SidebarProps {
  className?: string;
}

/**
 * デスクトップ用サイドバーナビゲーション
 * 画面左側に固定表示され、主要なナビゲーションリンクを提供
 */
export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  // TODO: 認証機能実装後、実際のユーザー権限に基づいてフィルタリング
  // 現時点では全ての項目を表示
  const visibleNavItems = navItems;

  return (
    <aside
      className={cn(
        "hidden lg:flex lg:flex-col lg:w-64 lg:border-r lg:bg-muted/30",
        className,
      )}
    >
      <nav className="flex-1 space-y-1 p-4" aria-label="メインナビゲーション">
        {visibleNavItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
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
    </aside>
  );
}

/**
 * ナビゲーション項目をエクスポート（モバイルナビゲーションでも使用）
 */
export { navItems };
export type { NavItem };
