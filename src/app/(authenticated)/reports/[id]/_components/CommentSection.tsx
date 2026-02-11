"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Comment {
  id: number;
  content: string;
  user: { id: number; name: string };
  createdAt: string;
}

interface CommentSectionProps {
  reportId: number;
  comments: Comment[];
  canComment: boolean;
  currentUserId: number;
  currentUserRole: string;
}

const STAMP_OPTIONS = [
  { label: "\uD83D\uDC4D お疲れ様！", value: "\uD83D\uDC4D お疲れ様！" },
  { label: "\uD83D\uDC4F ナイス！", value: "\uD83D\uDC4F ナイス！" },
  { label: "\u2705 確認しました", value: "\u2705 確認しました" },
];

function formatDateTime(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function CommentSection({
  reportId,
  comments: initialComments,
  canComment,
  currentUserId,
  currentUserRole,
}: CommentSectionProps) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  async function submitComment(text: string) {
    if (!text.trim()) return;

    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch(`/api/v1/reports/${reportId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });

      const json = await res.json();
      if (!json.success) {
        setError(json.error?.message || "コメントの投稿に失敗しました");
        return;
      }

      setContent("");
      router.refresh();
    } catch {
      setError("コメントの投稿に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(commentId: number) {
    if (!confirm("このコメントを削除しますか？")) return;

    setDeletingId(commentId);
    setError("");

    try {
      const res = await fetch(
        `/api/v1/reports/${reportId}/comments/${commentId}`,
        { method: "DELETE" },
      );

      const json = await res.json();
      if (!json.success) {
        setError(json.error?.message || "コメントの削除に失敗しました");
        return;
      }

      router.refresh();
    } catch {
      setError("コメントの削除に失敗しました");
    } finally {
      setDeletingId(null);
    }
  }

  function canDelete(comment: Comment) {
    return comment.user.id === currentUserId || currentUserRole === "ADMIN";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await submitComment(content);
  }

  async function handleStamp(stamp: string) {
    await submitComment(stamp);
  }

  return (
    <div className="space-y-4">
      {/* コメント一覧 */}
      {initialComments.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          コメントはまだありません
        </p>
      ) : (
        <div className="space-y-4">
          {initialComments.map((comment) => (
            <div key={comment.id}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">{comment.user.name}</span>
                  <span className="text-muted-foreground">
                    ({formatDateTime(comment.createdAt)})
                  </span>
                </div>
                {canDelete(comment) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(comment.id)}
                    disabled={deletingId === comment.id}
                  >
                    {deletingId === comment.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </Button>
                )}
              </div>
              <p className="mt-1 whitespace-pre-wrap text-sm">
                {comment.content}
              </p>
              <Separator className="mt-4" />
            </div>
          ))}
        </div>
      )}

      {/* コメント入力フォーム */}
      {canComment && (
        <div className="space-y-3 pt-2">
          {/* スタンプボタン */}
          <div className="flex flex-wrap gap-2">
            {STAMP_OPTIONS.map((stamp) => (
              <Button
                key={stamp.value}
                type="button"
                variant="outline"
                size="sm"
                disabled={isSubmitting}
                onClick={() => handleStamp(stamp.value)}
              >
                {stamp.label}
              </Button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-2">
            <Textarea
              placeholder="コメントを入力..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              disabled={isSubmitting}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex justify-end">
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting || !content.trim()}
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                コメント投稿
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
