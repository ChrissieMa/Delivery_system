import { createHash } from "node:crypto";
import type { IncomingHttpHeaders } from "node:http";

export const OWNER_COOKIE_NAME = "lks_delivery_owner";

export type OwnerCredentials = {
  username: string;
  password: string;
};

export function getOwnerCredentials(): OwnerCredentials {
  return {
    username: process.env.ADMIN_USERNAME || "lks",
    password: process.env.ADMIN_PASSWORD || "",
  };
}

export function getOwnerCookieValue(credentials: OwnerCredentials): string {
  return createHash("sha256")
    .update(`${credentials.username}:${credentials.password}`)
    .digest("hex");
}

export function isOwnerRequestAuthenticated(
  headers: IncomingHttpHeaders,
  credentials: OwnerCredentials,
): boolean {
  if (!credentials.password) return false;

  const expectedCookie = `${OWNER_COOKIE_NAME}=${getOwnerCookieValue(credentials)}`;
  const hasOwnerCookie = String(headers.cookie || "")
    .split(";")
    .some((part) => part.trim() === expectedCookie);

  if (hasOwnerCookie) return true;

  const authHeader = String(headers.authorization || "");
  if (!authHeader.startsWith("Basic ")) return false;

  try {
    const decoded = Buffer.from(authHeader.slice(6), "base64").toString("utf8");
    return decoded === `${credentials.username}:${credentials.password}`;
  } catch {
    return false;
  }
}
