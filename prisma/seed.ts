import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // 既存データを削除（外部キー制約の順序で削除）
  await prisma.comment.deleteMany();
  await prisma.visitRecord.deleteMany();
  await prisma.dailyReport.deleteMany();
  await prisma.user.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.department.deleteMany();

  // PostgreSQL のシーケンスをリセット
  const tables = [
    "departments",
    "users",
    "customers",
    "daily_reports",
    "visit_records",
    "comments",
  ];
  for (const table of tables) {
    await prisma.$executeRawUnsafe(
      `ALTER SEQUENCE ${table}_id_seq RESTART WITH 1`,
    );
  }

  // 部署
  const dept1 = await prisma.department.create({
    data: { name: "営業1課" },
  });
  const dept2 = await prisma.department.create({
    data: { name: "営業2課" },
  });

  // パスワードハッシュ
  const hash = await bcrypt.hash("password123", 10);

  // 管理者
  const admin = await prisma.user.create({
    data: {
      name: "管理者",
      email: "admin@example.com",
      passwordHash: hash,
      departmentId: dept1.id,
      role: "ADMIN",
    },
  });

  // 上長
  const manager = await prisma.user.create({
    data: {
      name: "鈴木部長",
      email: "suzuki@example.com",
      passwordHash: hash,
      departmentId: dept1.id,
      role: "MANAGER",
    },
  });

  // 営業担当者
  const sales = await prisma.user.create({
    data: {
      name: "山田太郎",
      email: "yamada@example.com",
      passwordHash: hash,
      departmentId: dept1.id,
      role: "SALES",
      managerId: manager.id,
    },
  });

  // 顧客
  await prisma.customer.create({
    data: {
      name: "株式会社ABC",
      address: "東京都千代田区丸の内1-1-1",
      phone: "03-1234-5678",
      contactPerson: "田中一郎",
      email: "tanaka@abc.co.jp",
    },
  });

  await prisma.customer.create({
    data: {
      name: "株式会社XYZ",
      address: "東京都港区六本木2-2-2",
      phone: "03-9876-5432",
      contactPerson: "佐藤花子",
      email: "sato@xyz.co.jp",
    },
  });

  await prisma.customer.create({
    data: {
      name: "有限会社テスト",
      address: "大阪府大阪市中央区3-3-3",
      phone: "06-1111-2222",
      contactPerson: "高橋次郎",
      email: "takahashi@test.co.jp",
    },
  });

  console.log("Seed finished");
  console.log(`  Departments: ${dept1.name}, ${dept2.name}`);
  console.log(`  Created user: admin (${admin.email})`);
  console.log(`  Created user: manager (${manager.email})`);
  console.log(`  Created user: yamada (${sales.email})`);
  console.log("  Customers: 株式会社ABC, 株式会社XYZ, 有限会社テスト");
  console.log("  Password for all users: password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
