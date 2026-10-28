import { test, expect } from "@playwright/test";
import { safeNextPath } from "../../src/lib/safeRedirect";
import { sanitizeText, parseHours, parseDateNotFuture, parseEnum } from "../../src/lib/sanitize";

// Pure functions: no browser, no network.
test.describe("unit: redirect and input sanitizers", () => {
  test("safeNextPath only allows same-origin relative paths", () => {
    for (const bad of [
      "https://evil.com", "//evil.com", "/\\evil.com", "\\\\evil.com", ".evil.com",
      "javascript:alert(1)", "/\r\nSet-Cookie:x", "/\t/evil.com", "", null, undefined, "/" + "a".repeat(600),
    ]) {
      expect(safeNextPath(bad as string | null), String(bad)).toBe("/dashboard");
    }
    // Percent-encoded CR/LF stays encoded in the Location header: harmless.
    expect(safeNextPath("/schools?tab=2")).toBe("/schools?tab=2");
    expect(safeNextPath("/auth/reset-password")).toBe("/auth/reset-password");
  });

  test("sanitizeText strips markup, script and control characters, and caps length", () => {
    expect(sanitizeText("<script>alert(1)</script>Hi", 50)).toBe("Hi");
    expect(sanitizeText('<img src=x onerror="alert(1)">ok', 50)).toBe("ok");
    expect(sanitizeText("javascript:alert(1)", 50)).not.toContain("javascript:");
    expect(sanitizeText("a\u0000b\u0007c", 50)).toBe("abc");
    expect(sanitizeText("x".repeat(100), 10)).toHaveLength(10);
    expect(sanitizeText(123 as unknown as string, 10)).toBe("");
  });

  test("numeric, date and enum parsers reject out-of-range input", () => {
    expect(parseHours("-1")).toBeNull();
    expect(parseHours("1e9")).toBeNull();
    expect(parseHours("NaN")).toBeNull();
    expect(parseHours("2.25")).toBe(2.3);
    expect(parseDateNotFuture("2999-01-01")).toBeNull();
    expect(parseDateNotFuture("2024-13-45")).toBeNull();
    expect(parseDateNotFuture("2024-01-01'; drop table x;--")).toBeNull();
    expect(parseEnum("admin", ["a", "b"] as const, "a")).toBe("a");
  });
});
