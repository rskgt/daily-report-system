import { z } from "zod";
import { emailSchema } from "./common";

/**
 * 認証関連バリデーションスキーマ
 */

// ログインリクエスト
export const loginRequestSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(1, "パスワードを入力してください")
    .max(255, "パスワードは255文字以内で入力してください"),
});

export type LoginRequest = z.infer<typeof loginRequestSchema>;

// パスワード変更リクエスト
export const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, "現在のパスワードを入力してください"),
    new_password: z
      .string()
      .min(8, "新しいパスワードは8文字以上で入力してください")
      .max(255, "新しいパスワードは255文字以内で入力してください")
      .regex(
        /^(?=.*[a-zA-Z])(?=.*\d)/,
        "パスワードは英字と数字を含む必要があります",
      ),
    confirm_password: z.string().min(1, "確認用パスワードを入力してください"),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "新しいパスワードと確認用パスワードが一致しません",
    path: ["confirm_password"],
  })
  .refine((data) => data.current_password !== data.new_password, {
    message: "新しいパスワードは現在のパスワードと異なるものを設定してください",
    path: ["new_password"],
  });

export type ChangePasswordRequest = z.infer<typeof changePasswordSchema>;
