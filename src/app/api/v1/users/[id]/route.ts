import { authenticateRequest, hashPassword, isAuthError } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateUserSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = await authenticateRequest(request);
  if (isAuthError(authResult)) {
    return authResult;
  }

  if (authResult.role !== "ADMIN") {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "この操作を行う権限がありません",
        },
      },
      { status: 403 },
    );
  }

  const { id } = await params;
  const userId = Number(id);
  if (Number.isNaN(userId)) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "VALIDATION_ERROR", message: "無効なユーザーIDです" },
      },
      { status: 400 },
    );
  }

  try {
    const existing = await prisma.user.findUnique({ where: { id: userId } });
    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "NOT_FOUND", message: "ユーザーが見つかりません" },
        },
        { status: 404 },
      );
    }

    await prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });

    revalidatePath("/users");

    return NextResponse.json({
      success: true,
      data: { message: "ユーザーを削除しました" },
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "サーバーエラーが発生しました",
        },
      },
      { status: 500 },
    );
  }
}

const ROLE_MAP: Record<string, "SALES" | "MANAGER" | "ADMIN"> = {
  sales: "SALES",
  manager: "MANAGER",
  admin: "ADMIN",
};

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = await authenticateRequest(request);
  if (isAuthError(authResult)) {
    return authResult;
  }

  if (authResult.role !== "ADMIN") {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "この操作を行う権限がありません",
        },
      },
      { status: 403 },
    );
  }

  const { id } = await params;
  const userId = Number(id);
  if (Number.isNaN(userId)) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "VALIDATION_ERROR", message: "無効なユーザーIDです" },
      },
      { status: 400 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "リクエストボディが不正なJSON形式です",
        },
      },
      { status: 400 },
    );
  }

  try {
    const parsed = updateUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: parsed.error.errors[0].message,
          },
        },
        { status: 400 },
      );
    }

    const existing = await prisma.user.findUnique({ where: { id: userId } });
    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "ユーザーが見つかりません",
          },
        },
        { status: 404 },
      );
    }

    const {
      name,
      email,
      password,
      department_id,
      role,
      manager_id,
      is_active,
    } = parsed.data;

    // メール重複チェック
    if (email && email !== existing.email) {
      const dup = await prisma.user.findUnique({ where: { email } });
      if (dup) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "DUPLICATE_EMAIL",
              message: "このメールアドレスは既に登録されています",
            },
          },
          { status: 400 },
        );
      }
    }

    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name;
    if (email !== undefined) data.email = email;
    if (password) data.passwordHash = await hashPassword(password);
    if (department_id !== undefined) data.departmentId = department_id;
    if (role !== undefined) data.role = ROLE_MAP[role] ?? existing.role;
    if (manager_id !== undefined) data.managerId = manager_id;
    if (is_active !== undefined) data.isActive = is_active;

    const user = await prisma.user.update({
      where: { id: userId },
      data,
    });

    revalidatePath("/users");

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.toLowerCase(),
        is_active: user.isActive,
      },
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "サーバーエラーが発生しました",
        },
      },
      { status: 500 },
    );
  }
}
