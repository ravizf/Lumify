import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { isPrismaConnectionError, prisma } from "./prisma.service.js";
import { publicUser, store } from "./store.service.js";

function issueToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, env.jwtSecret, {
    expiresIn: "8h"
  });
}

export async function signup({ name, email, password }) {
  const normalizedEmail = email.trim().toLowerCase();
  const passwordHash = await bcrypt.hash(password, 10);

  try {
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (existing) {
      const error = new Error("Email is already registered");
      error.statusCode = 409;
      throw error;
    }

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash
      }
    });

    return {
      token: issueToken(user),
      user: publicUser(user)
    };
  } catch (error) {
    if (!isPrismaConnectionError(error) && !error.statusCode) {
      throw error;
    }

    if (error.statusCode) {
      throw error;
    }
  }

  const existing = store.users.find((user) => user.email === normalizedEmail);

  if (existing) {
    const error = new Error("Email is already registered");
    error.statusCode = 409;
    throw error;
  }

  const user = {
    id: randomUUID(),
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
    createdAt: new Date().toISOString()
  };

  store.users.push(user);

  return {
    token: issueToken(user),
    user: publicUser(user)
  };
}

export async function login({ email, password }) {
  const normalizedEmail = email.trim().toLowerCase();

  try {
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      return {
        token: issueToken(user),
        user: publicUser(user)
      };
    }
  } catch (error) {
    if (!isPrismaConnectionError(error)) {
      throw error;
    }
  }

  const user = store.users.find((item) => item.email === normalizedEmail);

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  return {
    token: issueToken(user),
    user: publicUser(user)
  };
}
