import type { Metadata } from "next";
import Link from "next/link";
import { AccentBar, Chip } from "@/components/ui";
import { t } from "@/lib/t";
import { formatDate, getUpdates } from "@/lib/content";

export const metadata: Metadata = { title: "Updates" };

const u = t("updates_page");

export default function UpdatesPage() {
  const posts = getUpdates();

  return (
    <>
      <section className="pt-32 pb-12 lg:pt-40 lg:pb-16" aria-labelledby="updates-title">
        <div className="container-site">
          <Chip tone="mint">{t("nav").updates}</Chip>
          <h1 id="updates-title" className="t-title mt-5 max-w-3xl">{u.title}</h1>
          <AccentBar className="mt-6" />
          <p className="t-lead mt-6 max-w-2xl">{u.lead}</p>
        </div>
      </section>

      <section className="pb-24 lg:pb-32">
        <div className="container-site">
          {posts.length === 0 ? (
            <div data-empty className="max-w-xl rounded-card bg-panel p-6 lg:p-8">
              <h2 className="text-[22px]">{u.empty_title}</h2>
              <p className="mt-3 text-[15px] leading-relaxed text-text">{u.empty_body}</p>
            </div>
          ) : (
            <ul className="grid gap-5 md:grid-cols-2">
              {posts.map((post) => (
                <li key={post.slug}>
                  <article className="flex h-full flex-col gap-3 rounded-card border border-border bg-white p-6 lg:p-7">
                    <time dateTime={post.date} className="text-[13px] font-bold uppercase tracking-[0.14em] text-muted">
                      {formatDate(post.date)}
                    </time>
                    <h2 className="text-[22px] leading-tight">
                      <Link href={`/updates/${post.slug}`} className="inline-block py-1 hover:text-mint-text">
                        {post.title}
                      </Link>
                    </h2>
                    <p className="text-[15px] leading-relaxed text-text">{post.summary}</p>
                  </article>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
