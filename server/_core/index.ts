import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

const ownerBasicAuth: express.RequestHandler = (req, res, next) => {
  const expectedUsername = process.env.ADMIN_USERNAME || "lks";
  const expectedPassword = process.env.ADMIN_PASSWORD || "";
  const authHeader = req.headers.authorization || "";
  let valid = false;
  if (expectedPassword && authHeader.startsWith("Basic ")) {
    try {
      const decoded = Buffer.from(authHeader.slice(6), "base64").toString("utf8");
      valid = decoded === `${expectedUsername}:${expectedPassword}`;
    } catch {
      valid = false;
    }
  }
  if (!valid) {
    res.setHeader("WWW-Authenticate", 'Basic realm="LKS Delivery Owner"');
    res.status(401).send("Owner login required");
    return;
  }
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
  app.use(
    ["/pending", "/label", "/labels", "/driver-note", "/driver-notes", "/shipping", "/customer-invoice", "/invoice", "/batch-invoice"],
    ownerBasicAuth,
  );

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
