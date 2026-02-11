import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

const mockFindUnique = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
    },
  },
}));

const mockVerifyPassword = vi.fn();
vi.mock("@/lib/auth", () => ({
  AUTH_TOKEN_COOKIE: "auth-token",
  verifyPassword: (...args: unknown[]) => mockVerifyPassword(...args),
  generateToken: vi.fn(() => "mock-jwt-token"),
}));

function createRequest(body: unknown): Request {
  return new Request("http://localhost/api/v1/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function createRawRequest(rawBody: string): Request {
  return new Request("http://localhost/api/v1/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: rawBody,
  });
}

describe("POST /api/v1/auth/login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("正しい認証情報でログインできる", async () => {
    mockFindUnique.mockResolvedValue({
      id: 1,
      name: "山田太郎",
      email: "yamada@example.com",
      passwordHash: "hashed-password",
      role: "SALES",
      isActive: true,
      department: { id: 1, name: "営業1課" },
    });
    mockVerifyPassword.mockResolvedValue(true);

    const res = await POST(
      createRequest({
        email: "yamada@example.com",
        password: "password123",
      }),
    );

    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.token).toBe("mock-jwt-token");
    expect(json.data.user.id).toBe(1);
    expect(json.data.user.name).toBe("山田太郎");
    expect(json.data.user.email).toBe("yamada@example.com");
    expect(json.data.user.role).toBe("sales");
    expect(json.data.user.department).toEqual({ id: 1, name: "営業1課" });

    const cookie = res.cookies.get("auth-token");
    expect(cookie?.value).toBe("mock-jwt-token");
    expect(cookie?.httpOnly).toBe(true);
    expect(cookie?.sameSite).toBe("lax");
    expect(cookie?.path).toBe("/");
  });

  it("存在しないメールアドレスで401エラーが返る", async () => {
    mockFindUnique.mockResolvedValue(null);

    const res = await POST(
      createRequest({
        email: "unknown@example.com",
        password: "password123",
      }),
    );

    const json = await res.json();
    expect(res.status).toBe(401);
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("UNAUTHORIZED");
  });

  it("無効化されたユーザーで401エラーが返る", async () => {
    mockFindUnique.mockResolvedValue({
      id: 1,
      name: "無効ユーザー",
      email: "inactive@example.com",
      passwordHash: "hashed-password",
      role: "SALES",
      isActive: false,
      department: null,
    });

    const res = await POST(
      createRequest({
        email: "inactive@example.com",
        password: "password123",
      }),
    );

    const json = await res.json();
    expect(res.status).toBe(401);
    expect(json.success).toBe(false);
  });

  it("パスワードが間違っている場合401エラーが返る", async () => {
    mockFindUnique.mockResolvedValue({
      id: 1,
      name: "山田太郎",
      email: "yamada@example.com",
      passwordHash: "hashed-password",
      role: "SALES",
      isActive: true,
      department: null,
    });
    mockVerifyPassword.mockResolvedValue(false);

    const res = await POST(
      createRequest({
        email: "yamada@example.com",
        password: "wrongpassword",
      }),
    );

    const json = await res.json();
    expect(res.status).toBe(401);
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("UNAUTHORIZED");
  });

  it("メールアドレスが空の場合バリデーションエラーが返る", async () => {
    const res = await POST(
      createRequest({
        email: "",
        password: "password123",
      }),
    );

    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("VALIDATION_ERROR");
  });

  it("パスワードが空の場合バリデーションエラーが返る", async () => {
    const res = await POST(
      createRequest({
        email: "yamada@example.com",
        password: "",
      }),
    );

    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("VALIDATION_ERROR");
  });

  it("不正なメールアドレス形式でバリデーションエラーが返る", async () => {
    const res = await POST(
      createRequest({
        email: "not-an-email",
        password: "password123",
      }),
    );

    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("VALIDATION_ERROR");
  });

  it("部署なしのユーザーでdepartmentがnullで返る", async () => {
    mockFindUnique.mockResolvedValue({
      id: 1,
      name: "山田太郎",
      email: "yamada@example.com",
      passwordHash: "hashed-password",
      role: "ADMIN",
      isActive: true,
      department: null,
    });
    mockVerifyPassword.mockResolvedValue(true);

    const res = await POST(
      createRequest({
        email: "yamada@example.com",
        password: "password123",
      }),
    );

    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.user.department).toBeNull();
    expect(json.data.user.role).toBe("admin");
  });

  it("不正なJSONボディで400エラーが返る", async () => {
    const res = await POST(createRawRequest("{invalid json"));

    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("VALIDATION_ERROR");
    expect(json.error.message).toBe("リクエストボディが不正なJSON形式です");
  });

  it("passwordフィールドが欠落している場合バリデーションエラーが返る", async () => {
    const res = await POST(
      createRequest({
        email: "yamada@example.com",
      }),
    );

    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("VALIDATION_ERROR");
  });

  it("emailフィールドが欠落している場合バリデーションエラーが返る", async () => {
    const res = await POST(
      createRequest({
        password: "password123",
      }),
    );

    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("VALIDATION_ERROR");
  });

  it("空のオブジェクトでバリデーションエラーが返る", async () => {
    const res = await POST(createRequest({}));

    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("VALIDATION_ERROR");
  });
});
