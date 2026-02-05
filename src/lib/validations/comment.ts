import { z } from "zod";

/**
 * コメント関連バリデーションスキーマ
 */

// コメント作成リクエスト
export const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, "コメント内容を入力してください")
    .max(10000, "コメントは10000文字以内で入力してください"),
});

export type CreateCommentRequest = z.infer<typeof createCommentSchema>;

// コメント更新リクエスト
export const updateCommentSchema = z.object({
  content: z
    .string()
    .min(1, "コメント内容を入力してください")
    .max(10000, "コメントは10000文字以内で入力してください"),
});

export type UpdateCommentRequest = z.infer<typeof updateCommentSchema>;

// コメントパラメータ（URLパス用）
export const commentParamsSchema = z.object({
  report_id: z.coerce
    .number()
    .int()
    .positive("日報IDは正の整数を指定してください"),
  id: z.coerce
    .number()
    .int()
    .positive("コメントIDは正の整数を指定してください")
    .optional(),
});

export type CommentParams = z.infer<typeof commentParamsSchema>;
