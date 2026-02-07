import { NextRequest } from "next/server";
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

const mockVerifyToken = vi.fn();
vi.mock("@/lib/auth/jwt", () => ({
  verifyToken: (...args: unknown[]) => mockVerifyToken(...args),
}));

function createRequest(token?: string): NextRequest {
  const headers: Record<string, string> = {};
  if (token) {
    headers.authorization = `Bearer ${token}`;
  }
  return new NextRequest("http://localhost/api/v1/auth/logout", {
    method: "POST",
    headers,
  });
}

describe("POST /api/v1/auth/logout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("認証済みユーザーがログアウトできる", async () => {
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
      departmentId: 1,
      managerId: null,
      isActive: true,
    });

    const res = await POST(createRequest("valid-token"));

    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.message).toBe("ログアウトしました");
  });

  it("トークンなしで401エラーが返る", async () => {
    const res = await POST(createRequest());

    const json = await res.json();
    expect(res.status).toBe(401);
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("UNAUTHORIZED");
  });

  it("無効なトークンで401エラーが返る", async () => {
    mockVerifyToken.mockImplementation(() => {
      throw new Error("invalid token");
    });

    const res = await POST(createRequest("invalid-token"));

    const json = await res.json();
    expect(res.status).toBe(401);
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("UNAUTHORIZED");
  });
});
