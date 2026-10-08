import type { Metadata } from "next";
import type { MDXComponents } from "mdx/types";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AccentBar, Chip } from "@/components/ui";
import { t } from "@/lib/t";
import { formatDate, getUpdate, getUpdates } from "@/lib/content";

type Params = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return getUpdates().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = getUpdate(slug);
  return post ? { title: post.title, description: post.summary } : {};
}

/** Running-text styles for the MDX body. No typography plugin, so the tags are mapped here. */
const mdx: MDXComponents = {
  h2: (p) => <h2 className="mt-10 text-[24px] lg:text-[28px]" {...p} />,
  h3: (p) => <h3 className="mt-8 text-[20px]" {...p} />,
  p: (p) => <p className="mt-5 text-[17px] leading-relaxed text-text" {...p} />,
  ul: (p) => <ul className="mt-5 list-disc space-y-3 pl-6 text-[17px] leading-relaxed text-text" {...p} />,
  ol: (p) => <ol className="mt-5 list-decimal space-y-3 pl-6 text-[17px] leading-relaxed text-text" {...p} />,
  a: (p) => <a className="border-b-2 border-mint-bar font-medium text-ink" {...p} />,
  strong: (p) => <strong className="font-bold text-ink" {...p} />,
};

export default async function UpdatePage({ params }: Params) {
  const { slug } = await params;
  const post = getUpdate(slug);
  if (!post) notFound();

  const { default: Body } = await import(`@/../content/updates/${slug}.mdx`);

  return (
    <article className="pt-32 pb-24 lg:pt-40 lg:pb-32" aria-labelledby="post-title">
      <div className="container-site">
        <Chip tone="mint">{t("nav").updates}</Chip>
        <h1 id="post-title" className="t-title mt-5 max-w-3xl">{post.title}</h1>
        <AccentBar className="mt-6" />
        <time dateTime={post.date} className="mt-6 block text-[13px] font-bold uppercase tracking-[0.14em] text-muted">
          {formatDate(post.date)}
        </time>
        <p className="t-lead mt-6 max-w-2xl">{post.summary}</p>
        <div className="prose mt-4 max-w-2xl">
          <Body components={mdx} />
        </div>
        <p className="mt-12">
          <Link href="/updates" className="inline-block min-h-11 border-b-2 border-mint-bar py-2 font-bold text-ink">
            ← {t("updates_page").title}
          </Link>
        </p>
      </div>
    </article>
  );
}
