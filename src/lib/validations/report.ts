import { z } from "zod";
import {
  dateRangeBaseSchema,
  dateSchema,
  datetimeSchema,
  paginationSchema,
  reportStatusSchema,
} from "./common";

/**
 * 日報関連バリデーションスキーマ
 */

// 訪問記録スキーマ（作成時）
export const createVisitRecordSchema = z.object({
  visit_datetime: datetimeSchema,
  customer_id: z.coerce
    .number()
    .int()
    .positive("顧客IDは正の整数を指定してください"),
  purpose: z
    .string()
    .min(1, "訪問目的を入力してください")
    .max(200, "訪問目的は200文字以内で入力してください"),
  content: z.string().min(1, "訪問内容を入力してください"),
  problem: z.string().optional().nullable(),
  plan: z.string().optional().nullable(),
  display_order: z.coerce
    .number()
    .int()
    .min(1, "表示順は1以上を指定してください"),
});

export type CreateVisitRecordInput = z.infer<typeof createVisitRecordSchema>;

// 訪問記録スキーマ（更新時）
export const updateVisitRecordSchema = z.object({
  id: z.coerce
    .number()
    .int()
    .positive("訪問記録IDは正の整数を指定してください")
    .optional(),
  visit_datetime: datetimeSchema,
  customer_id: z.coerce
    .number()
    .int()
    .positive("顧客IDは正の整数を指定してください"),
  purpose: z
    .string()
    .min(1, "訪問目的を入力してください")
    .max(200, "訪問目的は200文字以内で入力してください"),
  content: z.string().min(1, "訪問内容を入力してください"),
  problem: z.string().optional().nullable(),
  plan: z.string().optional().nullable(),
  display_order: z.coerce
    .number()
    .int()
    .min(1, "表示順は1以上を指定してください"),
});

export type UpdateVisitRecordInput = z.infer<typeof updateVisitRecordSchema>;

// 日報作成リクエスト
export const createReportSchema = z.object({
  report_date: dateSchema,
  status: reportStatusSchema.optional().default("draft"),
  visit_records: z
    .array(createVisitRecordSchema)
    .min(1, "訪問記録を1件以上入力してください"),
});

export type CreateReportRequest = z.infer<typeof createReportSchema>;

// 日報更新リクエスト
export const updateReportSchema = z.object({
  status: reportStatusSchema.optional(),
  visit_records: z
    .array(updateVisitRecordSchema)
    .min(1, "訪問記録を1件以上入力してください")
    .optional(),
});

export type UpdateReportRequest = z.infer<typeof updateReportSchema>;

// 日報一覧検索パラメータ（基本スキーマ）
const reportSearchBaseSchema = paginationSchema
  .merge(dateRangeBaseSchema)
  .extend({
    user_id: z.coerce
      .number()
      .int()
      .positive("ユーザーIDは正の整数を指定してください")
      .optional(),
    status: reportStatusSchema.optional(),
  });

// 日報一覧検索パラメータ（日付範囲バリデーション付き）
export const reportSearchSchema = reportSearchBaseSchema.refine(
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

export type ReportSearchParams = z.infer<typeof reportSearchSchema>;
