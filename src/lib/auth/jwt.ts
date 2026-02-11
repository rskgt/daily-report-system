import jwt, { type SignOptions } from "jsonwebtoken";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error(
      "JWT_SECRET environment variable must be set in production",
    );
  }
  return secret || "dev-secret-key";
}

function getJwtExpiresIn(): SignOptions["expiresIn"] {
  return (process.env.JWT_EXPIRES_IN || "24h") as SignOptions["expiresIn"];
}

export interface JwtPayload {
  userId: number;
  email: string;
  role: string;
}

/**
 * JWTトークンを生成する
 */
export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: getJwtExpiresIn(),
  });
}

/**
 * JWTトークンを検証してペイロードを返す
 */
export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, getJwtSecret()) as JwtPayload;
}
