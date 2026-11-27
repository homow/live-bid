import swc from "unplugin-swc";
import {defineConfig} from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    // Resolves the @app/* and @live-bid/* aliases from tsconfig
    tsconfigPaths(),
    // Keeps decorator metadata, which NestJS DI needs
    swc.vite(),
  ],
  test: {
    globals: true,
    environment: "node",
    include: ["apps/**/*.spec.ts", "packages/**/*.spec.ts"],
  },
});
