import { describe, expect, it } from "vitest";

import { fallbackSlug, slugify } from "@/lib/slug";

describe("slug helpers", () => {
  it("creates URL-safe slugs", () => {
    expect(slugify("Coffee support! 2 TON")).toBe("coffee-support-2-ton");
  });

  it("falls back when a title has no sluggable text", () => {
    expect(fallbackSlug("!!!")).toBe("paygram-link");
  });
});

