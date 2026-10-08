import type { Metadata } from "next";
import Link from "next/link";
import { AccentBar, Chip } from "@/components/ui";
import { t } from "@/lib/t";

export const metadata: Metadata = { title: "404" };

const nf = t("not_found");
const nav = t("nav");

const links = [
  { href: "/#story", label: nav.story },
  { href: "/research", label: nav.research },
  { href: "/device", label: nav.device },
];

export default function NotFound() {
  return (
    <section className="pt-32 pb-24 lg:pt-40 lg:pb-32" aria-labelledby="nf-title">
      <div className="container-site">
        <Chip tone="pink">404</Chip>
        <h1 id="nf-title" className="t-title mt-5 max-w-2xl">{nf.title}</h1>
        <AccentBar className="mt-6" />
        <p className="t-lead mt-6">{nf.lead}</p>
        <nav aria-label="Suggested pages" className="mt-8 flex flex-wrap gap-3">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="inline-flex min-h-11 items-center rounded-chip bg-mint-bg px-5 py-2 font-bold text-mint-text hover:bg-mint-bar"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </section>
  );
}
