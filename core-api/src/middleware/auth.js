import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { isPrismaConnectionError, prisma } from "../services/prisma.service.js";
import { store } from "../services/store.service.js";

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Missing bearer token" });
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    let user = null;

    try {
      user = await prisma.user.findUnique({ where: { id: payload.sub } });
    } catch (error) {
      if (!isPrismaConnectionError(error)) {
        throw error;
      }
    }

    user = user || store.users.find((item) => item.id === payload.sub);

    if (!user) {
      return res.status(401).json({ message: "User no longer exists" });
    }

    req.user = user;
    next();
  } catch (_error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
