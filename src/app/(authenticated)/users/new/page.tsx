import { AUTH_TOKEN_COOKIE, verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { UserForm } from "../_components/user-form";

export default async function UserNewPage() {
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

  if (role !== "ADMIN") {
    notFound();
  }

  const [departments, managers] = await Promise.all([
    prisma.department.findMany({ orderBy: { name: "asc" } }),
    prisma.user.findMany({
      where: { role: { in: ["MANAGER", "ADMIN"] }, isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <UserForm
      departments={departments.map((d) => ({ id: d.id, name: d.name }))}
      managers={managers}
    />
  );
}
