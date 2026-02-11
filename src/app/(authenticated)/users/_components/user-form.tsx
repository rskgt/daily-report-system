"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Department {
  id: number;
  name: string;
}

interface ManagerOption {
  id: number;
  name: string;
}

interface UserData {
  id: number;
  name: string;
  email: string;
  departmentId: number | null;
  role: string;
  managerId: number | null;
  isActive: boolean;
}

interface UserFormProps {
  departments: Department[];
  managers: ManagerOption[];
  user?: UserData;
}

const formSchema = z.object({
  name: z.string().min(1, "氏名を入力してください").max(100),
  email: z
    .string()
    .min(1, "メールアドレスを入力してください")
    .email("有効なメールアドレスを入力してください"),
  password: z.string().optional(),
  department_id: z.string().optional(),
  role: z.string().min(1, "役職を選択してください"),
  manager_id: z.string().optional(),
  is_active: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

export function UserForm({ departments, managers, user }: UserFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const isEdit = !!user;

  const passwordSchema = isEdit
    ? formSchema
    : formSchema.extend({
        password: z
          .string()
          .min(8, "パスワードは8文字以上で入力してください")
          .regex(/^(?=.*[a-zA-Z])(?=.*\d)/, "英字と数字を含む必要があります"),
      });

  const form = useForm<FormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      password: "",
      department_id: user?.departmentId ? String(user.departmentId) : "",
      role: user?.role?.toLowerCase() ?? "sales",
      manager_id: user?.managerId ? String(user.managerId) : "",
      is_active: user ? String(user.isActive) : "true",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);

    const body: Record<string, unknown> = {
      name: values.name,
      email: values.email,
      role: values.role,
      department_id: values.department_id ? Number(values.department_id) : null,
      manager_id: values.manager_id ? Number(values.manager_id) : null,
    };

    if (isEdit) {
      body.is_active = values.is_active === "true";
      if (values.password) {
        body.password = values.password;
      }
    } else {
      body.password = values.password;
    }

    try {
      const url = isEdit ? `/api/v1/users/${user.id}` : "/api/v1/users";
      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setServerError(result.error?.message ?? "保存に失敗しました。");
        return;
      }

      router.push("/users");
    } catch {
      setServerError("サーバーとの通信に失敗しました。");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
        {isEdit ? "ユーザー編集" : "ユーザー登録"}
      </h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">ユーザー情報</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              noValidate
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              {serverError && (
                <div
                  role="alert"
                  className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive"
                >
                  {serverError}
                </div>
              )}

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      氏名 <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="例: 山田太郎" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      メールアドレス <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="例: yamada@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      パスワード
                      {!isEdit && <span className="text-destructive"> *</span>}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder={
                          isEdit
                            ? "変更する場合のみ入力"
                            : "英字と数字を含む8文字以上"
                        }
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="department_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>部署</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="部署を選択" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept.id} value={String(dept.id)}>
                              {dept.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        役職 <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="役職を選択" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="sales">営業担当者</SelectItem>
                          <SelectItem value="manager">上長</SelectItem>
                          <SelectItem value="admin">管理者</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="manager_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>上長</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="上長を選択（任意）" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {managers.map((m) => (
                          <SelectItem key={m.id} value={String(m.id)}>
                            {m.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {isEdit && (
                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>アカウント状態</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="true">有効</SelectItem>
                          <SelectItem value="false">無効</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin" />
                      保存中...
                    </>
                  ) : (
                    "保存"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => router.push("/users")}
                >
                  キャンセル
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
