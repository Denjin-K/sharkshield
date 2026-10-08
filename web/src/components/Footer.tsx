import Link from "next/link";
import { t } from "@/lib/t";

export function Footer() {
  const f = t("footer");
  const nav = t("nav");
  return (
    <footer className="border-t border-border py-10 text-[14px] text-muted">
      <div className="container-site flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <p>© {new Date().getFullYear()} {f.rights}. {f.license}</p>
        <nav aria-label="Footer" className="flex gap-6">
          <Link href="/research" className="hover:text-ink">{nav.research}</Link>
          <Link href="/device" className="hover:text-ink">{nav.device}</Link>
          <Link href="/updates" className="hover:text-ink">{nav.updates}</Link>
          <a href="https://github.com/Denjin-K/sharkshield" target="_blank" rel="noreferrer" className="hover:text-ink">{nav.github}</a>
        </nav>
      </div>
    </footer>
  );
}
