"use client";

import { Header, MobileNav, Sidebar } from "@/components/layout";
import { useState } from "react";

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

/**
 * 認証済みユーザー用のレイアウト
 * ヘッダー、サイドバー（デスクトップ）、モバイルナビゲーションを含む
 */
export default function AuthenticatedLayout({
  children,
}: AuthenticatedLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMenuToggle = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const handleMenuClose = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ヘッダー */}
      <Header onMenuToggle={handleMenuToggle} isMenuOpen={isMobileMenuOpen} />

      {/* モバイルナビゲーション */}
      <MobileNav isOpen={isMobileMenuOpen} onClose={handleMenuClose} />

      {/* メインコンテンツエリア */}
      <div className="flex">
        {/* デスクトップサイドバー */}
        <Sidebar className="sticky top-14 h-[calc(100vh-3.5rem)]" />

        {/* コンテンツ */}
        <main className="flex-1 p-4 lg:p-6">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
