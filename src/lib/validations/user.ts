import { z } from "zod";
import { emailSchema, paginationSchema, userRoleSchema } from "./common";

/**
 * ユーザー関連バリデーションスキーマ
 */

// ユーザー作成リクエスト
export const createUserSchema = z.object({
  name: z
    .string()
    .min(1, "氏名を入力してください")
    .max(100, "氏名は100文字以内で入力してください"),
  email: emailSchema,
  password: z
    .string()
    .min(8, "パスワードは8文字以上で入力してください")
    .max(255, "パスワードは255文字以内で入力してください")
    .regex(
      /^(?=.*[a-zA-Z])(?=.*\d)/,
      "パスワードは英字と数字を含む必要があります",
    ),
  department_id: z.coerce
    .number()
    .int()
    .positive("部署IDは正の整数を指定してください")
    .optional()
    .nullable(),
  role: userRoleSchema,
  manager_id: z.coerce
    .number()
    .int()
    .positive("上長IDは正の整数を指定してください")
    .optional()
    .nullable(),
});

export type CreateUserRequest = z.infer<typeof createUserSchema>;

// ユーザー更新リクエスト
export const updateUserSchema = z.object({
  name: z
    .string()
    .min(1, "氏名を入力してください")
    .max(100, "氏名は100文字以内で入力してください")
    .optional(),
  email: emailSchema.optional(),
  password: z
    .string()
    .min(8, "パスワードは8文字以上で入力してください")
    .max(255, "パスワードは255文字以内で入力してください")
    .regex(
      /^(?=.*[a-zA-Z])(?=.*\d)/,
      "パスワードは英字と数字を含む必要があります",
    )
    .optional(),
  department_id: z.coerce
    .number()
    .int()
    .positive("部署IDは正の整数を指定してください")
    .optional()
    .nullable(),
  role: userRoleSchema.optional(),
  manager_id: z.coerce
    .number()
    .int()
    .positive("上長IDは正の整数を指定してください")
    .optional()
    .nullable(),
  is_active: z.boolean().optional(),
});

export type UpdateUserRequest = z.infer<typeof updateUserSchema>;

// ユーザー一覧検索パラメータ
export const userSearchSchema = paginationSchema.extend({
  department_id: z.coerce
    .number()
    .int()
    .positive("部署IDは正の整数を指定してください")
    .optional(),
  role: userRoleSchema.optional(),
});

export type UserSearchParams = z.infer<typeof userSearchSchema>;
