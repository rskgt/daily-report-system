"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "./button";

interface DeleteButtonProps {
  endpoint: string;
  confirmMessage: string;
}

export function DeleteButton({ endpoint, confirmMessage }: DeleteButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(endpoint, { method: "DELETE" });
      const result = await response.json();

      if (!response.ok || !result.success) {
        alert(result.error?.message ?? "削除に失敗しました。");
        return;
      }

      router.refresh();
    } catch {
      alert("サーバーとの通信に失敗しました。");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-destructive hover:text-destructive"
    >
      {isDeleting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
    </Button>
  );
}
