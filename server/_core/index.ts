import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { OWNER_PROTECTED_PATH_PREFIXES } from "../../shared/owner-route-access";
import {
  getOwnerCookieValue,
  getOwnerCredentials,
  isOwnerRequestAuthenticated,
  OWNER_COOKIE_NAME,
} from "./owner-auth";

const ownerBasicAuth: express.RequestHandler = (req, res, next) => {
  const credentials = getOwnerCredentials();
  if (!isOwnerRequestAuthenticated(req.headers, credentials)) {
    res.setHeader("WWW-Authenticate", 'Basic realm="LKS Delivery Owner"');
    res.status(401).send("Owner login required");
    return;
  }
  res.setHeader("Set-Cookie", `${OWNER_COOKIE_NAME}=${getOwnerCookieValue(credentials)}; Path=/; HttpOnly; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}`);
  next();
};

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Railway healthcheck route
  app.get("/health", (_req, res) => {
    res.sendStatus(200);
  });

  app.get("/", ownerBasicAuth);
  app.use(OWNER_PROTECTED_PATH_PREFIXES, ownerBasicAuth);

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  registerOAuthRoutes(app);

  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = parseInt(process.env.PORT || "3000", 10);

  server.listen(port, "0.0.0.0", () => {
    console.log(`Server running on port ${port}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
