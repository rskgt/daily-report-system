import { redirect } from "next/navigation";

/**
 * ルートページ
 * 現時点ではダッシュボードへリダイレクト
 * TODO: 認証機能実装後、未認証ユーザーはログイン画面へリダイレクト
 */
export default function Home() {
  redirect("/dashboard");
}
