import swc from "unplugin-swc";
import tsconfigPaths from "vite-tsconfig-paths";
import {defineConfig} from "vitest/config";

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
    include: ["**/*.spec.ts"],
  },
});
