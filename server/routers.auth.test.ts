import { beforeEach, describe, expect, it, vi } from "vitest";

const credentials = {
  username: "synthetic-owner",
  password: "synthetic-password",
};

const { getAllOrders, getFullOrderData } = vi.hoisted(() => ({
  getAllOrders: vi.fn(async () => [{ id: "synthetic-order", fields: { "Shipping No": "260123" } }]),
  getFullOrderData: vi.fn(async (token: string) => ({ token })),
}));

vi.mock("./airtable", () => ({
  getAllOrders,
  getFullOrderData,
}));

vi.mock("./_core/owner-auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./_core/owner-auth")>();
  return {
    ...actual,
    getOwnerCredentials: () => credentials,
  };
});

import { appRouter } from "./routers";
import {
  getOwnerCookieValue,
  isOwnerRequestAuthenticated,
  OWNER_COOKIE_NAME,
} from "./_core/owner-auth";

const createContext = (headers: Record<string, string> = {}) => ({
  req: { headers },
  res: { setHeader: vi.fn() },
  user: null,
}) as never;

describe("owner Airtable router boundary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("denies unauthenticated listOrders before Airtable access", async () => {
    const caller = appRouter.createCaller(createContext());

    await expect(caller.airtable.listOrders()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    expect(getAllOrders).not.toHaveBeenCalled();
  });

  it("fails closed when the owner password is not configured", () => {
    const authorization = `Basic ${Buffer.from(`${credentials.username}:`).toString("base64")}`;

    expect(
      isOwnerRequestAuthenticated(
        { authorization },
        { username: credentials.username, password: "" },
      ),
    ).toBe(false);
  });

  it.each([
    {
      name: "owner login cookie",
      headers: { cookie: `${OWNER_COOKIE_NAME}=${getOwnerCookieValue(credentials)}` },
    },
    {
      name: "Basic authorization",
      headers: {
        authorization: `Basic ${Buffer.from(`${credentials.username}:${credentials.password}`).toString("base64")}`,
      },
    },
  ])("allows listOrders with $name", async ({ headers }) => {
    const caller = appRouter.createCaller(createContext(headers));

    await expect(caller.airtable.listOrders()).resolves.toEqual([
      { id: "synthetic-order", fields: { "Shipping No": "260123" } },
    ]);
    expect(getAllOrders).toHaveBeenCalledTimes(1);
  });

  it("keeps public customer routes and health available without Airtable access", async () => {
    const caller = appRouter.createCaller(createContext());

    await expect(caller.airtable.getCustomerDelivery("260123")).resolves.toEqual({ token: "260123" });
    await expect(caller.airtable.getCustomerDeliveryByRecordToken("rec12345678901234")).resolves.toEqual({
      token: "rec12345678901234",
    });
    await expect(caller.system.health({ timestamp: 0 })).resolves.toEqual({ ok: true });
    expect(getAllOrders).not.toHaveBeenCalled();
    expect(getFullOrderData).toHaveBeenCalledTimes(2);
  });
});
