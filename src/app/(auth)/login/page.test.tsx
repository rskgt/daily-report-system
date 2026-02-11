import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import LoginPage from "./page";

// next/navigation モック
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

// fetch モック
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("システムタイトルとログインフォームが表示される", () => {
    render(<LoginPage />);

    expect(
      screen.getByRole("heading", { name: "営業日報システム" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("ログイン", { selector: "div" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("メールアドレス")).toBeInTheDocument();
    expect(screen.getByLabelText("パスワード")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "ログイン" }),
    ).toBeInTheDocument();
  });

  it("メールアドレス未入力で送信するとバリデーションエラーが表示される", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText("パスワード"), "password123");
    await user.click(screen.getByRole("button", { name: "ログイン" }));

    await waitFor(() => {
      expect(
        screen.getByText("メールアドレスを入力してください"),
      ).toBeInTheDocument();
    });

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("パスワード未入力で送信するとバリデーションエラーが表示される", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(
      screen.getByLabelText("メールアドレス"),
      "test@example.com",
    );
    await user.click(screen.getByRole("button", { name: "ログイン" }));

    await waitFor(() => {
      expect(
        screen.getByText("パスワードを入力してください"),
      ).toBeInTheDocument();
    });

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("無効なメールアドレス形式で送信するとバリデーションエラーが表示される", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText("メールアドレス"), "invalid-email");
    await user.type(screen.getByLabelText("パスワード"), "password123");
    await user.click(screen.getByRole("button", { name: "ログイン" }));

    await waitFor(() => {
      expect(
        screen.getByText("有効なメールアドレス形式で入力してください"),
      ).toBeInTheDocument();
    });

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("ログイン成功時にダッシュボードへリダイレクトする", async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: { token: "test-token", user: { id: 1, name: "テストユーザー" } },
      }),
    });

    render(<LoginPage />);

    await user.type(
      screen.getByLabelText("メールアドレス"),
      "test@example.com",
    );
    await user.type(screen.getByLabelText("パスワード"), "password123");
    await user.click(screen.getByRole("button", { name: "ログイン" }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "test@example.com",
          password: "password123",
        }),
      });
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("APIがエラーを返した場合にサーバーエラーメッセージが表示される", async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        success: false,
        error: {
          code: "INVALID_CREDENTIALS",
          message: "認証情報が正しくありません",
        },
      }),
    });

    render(<LoginPage />);

    await user.type(
      screen.getByLabelText("メールアドレス"),
      "test@example.com",
    );
    await user.type(screen.getByLabelText("パスワード"), "wrongpassword");
    await user.click(screen.getByRole("button", { name: "ログイン" }));

    await waitFor(() => {
      expect(
        screen.getByText("認証情報が正しくありません"),
      ).toBeInTheDocument();
    });

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("APIエラーにメッセージが無い場合にデフォルトエラーメッセージが表示される", async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        success: false,
        error: {},
      }),
    });

    render(<LoginPage />);

    await user.type(
      screen.getByLabelText("メールアドレス"),
      "test@example.com",
    );
    await user.type(screen.getByLabelText("パスワード"), "password123");
    await user.click(screen.getByRole("button", { name: "ログイン" }));

    await waitFor(() => {
      expect(
        screen.getByText(
          "ログインに失敗しました。認証情報を確認してください。",
        ),
      ).toBeInTheDocument();
    });
  });

  it("ネットワークエラー時に通信エラーメッセージが表示される", async () => {
    const user = userEvent.setup();
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    render(<LoginPage />);

    await user.type(
      screen.getByLabelText("メールアドレス"),
      "test@example.com",
    );
    await user.type(screen.getByLabelText("パスワード"), "password123");
    await user.click(screen.getByRole("button", { name: "ログイン" }));

    await waitFor(() => {
      expect(
        screen.getByText(
          "サーバーとの通信に失敗しました。しばらく経ってから再度お試しください。",
        ),
      ).toBeInTheDocument();
    });

    expect(mockPush).not.toHaveBeenCalled();
  });

  it("再送信時に前回のサーバーエラーがクリアされる", async () => {
    const user = userEvent.setup();

    // 1回目: エラー
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        success: false,
        error: { message: "認証情報が正しくありません" },
      }),
    });

    render(<LoginPage />);

    await user.type(
      screen.getByLabelText("メールアドレス"),
      "test@example.com",
    );
    await user.type(screen.getByLabelText("パスワード"), "wrongpassword");
    await user.click(screen.getByRole("button", { name: "ログイン" }));

    await waitFor(() => {
      expect(
        screen.getByText("認証情報が正しくありません"),
      ).toBeInTheDocument();
    });

    // 2回目: 成功
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: { token: "token" } }),
    });

    await user.click(screen.getByRole("button", { name: "ログイン" }));

    await waitFor(() => {
      expect(
        screen.queryByText("認証情報が正しくありません"),
      ).not.toBeInTheDocument();
    });
  });
});
