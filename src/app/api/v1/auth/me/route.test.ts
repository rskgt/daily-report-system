import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";

const mockFindUnique = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
    },
  },
}));

const mockVerifyToken = vi.fn();
vi.mock("@/lib/auth/jwt", () => ({
  verifyToken: (...args: unknown[]) => mockVerifyToken(...args),
}));

function createRequest(token?: string): NextRequest {
  const headers: Record<string, string> = {};
  if (token) {
    headers.authorization = `Bearer ${token}`;
  }
  return new NextRequest("http://localhost/api/v1/auth/me", {
    method: "GET",
    headers,
  });
}

describe("GET /api/v1/auth/me", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("認証済みユーザーの情報を取得できる", async () => {
    mockVerifyToken.mockReturnValue({
      userId: 1,
      email: "yamada@example.com",
      role: "SALES",
    });

    mockFindUnique.mockResolvedValue({
      id: 1,
      name: "山田太郎",
      email: "yamada@example.com",
      role: "SALES",
      isActive: true,
      department: { id: 1, name: "営業1課" },
      manager: { id: 2, name: "鈴木部長" },
    });

    const res = await GET(createRequest("valid-token"));

    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.id).toBe(1);
    expect(json.data.name).toBe("山田太郎");
    expect(json.data.email).toBe("yamada@example.com");
    expect(json.data.role).toBe("sales");
    expect(json.data.department).toEqual({ id: 1, name: "営業1課" });
    expect(json.data.manager).toEqual({ id: 2, name: "鈴木部長" });
    expect(mockFindUnique).toHaveBeenCalledTimes(1);
  });

  it("部署・上長なしのユーザー情報を取得できる", async () => {
    mockVerifyToken.mockReturnValue({
      userId: 1,
      email: "admin@example.com",
      role: "ADMIN",
    });

    mockFindUnique.mockResolvedValue({
      id: 1,
      name: "管理者",
      email: "admin@example.com",
      role: "ADMIN",
      isActive: true,
      department: null,
      manager: null,
    });

    const res = await GET(createRequest("valid-token"));

    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.department).toBeNull();
    expect(json.data.manager).toBeNull();
    expect(mockFindUnique).toHaveBeenCalledTimes(1);
  });

  it("トークンなしで401エラーが返る", async () => {
    const res = await GET(createRequest());

    const json = await res.json();
    expect(res.status).toBe(401);
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("UNAUTHORIZED");
    expect(mockFindUnique).not.toHaveBeenCalled();
  });

  it("無効なトークンで401エラーが返る", async () => {
    mockVerifyToken.mockImplementation(() => {
      throw new Error("invalid token");
    });

    const res = await GET(createRequest("invalid-token"));

    const json = await res.json();
    expect(res.status).toBe(401);
    expect(json.success).toBe(false);
    expect(mockFindUnique).not.toHaveBeenCalled();
  });

  it("無効化されたユーザーで401エラーが返る", async () => {
    mockVerifyToken.mockReturnValue({
      userId: 1,
      email: "inactive@example.com",
      role: "SALES",
    });

    mockFindUnique.mockResolvedValue({
      id: 1,
      name: "無効ユーザー",
      email: "inactive@example.com",
      role: "SALES",
      isActive: false,
      department: null,
      manager: null,
    });

    const res = await GET(createRequest("valid-token"));

    const json = await res.json();
    expect(res.status).toBe(401);
    expect(json.success).toBe(false);
    expect(mockFindUnique).toHaveBeenCalledTimes(1);
  });
});
