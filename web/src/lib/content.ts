import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";

/**
 * Updates live in content/updates/<slug>.mdx with YAML frontmatter.
 * This module reads the directory on the server at build time; the MDX
 * body itself is rendered through a dynamic import in the slug page.
 */

export const UpdateFrontmatter = z.object({
  title: z.string().min(1),
  /** ISO calendar date, e.g. 2026-10-07. */
  date: z.iso.date(),
  summary: z.string().min(1),
});

export type UpdateFrontmatter = z.infer<typeof UpdateFrontmatter>;

export type Update = UpdateFrontmatter & { slug: string };

const UPDATES_DIR = path.join(process.cwd(), "content", "updates");

function readUpdate(file: string): Update {
  const slug = file.replace(/\.mdx$/, "");
  const raw = fs.readFileSync(path.join(UPDATES_DIR, file), "utf8");
  const { data } = matter(raw);
  const parsed = UpdateFrontmatter.safeParse(data);
  if (!parsed.success) {
    throw new Error(`Invalid frontmatter in content/updates/${file}: ${parsed.error.message}`);
  }
  return { slug, ...parsed.data };
}

/** All posts, newest first. Returns [] when the directory is empty or missing. */
export function getUpdates(): Update[] {
  if (!fs.existsSync(UPDATES_DIR)) return [];
  return fs
    .readdirSync(UPDATES_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map(readUpdate)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.slug.localeCompare(b.slug)));
}

export function getUpdate(slug: string): Update | undefined {
  // Slugs come from the file names only; anything else is a 404.
  if (!/^[a-z0-9-]+$/i.test(slug)) return undefined;
  const file = `${slug}.mdx`;
  if (!fs.existsSync(path.join(UPDATES_DIR, file))) return undefined;
  return readUpdate(file);
}

/** Long-form date for listings, rendered the same on server and client. */
export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
