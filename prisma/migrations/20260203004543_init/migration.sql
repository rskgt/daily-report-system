-- CreateTable
CREATE TABLE "departments" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "department_id" INTEGER,
    "role" TEXT NOT NULL DEFAULT 'SALES',
    "manager_id" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "users_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "users_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "customers" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "contact_person" TEXT,
    "email" TEXT,
    "notes" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "daily_reports" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "report_date" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "submitted_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "daily_reports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "visit_records" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "daily_report_id" INTEGER NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "visit_datetime" DATETIME NOT NULL,
    "purpose" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "problem" TEXT,
    "plan" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "visit_records_daily_report_id_fkey" FOREIGN KEY ("daily_report_id") REFERENCES "daily_reports" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "visit_records_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "comments" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "daily_report_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "comments_daily_report_id_fkey" FOREIGN KEY ("daily_report_id") REFERENCES "daily_reports" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "daily_reports_user_id_report_date_key" ON "daily_reports"("user_id", "report_date");
