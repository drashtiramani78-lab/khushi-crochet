import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

// Validate JWT_SECRET at module load time
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error(
    "FATAL: JWT_SECRET environment variable is required but not set. " +
    "Add JWT_SECRET to your .env.local file before starting the application."
  );
}

export function createToken(user) {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Get authenticated user from request
export async function getAuthUser(req) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("user_token")?.value;

    if (!token) {
      return null;
    }

    const decoded = verifyToken(token);
    return decoded || null;
  } catch (error) {
    return null;
  }
}

// Export JWT_SECRET for jose/jwtVerify (for APIs using jose library)
export function getJoseSecret() {
  return new TextEncoder().encode(JWT_SECRET);
}