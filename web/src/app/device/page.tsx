import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Image from "next/image";
import { AccentBar, Chip } from "@/components/ui";
import { t } from "@/lib/t";
import { downloads, licence, specs, specsTitle, stills, stillsNote } from "@/../content/device";

export const metadata: Metadata = { title: "Device" };

const d = t("device_page");
const unit = t("unit");

/** File size read at build time so the links always match what is in public/downloads. */
function fileSize(file: string): string {
  const bytes = fs.statSync(path.join(process.cwd(), "public", "downloads", file)).size;
  return bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
}

export default function DevicePage() {
  const files = downloads.map((dl) => ({ ...dl, size: fileSize(dl.file) }));

  return (
    <>
      <section className="pt-32 pb-12 lg:pt-40 lg:pb-16" aria-labelledby="device-title">
        <div className="container-site">
          <Chip tone="mint">{unit.scale}</Chip>
          <h1 id="device-title" className="t-title mt-5 max-w-3xl">{d.title}</h1>
          <AccentBar className="mt-6" />
          <p className="t-lead mt-6 max-w-2xl">{d.lead}</p>
        </div>
      </section>

      <section className="pb-16 lg:pb-24" aria-labelledby="spec-title">
        <div className="container-site grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
          <div>
            <ul className="grid gap-5 sm:grid-cols-2">
              {stills.map((s, i) => (
                <li key={s.src}>
                  <figure>
                    <div className="relative aspect-[16/10] overflow-hidden rounded-card bg-panel">
                      <Image src={s.src} alt={s.alt} fill priority={i === 0} sizes="(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
                    </div>
                    <figcaption className="mt-2 text-[13px] text-muted">{s.caption}</figcaption>
                  </figure>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[12px] text-muted">{stillsNote}</p>
          </div>

          <div>
            <h2 id="spec-title" className="text-[26px] lg:text-[32px]">{specsTitle}</h2>
            <table className="mt-6 w-full border-collapse text-[15px]">
              <tbody>
                {specs.map((row) => (
                  <tr key={row.label} className="border-t border-border last:border-b">
                    <th scope="row" className="w-28 py-3 pr-4 text-left align-top font-bold text-ink">{row.label}</th>
                    <td className="py-3 text-text">{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="pb-24 lg:pb-32" aria-labelledby="downloads-title">
        <div className="container-site grid gap-10 lg:grid-cols-2 lg:gap-14">
          <div>
            <h2 id="downloads-title" className="text-[26px] lg:text-[32px]">{d.downloads_title}</h2>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-text">{d.downloads_note}</p>
            <ul className="mt-6 flex flex-col gap-3">
              {files.map((f) => (
                <li key={f.file}>
                  <a
                    href={`/downloads/${f.file}`}
                    download
                    className="flex min-h-14 items-center justify-between gap-4 rounded-panel border border-border bg-white px-5 py-3 hover:border-mint-bar"
                  >
                    <span>
                      <span className="block font-bold text-ink">{f.label} · {f.file}</span>
                      <span className="block text-[13px] text-muted">{f.description}</span>
                    </span>
                    <span className="shrink-0 text-[14px] font-bold text-mint-text">{f.size}</span>
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[13px] text-muted">
              {licence.label}:{" "}
              <a href={licence.href} target="_blank" rel="noreferrer" className="underline">{licence.value}</a>
            </p>
          </div>

          <div className="rounded-card bg-yellow-bg p-6 lg:p-8" role="note">
            <p className="text-[16px] font-medium leading-relaxed text-yellow-text">{d.caveat}</p>
          </div>
        </div>
      </section>
    </>
  );
}
