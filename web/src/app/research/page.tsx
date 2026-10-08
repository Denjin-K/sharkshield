import type { Metadata } from "next";
import { AccentBar, Chip } from "@/components/ui";
import { t } from "@/lib/t";
import { conference, references, sessions } from "@/../content/research";

export const metadata: Metadata = { title: "Research" };

const r = t("research");
const threads = [r.thread_1, r.thread_2, r.thread_3];

export default function ResearchPage() {
  return (
    <>
      <section className="pt-32 pb-12 lg:pt-40 lg:pb-16" aria-labelledby="research-title">
        <div className="container-site">
          <Chip tone="mint">{r.chip}</Chip>
          <h1 id="research-title" className="t-title mt-5 max-w-3xl">{r.title}</h1>
          <AccentBar className="mt-6" />
          <p className="t-lead mt-6 max-w-2xl">{r.lead}</p>
          <p className="mt-4 max-w-2xl text-[15px] text-muted">{conference.framing}</p>
        </div>
      </section>

      <section className="pb-16 lg:pb-24" aria-labelledby="threads-title">
        <div className="container-site">
          <h2 id="threads-title" className="text-[26px] lg:text-[32px]">{r.threads_title}</h2>
          <ol className="mt-8 grid gap-5 md:grid-cols-3">
            {threads.map((text, i) => (
              <li key={text} className="flex flex-col gap-4 rounded-card bg-mint-bg p-6 lg:p-7">
                <span aria-hidden="true" className="font-display text-[32px] font-extrabold leading-none text-mint-text">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="text-[16px] font-medium leading-relaxed text-ink">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="pb-16 lg:pb-24" aria-labelledby="talks-title">
        <div className="container-site">
          <h2 id="talks-title" className="text-[26px] lg:text-[32px]">{conference.sessionsTitle}</h2>
          <p className="mt-3 max-w-2xl text-[15px] text-muted">
            {conference.name} · {conference.dates}
          </p>
          {sessions.map((s) => (
            <div key={s.id} className="mt-12">
              <h3 id={s.id} className="text-[20px] lg:text-[24px]">{s.title}</h3>
              {s.note && <p className="mt-2 text-[14px] text-muted">{s.note}</p>}
              <ul className="mt-6 grid gap-5 lg:grid-cols-2">
                {s.talks.map((talk) => (
                  <li key={talk.title} className="flex flex-col gap-4 rounded-card border border-border bg-white p-6 lg:p-7">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                      <Chip tone="blue">{talk.time} JST</Chip>
                      <span className="text-[14px] font-bold text-ink">
                        {talk.speaker}
                        {talk.affiliation && <span className="font-normal text-muted"> · {talk.affiliation}</span>}
                      </span>
                    </div>
                    <p className="font-display text-[18px] font-bold leading-snug text-ink">{talk.title}</p>
                    <div className="mt-auto rounded-panel bg-panel px-5 py-4">
                      <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-muted">{conference.takeawayLabel}</p>
                      <p className="mt-2 text-[15px] leading-relaxed text-text">{talk.takeaway}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="pb-24 lg:pb-32" aria-labelledby="refs-title">
        <div className="container-site">
          <h2 id="refs-title" className="text-[26px] lg:text-[32px]">{conference.referencesTitle}</h2>
          <ul className="prose mt-6 flex flex-col gap-4">
            {references.map((ref) => (
              <li key={ref.href} className="text-[16px]">
                <a href={ref.href} target="_blank" rel="noreferrer" className="inline-block min-h-11 border-b-2 border-mint-bar py-2 font-bold text-ink">
                  {ref.label}
                </a>
                <span className="block text-[14px] text-muted">{ref.note}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
