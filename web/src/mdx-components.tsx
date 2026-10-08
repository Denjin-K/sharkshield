import type { MDXComponents } from "mdx/types";
import Link from "next/link";

/**
 * Required by @next/mdx on the App Router. Maps markdown to the site's type
 * ramp and keeps links on next/link. Raw HTML is not enabled, so this is the
 * whole surface a post can render.
 */
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: (p) => <h1 className="t-title mt-10 mb-4" {...p} />,
    h2: (p) => <h2 className="mt-10 mb-3 text-2xl font-extrabold text-ink" {...p} />,
    h3: (p) => <h3 className="mt-8 mb-2 text-xl font-bold text-ink" {...p} />,
    p: (p) => <p className="my-4 leading-relaxed" {...p} />,
    ul: (p) => <ul className="my-4 list-disc space-y-1 pl-6" {...p} />,
    ol: (p) => <ol className="my-4 list-decimal space-y-1 pl-6" {...p} />,
    blockquote: (p) => <blockquote className="my-6 rounded-panel bg-panel px-5 py-4 italic" {...p} />,
    a: ({ href = "", children, ...rest }) =>
      href.startsWith("/") ? (
        <Link href={href} className="font-medium text-blue-text underline underline-offset-2" {...rest}>{children}</Link>
      ) : (
        <a href={href} className="font-medium text-blue-text underline underline-offset-2" target="_blank" rel="noreferrer" {...rest}>{children}</a>
      ),
    table: (p) => <div className="my-6 overflow-x-auto"><table className="w-full text-[15px]" {...p} /></div>,
    th: (p) => <th className="border-b border-border px-3 py-2 text-left text-[12px] font-bold uppercase tracking-wider text-muted" {...p} />,
    td: (p) => <td className="border-b border-border px-3 py-2 align-top" {...p} />,
    ...components,
  };
}
