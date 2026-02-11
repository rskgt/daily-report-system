import { authenticateRequest, hashPassword, isAuthError } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createUserSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

function adminGuard(role: string): NextResponse | null {
  if (role !== "ADMIN") {
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
  return null;
}

const ROLE_MAP: Record<string, "SALES" | "MANAGER" | "ADMIN"> = {
  sales: "SALES",
  manager: "MANAGER",
  admin: "ADMIN",
};

export async function GET(request: NextRequest) {
  const authResult = await authenticateRequest(request);
  if (isAuthError(authResult)) {
    return authResult;
  }

  const forbidden = adminGuard(authResult.role);
  if (forbidden) return forbidden;

  try {
    const users = await prisma.user.findMany({
      orderBy: { name: "asc" },
      include: {
        department: { select: { id: true, name: true } },
        manager: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        users: users.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          department: u.department
            ? { id: u.department.id, name: u.department.name }
            : null,
          role: u.role.toLowerCase(),
          manager: u.manager
            ? { id: u.manager.id, name: u.manager.name }
            : null,
          is_active: u.isActive,
        })),
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

export async function POST(request: NextRequest) {
  const authResult = await authenticateRequest(request);
  if (isAuthError(authResult)) {
    return authResult;
  }

  const forbidden = adminGuard(authResult.role);
  if (forbidden) return forbidden;

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
    const parsed = createUserSchema.safeParse(body);
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

    const { name, email, password, department_id, role, manager_id } =
      parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
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

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        departmentId: department_id ?? null,
        role: ROLE_MAP[role] ?? "SALES",
        managerId: manager_id ?? null,
      },
    });

    revalidatePath("/users");

    return NextResponse.json(
      {
        success: true,
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role.toLowerCase(),
        },
      },
      { status: 201 },
    );
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
