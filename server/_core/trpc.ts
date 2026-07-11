import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from '@shared/const';
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";
import { createHash } from "crypto";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

const requireOwner = t.middleware(async ({ ctx, next }) => {
  const expectedUsername = process.env.ADMIN_USERNAME || "lks";
  const expectedPassword = process.env.ADMIN_PASSWORD || "";
  const authHeader = ctx.req.headers.authorization || "";
  const expectedCookie = createHash("sha256").update(`${expectedUsername}:${expectedPassword}`).digest("hex");
  const hasOwnerCookie = String(ctx.req.headers.cookie || "")
    .split(";")
    .some((part) => part.trim() === `lks_delivery_owner=${expectedCookie}`);
  let username = "";
  let password = "";
  if (authHeader.startsWith("Basic ")) {
    try {
      const decoded = Buffer.from(authHeader.slice(6), "base64").toString("utf8");
      const separator = decoded.indexOf(":");
      username = separator >= 0 ? decoded.slice(0, separator) : decoded;
      password = separator >= 0 ? decoded.slice(separator + 1) : "";
    } catch {
      // Invalid Authorization header is handled below.
    }
  }
  if (!expectedPassword || (!hasOwnerCookie && (username !== expectedUsername || password !== expectedPassword))) {
    ctx.res.setHeader("WWW-Authenticate", 'Basic realm="LKS Delivery Owner"');
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Owner login required" });
  }
  return next({ ctx });
});

export const ownerProcedure = t.procedure.use(requireOwner);

const requireUser = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(requireUser);

export const adminProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    if (!ctx.user || ctx.user.role !== 'admin') {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  }),
);
