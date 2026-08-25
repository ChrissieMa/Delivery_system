import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { ownerProcedure, publicProcedure, router } from "./_core/trpc";
import {
  isCustomerDeliveryRecordToken,
  isCustomerDeliveryToken,
} from "../shared/customer-delivery-access";
import { z } from "zod";

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

    listPendingDeliveryOrders: ownerProcedure.query(async () => {
      const { getPendingDeliveryOrders } = await import("./airtable");
      return getPendingDeliveryOrders();
    }),

    createDelivery: ownerProcedure
      .input(z.object({
        orderId: z.string().min(1),
        items: z.array(z.object({
          id: z.string().min(1),
          weight: z.number().positive().max(10000),
          basePackages: z.number().int().min(1).max(100),
        })).min(1).max(100),
        packageNotes: z.array(z.string().max(500)).max(200).optional(),
        deliveryDate: z.string().optional(),
        estimatedArrival: z.string().optional(),
        driverRemark: z.string().max(1000).optional(),
      }))
      .mutation(async ({ input }) => {
        const { createDeliveryFromOrder } = await import("./airtable");
        return createDeliveryFromOrder(input);
      }),

    recordPrint: ownerProcedure
      .input(z.object({ deliveryIds: z.array(z.string().min(1)).min(1).max(100) }))
      .mutation(async ({ input }) => {
        const { recordPrintRequest } = await import("./airtable");
        return recordPrintRequest(input.deliveryIds);
      }),
    
    // 客人公開連結只可以用分享 token 查詢，唔接受內部 Airtable record ID。
    getCustomerDelivery: publicProcedure
      .input(z.string().trim().min(1).max(64).refine(isCustomerDeliveryToken, "Invalid delivery token"))
      .query(async ({ input }) => {
        const { getFullOrderData } = await import("./airtable");
        return getFullOrderData(input);
      }),

    // 已分享出去的舊客人連結使用不可猜測的 Airtable record token。
    getCustomerDeliveryByRecordToken: publicProcedure
      .input(z.string().trim().min(17).max(67).refine(isCustomerDeliveryRecordToken, "Invalid delivery record token"))
      .query(async ({ input }) => {
        const { getFullOrderData } = await import("./airtable");
        return getFullOrderData(input);
      }),

    // 內部預覽及列印可以使用 Airtable record ID，但必須通過 owner auth。
    getOrderData: ownerProcedure
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
