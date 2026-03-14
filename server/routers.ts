import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  airtable: router({
    // 獲取所有訂單列表
    listOrders: publicProcedure.query(async () => {
      const { getAllOrders } = await import("./airtable");
      return getAllOrders();
    }),
    
    // 獲取單個訂單的完整數據
    getOrderData: publicProcedure
      .input((val: unknown) => {
        if (typeof val === "string") return val;
        throw new Error("Record ID must be a string");
      })
      .query(async ({ input }) => {
        const { getFullOrderData } = await import("./airtable");
        return getFullOrderData(input);
      }),
  }),
});

export type AppRouter = typeof appRouter;
