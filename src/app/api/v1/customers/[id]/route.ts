import { authenticateRequest, isAuthError } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateCustomerSchema } from "@/lib/validations";
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
  const customerId = Number(id);
  if (Number.isNaN(customerId)) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "VALIDATION_ERROR", message: "無効な顧客IDです" },
      },
      { status: 400 },
    );
  }

  try {
    const existing = await prisma.customer.findUnique({
      where: { id: customerId },
    });
    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "NOT_FOUND", message: "顧客が見つかりません" },
        },
        { status: 404 },
      );
    }

    await prisma.customer.update({
      where: { id: customerId },
      data: { isActive: false },
    });

    revalidatePath("/customers");

    return NextResponse.json({
      success: true,
      data: { message: "顧客を削除しました" },
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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

  const { id } = await params;
  const customerId = Number(id);
  if (Number.isNaN(customerId)) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "VALIDATION_ERROR", message: "無効な顧客IDです" },
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
    const parsed = updateCustomerSchema.safeParse(body);
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

    const existing = await prisma.customer.findUnique({
      where: { id: customerId },
    });
    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "顧客が見つかりません",
          },
        },
        { status: 404 },
      );
    }

    const { name, address, phone, contact_person, email, notes, is_active } =
      parsed.data;

    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name;
    if (address !== undefined) data.address = address;
    if (phone !== undefined) data.phone = phone;
    if (contact_person !== undefined) data.contactPerson = contact_person;
    if (email !== undefined) data.email = email || null;
    if (notes !== undefined) data.notes = notes;
    if (is_active !== undefined) data.isActive = is_active;

    const customer = await prisma.customer.update({
      where: { id: customerId },
      data,
    });

    revalidatePath("/customers");

    return NextResponse.json({
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
