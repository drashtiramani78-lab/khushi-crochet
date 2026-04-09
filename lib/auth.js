import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

function requireJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }
  return secret;
}

export function createToken(user) {
  return jwt.sign(
    {
      id: user.id || user._id?.toString(),
      email: user.email,
      role: user.role || "user",
      name: user.name || "",
    },
    requireJwtSecret(),
    { expiresIn: "7d" }
  );
}

export function verifyToken(token) {
  if (!token || typeof token !== 'string' || token.trim() === '') {
    return null;
  }
  try {
    return jwt.verify(token, requireJwtSecret());
  } catch (error) {
    console.error("TOKEN VERIFY ERROR:", error);
    return null;
  }
}

export function verifyAdminToken(token) {
  if (!token || typeof token !== 'string' || token.trim() === '') {
    console.error("ADMIN TOKEN VERIFY ERROR: empty/malformed token");
    return null;
  }
  try {
    const decoded = jwt.verify(token, requireJwtSecret());
    return decoded.role === 'admin' ? decoded : null;
  } catch (error) {
    console.error("ADMIN TOKEN VERIFY ERROR:", error);
    return null;
  }
}

export async function getAuthUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("user_token")?.value;
    if (!token) return null;
    return verifyToken(token);
  } catch (e) {
    console.error("GET AUTH USER ERROR:", e);
    return null;
  }
}

export function getJoseSecret() {
  return new TextEncoder().encode(requireJwtSecret());
}
