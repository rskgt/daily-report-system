import { z } from "zod";

/**
 * 共通バリデーションスキーマ
 */

// ページネーションパラメータ
export const paginationSchema = z.object({
  page: z.coerce
    .number()
    .int()
    .min(1, "ページ番号は1以上を指定してください")
    .optional()
    .default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1, "取得件数は1以上を指定してください")
    .max(100, "取得件数は100以下を指定してください")
    .optional()
    .default(20),
});

export type PaginationParams = z.infer<typeof paginationSchema>;

// 日付範囲検索パラメータ（基本オブジェクト）
export const dateRangeBaseSchema = z.object({
  start_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "日付はYYYY-MM-DD形式で入力してください")
    .optional(),
  end_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "日付はYYYY-MM-DD形式で入力してください")
    .optional(),
});

// 日付範囲検索パラメータ（refine付き）
export const dateRangeSchema = dateRangeBaseSchema.refine(
  (data) => {
    if (data.start_date && data.end_date) {
      return new Date(data.start_date) <= new Date(data.end_date);
    }
    return true;
  },
  {
    message: "開始日は終了日以前の日付を指定してください",
    path: ["start_date"],
  },
);

export type DateRangeParams = z.infer<typeof dateRangeSchema>;

// キーワード検索パラメータ
export const keywordSearchSchema = z.object({
  keyword: z
    .string()
    .max(100, "検索キーワードは100文字以内で入力してください")
    .optional(),
});

export type KeywordSearchParams = z.infer<typeof keywordSearchSchema>;

// IDパラメータ
export const idParamSchema = z.object({
  id: z.coerce.number().int().positive("IDは正の整数を指定してください"),
});

export type IdParam = z.infer<typeof idParamSchema>;

// ユーザーロール
export const userRoleSchema = z.enum(["sales", "manager", "admin"], {
  errorMap: () => ({
    message: "役職はsales、manager、adminのいずれかを指定してください",
  }),
});

export type UserRole = z.infer<typeof userRoleSchema>;

// 日報ステータス
export const reportStatusSchema = z.enum(["draft", "submitted"], {
  errorMap: () => ({
    message: "ステータスはdraftまたはsubmittedを指定してください",
  }),
});

export type ReportStatus = z.infer<typeof reportStatusSchema>;

// メールアドレスバリデーション
export const emailSchema = z
  .string()
  .min(1, "メールアドレスを入力してください")
  .max(255, "メールアドレスは255文字以内で入力してください")
  .email("有効なメールアドレス形式で入力してください");

// 電話番号バリデーション（日本の電話番号形式）
export const phoneSchema = z
  .string()
  .max(20, "電話番号は20文字以内で入力してください")
  .regex(
    /^[\d\-+()]*$/,
    "電話番号は数字、ハイフン、括弧、プラス記号のみ使用できます",
  )
  .optional()
  .nullable();

// 日時文字列バリデーション（ISO 8601形式）
export const datetimeSchema = z
  .string()
  .datetime({ message: "日時はISO 8601形式で入力してください" });

// 日付文字列バリデーション（YYYY-MM-DD形式）
export const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "日付はYYYY-MM-DD形式で入力してください");
