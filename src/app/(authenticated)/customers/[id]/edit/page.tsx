import { AccessDenied } from "@/components/ui/access-denied";
import { AUTH_TOKEN_COOKIE, verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { CustomerForm } from "../../_components/customer-form";

export default async function CustomerEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_TOKEN_COOKIE)?.value;
  if (!token) {
    redirect("/login");
  }

  let role: string;
  try {
    const payload = verifyToken(token);
    role = payload.role;
  } catch {
    redirect("/login");
  }

  if (role !== "ADMIN" && role !== "MANAGER") {
    return <AccessDenied backHref="/customers" />;
  }

  const { id } = await params;
  const customerId = Number(id);
  if (Number.isNaN(customerId)) {
    notFound();
  }

  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    select: {
      id: true,
      name: true,
      address: true,
      phone: true,
      contactPerson: true,
      email: true,
      notes: true,
    },
  });

  if (!customer) {
    notFound();
  }

  return <CustomerForm customer={customer} />;
}
