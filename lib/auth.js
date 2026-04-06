import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

export function createToken(user) {
  return jwt.sign(
    {
      id: user.id || user._id?.toString(),
      email: user.email,
      role: user.role || "user",
      name: user.name || "",
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error("TOKEN VERIFY ERROR:", error);
    return null;
  }
}