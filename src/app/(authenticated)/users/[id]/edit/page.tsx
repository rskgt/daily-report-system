import { AUTH_TOKEN_COOKIE, verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { UserForm } from "../../_components/user-form";

export default async function UserEditPage({
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

  if (role !== "ADMIN") {
    notFound();
  }

  const { id } = await params;
  const userId = Number(id);
  if (Number.isNaN(userId)) {
    notFound();
  }

  const [user, departments, managers] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        departmentId: true,
        role: true,
        managerId: true,
        isActive: true,
      },
    }),
    prisma.department.findMany({ orderBy: { name: "asc" } }),
    prisma.user.findMany({
      where: { role: { in: ["MANAGER", "ADMIN"] }, isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!user) {
    notFound();
  }

  return (
    <UserForm
      departments={departments.map((d) => ({ id: d.id, name: d.name }))}
      managers={managers}
      user={user}
    />
  );
}
