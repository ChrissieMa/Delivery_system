import { mergeConfig } from "vite";
import { defineConfig } from "vitest/config";
import viteConfig from "./vite.config";

export default mergeConfig(
  viteConfig,
  defineConfig({
    root: import.meta.dirname,
    test: {
      include: [
        "client/src/**/*.test.ts",
        "server/auth.logout.test.ts",
        "server/routers.auth.test.ts",
        "shared/**/*.test.ts",
      ],
    },
  }),
);
