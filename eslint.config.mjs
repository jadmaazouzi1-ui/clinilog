import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Build output and scratch folders that are gitignored but can sit in a
    // working copy: linting them reported tens of thousands of problems.
    ".netlify/**",
    ".next-rootowned*/**",
    "tmp/**",
    "test-results/**",
    "playwright-report/**",
    ".agents/**",
    ".claude/**",
  ]),
]);

export default eslintConfig;
