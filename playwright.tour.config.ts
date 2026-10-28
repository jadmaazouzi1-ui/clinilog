import { defineConfig, devices } from "@playwright/test";

// Guided tour suite. Without BASE_URL it starts the local production build
// (run `npm run build` first) on port 3001, so nothing touches the live site:
//   npm run build && npm run test:tour
//   BASE_URL=https://www.cliniclogmd.com npm run test:tour
const local = !process.env.BASE_URL;
export default defineConfig({
  testDir: "./tests/tour",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: process.env.BASE_URL ?? "http://localhost:3001",
    trace: "retain-on-failure",
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },
  webServer: local
    ? { command: "npx next start -p 3001", url: "http://localhost:3001", reuseExistingServer: true, timeout: 60_000 }
    : undefined,
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
