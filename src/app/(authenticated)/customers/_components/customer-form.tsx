"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

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
import { Textarea } from "@/components/ui/textarea";
import {
  type CreateCustomerRequest,
  createCustomerSchema,
} from "@/lib/validations";

interface CustomerData {
  id: number;
  name: string;
  address: string | null;
  phone: string | null;
  contactPerson: string | null;
  email: string | null;
  notes: string | null;
}

interface CustomerFormProps {
  customer?: CustomerData;
}

export function CustomerForm({ customer }: CustomerFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const isEdit = !!customer;

  const form = useForm<CreateCustomerRequest>({
    resolver: zodResolver(createCustomerSchema),
    defaultValues: {
      name: customer?.name ?? "",
      address: customer?.address ?? "",
      phone: customer?.phone ?? "",
      contact_person: customer?.contactPerson ?? "",
      email: customer?.email ?? "",
      notes: customer?.notes ?? "",
    },
  });

  const onSubmit = async (values: CreateCustomerRequest) => {
    setServerError(null);

    try {
      const url = isEdit
        ? `/api/v1/customers/${customer.id}`
        : "/api/v1/customers";
      const method = isEdit ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        if (response.status === 403) {
          setServerError("この操作を行う権限がありません。");
          return;
        }
        setServerError(
          result.error?.message ??
            (isEdit
              ? "顧客の更新に失敗しました。"
              : "顧客の登録に失敗しました。"),
        );
        return;
      }

      router.push("/customers");
    } catch {
      setServerError(
        "サーバーとの通信に失敗しました。しばらく経ってから再度お試しください。",
      );
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{isEdit ? "顧客編集" : "顧客登録"}</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">顧客情報</CardTitle>
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
                      顧客名 <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="例: 株式会社ABC" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>住所</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="例: 東京都千代田区丸の内1-1-1"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>電話番号</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="例: 03-1234-5678"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contact_person"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>担当者名</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="例: 田中一郎"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>メールアドレス</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="例: tanaka@abc.co.jp"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>備考</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="備考を入力してください"
                        rows={3}
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                  onClick={() => router.push("/customers")}
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
