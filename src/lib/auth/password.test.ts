import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./password";

describe("password", () => {
  describe("hashPassword", () => {
    it("パスワードをハッシュ化できる", async () => {
      const password = "testPassword123";
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.startsWith("$2b$")).toBe(true);
    });

    it("同じパスワードでも異なるハッシュが生成される", async () => {
      const password = "testPassword123";
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe("verifyPassword", () => {
    it("正しいパスワードで検証が成功する", async () => {
      const password = "testPassword123";
      const hash = await hashPassword(password);

      const result = await verifyPassword(password, hash);
      expect(result).toBe(true);
    });

    it("誤ったパスワードで検証が失敗する", async () => {
      const password = "testPassword123";
      const hash = await hashPassword(password);

      const result = await verifyPassword("wrongPassword", hash);
      expect(result).toBe(false);
    });

    it("空文字のパスワードで検証が失敗する", async () => {
      const password = "testPassword123";
      const hash = await hashPassword(password);

      const result = await verifyPassword("", hash);
      expect(result).toBe(false);
    });
  });
});
