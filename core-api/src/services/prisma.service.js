import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export function isPrismaConnectionError(error) {
  return [
    "PrismaClientInitializationError",
    "PrismaClientKnownRequestError",
    "PrismaClientUnknownRequestError"
  ].includes(error?.name);
}
