"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";

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
import { Textarea } from "@/components/ui/textarea";
import {
  type ReportFormValues,
  reportFormSchema,
  toCreateReportRequest,
} from "@/lib/validations/report-form";

// TODO: 顧客APIから取得する
const mockCustomers = [
  { id: 1, name: "株式会社ABC" },
  { id: 2, name: "株式会社XYZ" },
  { id: 3, name: "有限会社テスト" },
];

function getTodayString() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const defaultVisitRecord = {
  visit_datetime: "",
  customer_id: "",
  purpose: "",
  content: "",
  problem: "",
  plan: "",
};

export default function ReportNewPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      report_date: getTodayString(),
      visit_records: [{ ...defaultVisitRecord }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "visit_records",
  });

  const handleSave = async (status: "draft" | "submitted") => {
    const isValid = await form.trigger();
    if (!isValid) return;

    setServerError(null);
    const values = form.getValues();
    const requestBody = toCreateReportRequest(values, status);

    try {
      const response = await fetch("/api/v1/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setServerError(result.error?.message ?? "日報の保存に失敗しました。");
        return;
      }

      router.push("/dashboard");
    } catch {
      setServerError(
        "サーバーとの通信に失敗しました。しばらく経ってから再度お試しください。",
      );
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">日報作成</h1>

      <Form {...form}>
        <form noValidate className="space-y-6">
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
            name="report_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>報告日</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {fields.map((fieldItem, index) => (
            <Card key={fieldItem.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-base">
                  訪問記録 #{index + 1}
                </CardTitle>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="mr-1 h-4 w-4" />
                    削除
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name={`visit_records.${index}.visit_datetime`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>訪問日時</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`visit_records.${index}.customer_id`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>顧客</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="顧客を選択" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {mockCustomers.map((customer) => (
                              <SelectItem
                                key={customer.id}
                                value={String(customer.id)}
                              >
                                {customer.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name={`visit_records.${index}.purpose`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>訪問目的</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="例: 定期訪問、新規提案"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`visit_records.${index}.content`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>訪問内容</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="訪問の詳細内容を入力してください"
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`visit_records.${index}.problem`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>課題（Problem）</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="訪問で発見した課題や問題点"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`visit_records.${index}.plan`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>計画（Plan）</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="今後のアクションプラン"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={() => append({ ...defaultVisitRecord })}
          >
            <Plus className="mr-2 h-4 w-4" />
            訪問記録を追加
          </Button>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleSave("draft")}
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" />
                  保存中...
                </>
              ) : (
                "下書き保存"
              )}
            </Button>
            <Button
              type="button"
              onClick={() => handleSave("submitted")}
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" />
                  提出中...
                </>
              ) : (
                "提出"
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push("/dashboard")}
            >
              キャンセル
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
