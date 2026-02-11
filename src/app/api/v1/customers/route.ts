import { authenticateRequest, isAuthError } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createCustomerSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const authResult = await authenticateRequest(request);
  if (isAuthError(authResult)) {
    return authResult;
  }

  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get("keyword") || "";

    const where = {
      isActive: true,
      ...(keyword && {
        OR: [
          { name: { contains: keyword } },
          { contactPerson: { contains: keyword } },
        ],
      }),
    };

    const customers = await prisma.customer.findMany({
      where,
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: {
        customers: customers.map((c) => ({
          id: c.id,
          name: c.name,
          address: c.address,
          phone: c.phone,
          contact_person: c.contactPerson,
          email: c.email,
          notes: c.notes,
          is_active: c.isActive,
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

  if (authResult.role !== "ADMIN" && authResult.role !== "MANAGER") {
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
    const parsed = createCustomerSchema.safeParse(body);
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

    const { name, address, phone, contact_person, email, notes } = parsed.data;

    const customer = await prisma.customer.create({
      data: {
        name,
        address: address ?? null,
        phone: phone ?? null,
        contactPerson: contact_person ?? null,
        email: email || null,
        notes: notes ?? null,
      },
    });

    revalidatePath("/customers");

    return NextResponse.json(
      {
        success: true,
        data: {
          id: customer.id,
          name: customer.name,
          address: customer.address,
          phone: customer.phone,
          contact_person: customer.contactPerson,
          email: customer.email,
          notes: customer.notes,
          is_active: customer.isActive,
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
