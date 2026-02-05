import { z } from "zod";
import { keywordSearchSchema, paginationSchema, phoneSchema } from "./common";

/**
 * 顧客関連バリデーションスキーマ
 */

// 顧客作成リクエスト
export const createCustomerSchema = z.object({
  name: z
    .string()
    .min(1, "顧客名を入力してください")
    .max(200, "顧客名は200文字以内で入力してください"),
  address: z
    .string()
    .max(500, "住所は500文字以内で入力してください")
    .optional()
    .nullable(),
  phone: phoneSchema,
  contact_person: z
    .string()
    .max(100, "担当者名は100文字以内で入力してください")
    .optional()
    .nullable(),
  email: z
    .string()
    .max(255, "メールアドレスは255文字以内で入力してください")
    .email("有効なメールアドレス形式で入力してください")
    .optional()
    .nullable()
    .or(z.literal("")),
  notes: z.string().optional().nullable(),
});

export type CreateCustomerRequest = z.infer<typeof createCustomerSchema>;

// 顧客更新リクエスト
export const updateCustomerSchema = z.object({
  name: z
    .string()
    .min(1, "顧客名を入力してください")
    .max(200, "顧客名は200文字以内で入力してください")
    .optional(),
  address: z
    .string()
    .max(500, "住所は500文字以内で入力してください")
    .optional()
    .nullable(),
  phone: phoneSchema,
  contact_person: z
    .string()
    .max(100, "担当者名は100文字以内で入力してください")
    .optional()
    .nullable(),
  email: z
    .string()
    .max(255, "メールアドレスは255文字以内で入力してください")
    .email("有効なメールアドレス形式で入力してください")
    .optional()
    .nullable()
    .or(z.literal("")),
  notes: z.string().optional().nullable(),
  is_active: z.boolean().optional(),
});

export type UpdateCustomerRequest = z.infer<typeof updateCustomerSchema>;

// 顧客一覧検索パラメータ
export const customerSearchSchema = paginationSchema.merge(keywordSearchSchema);

export type CustomerSearchParams = z.infer<typeof customerSearchSchema>;
