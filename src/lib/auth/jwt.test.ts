import { describe, expect, it } from "vitest";
import { type JwtPayload, generateToken, verifyToken } from "./jwt";

describe("jwt", () => {
  const testPayload: JwtPayload = {
    userId: 1,
    email: "test@example.com",
    role: "SALES",
  };

  describe("generateToken", () => {
    it("JWTトークンを生成できる", () => {
      const token = generateToken(testPayload);

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.split(".")).toHaveLength(3);
    });

    it("異なるペイロードで異なるトークンが生成される", () => {
      const token1 = generateToken(testPayload);
      const token2 = generateToken({
        ...testPayload,
        userId: 2,
      });

      expect(token1).not.toBe(token2);
    });
  });

  describe("verifyToken", () => {
    it("有効なトークンを検証してペイロードを返す", () => {
      const token = generateToken(testPayload);
      const decoded = verifyToken(token);

      expect(decoded.userId).toBe(testPayload.userId);
      expect(decoded.email).toBe(testPayload.email);
      expect(decoded.role).toBe(testPayload.role);
    });

    it("無効なトークンで例外がスローされる", () => {
      expect(() => verifyToken("invalid-token")).toThrow();
    });

    it("改ざんされたトークンで例外がスローされる", () => {
      const token = generateToken(testPayload);
      const tampered = `${token}x`;

      expect(() => verifyToken(tampered)).toThrow();
    });
  });
});
