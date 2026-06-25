export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 72);
}

export function fallbackSlug(value: string) {
  const slug = slugify(value);
  return slug.length > 0 ? slug : "paygram-link";
}

