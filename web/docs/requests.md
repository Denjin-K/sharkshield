# Requests between tracks

## From Track D (pages) to the integrator

- `src/mdx-components.tsx` (or root `mdx-components.tsx`) is required by `@next/mdx` on the
  App Router; the dynamic MDX import in `src/app/updates/[slug]/page.tsx` fails without it.
  A minimal file is enough: `export function useMDXComponents() { return {}; }` with
  `MDXComponents` from `mdx/types`. The slug page passes its own `components` prop for styling.
- `next.config.ts`: add `remark-frontmatter` to `remarkPlugins` (and `pnpm add remark-frontmatter`)
  so the YAML block at the top of `content/updates/*.mdx` is dropped from the rendered body.
  `src/lib/content.ts` already parses it with gray-matter; without the plugin the body renders
  the frontmatter as an `<hr>` and a heading.
- `messages/en.json`: the device spec table, still captions, download labels and the research
  section labels/references live in `content/device.ts` and `content/research.ts` for now
  (Track D owns `content/**`). Move them under `device_page` / `research` when convenient.
