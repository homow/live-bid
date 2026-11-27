import 'dotenv/config';
import swc from "unplugin-swc";
import {defineConfig} from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";
import {TEST_DATABASE_URL} from "./test/test-env";

// Not merged with vitest.config.ts on purpose: mergeConfig would glue the
// `include` arrays together and the unit specs would run here too.
export default defineConfig({
  plugins: [tsconfigPaths(), swc.vite()],
  test: {
    globals: true,
    environment: "node",
    include: ["apps/**/*.int-spec.ts", "packages/**/*.int-spec.ts"],

    // The db client reads DATABASE_URL when it's imported, so set it before any test file loads
    env: {DATABASE_URL: TEST_DATABASE_URL, SERVICE_NAME: "live-bid-test"},
    globalSetup: ["./test/global-setup.ts"],

    // Every file shares one database, so no parallel files
    fileParallelism: false,
    testTimeout: 20_000,
  },
});
