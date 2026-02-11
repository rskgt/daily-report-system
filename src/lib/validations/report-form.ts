import { z } from "zod";

/**
 * 日報作成フォーム用バリデーションスキーマ
 * フォーム入力に適した型定義（datetime-local対応等）
 */

// 訪問記録フォームスキーマ
export const visitRecordFormSchema = z.object({
  visit_datetime: z.string().min(1, "訪問日時を入力してください"),
  customer_id: z.string().min(1, "顧客を選択してください"),
  purpose: z
    .string()
    .min(1, "訪問目的を入力してください")
    .max(200, "訪問目的は200文字以内で入力してください"),
  content: z.string().min(1, "訪問内容を入力してください"),
  problem: z.string(),
  plan: z.string(),
});

export type VisitRecordFormValues = z.infer<typeof visitRecordFormSchema>;

// 日報作成フォームスキーマ
export const reportFormSchema = z.object({
  report_date: z.string().min(1, "報告日を入力してください"),
  visit_records: z
    .array(visitRecordFormSchema)
    .min(1, "訪問記録を1件以上入力してください"),
});

export type ReportFormValues = z.infer<typeof reportFormSchema>;

/**
 * フォーム値をAPIリクエスト形式に変換する
 */
export function toCreateReportRequest(
  values: ReportFormValues,
  status: "draft" | "submitted",
) {
  return {
    report_date: values.report_date,
    status,
    visit_records: values.visit_records.map((record, index) => ({
      visit_datetime: new Date(record.visit_datetime).toISOString(),
      customer_id: Number(record.customer_id),
      purpose: record.purpose,
      content: record.content,
      problem: record.problem || null,
      plan: record.plan || null,
      display_order: index + 1,
    })),
  };
}
