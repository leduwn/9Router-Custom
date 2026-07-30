"use client";

import { useRouter } from "next/navigation";

const SIGNALS = [
  { value: "1", label: "stable endpoint" },
  { value: "50+", label: "provider integrations" },
  { value: "24/7", label: "local control" },
];

export default function HeroSection() {
  const router = useRouter();

  return (
    <section className="relative flex min-h-[82dvh] items-center overflow-hidden px-6 pb-16 pt-36 sm:pt-44">
      <div className="pointer-events-none absolute left-1/2 top-16 h-[28rem] w-[46rem] -translate-x-1/2 rounded-full bg-blue-500/12 blur-[120px]" aria-hidden="true" />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl gap-14 lg:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.72fr)] lg:items-end">
        <div>
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-cyan-300/[0.065] px-3 py-1.5 text-xs font-semibold text-cyan-200">
            <span className="size-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.9)]" />
            Powered by the open-source 9router runtime
          </div>

          <h1 className="max-w-4xl text-balance text-[3.15rem] font-bold leading-[0.98] tracking-[-0.06em] text-white sm:text-6xl lg:text-[5.25rem]">
            One clear route through every AI provider.
          </h1>

          <p className="mt-7 max-w-2xl text-pretty text-base leading-7 text-slate-400 sm:text-lg">
            Duwn turns provider credentials, model routing, usage, and fallback rules into a focused control plane for the tools you already use.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-linear-to-b from-cyan-300 to-blue-500 px-6 text-sm font-bold text-slate-950 shadow-[0_18px_42px_-20px_rgba(34,211,238,0.9)] transition-all duration-200 hover:-translate-y-0.5 hover:brightness-105"
            >
              Open Duwn
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
            <a
              href="https://github.com/decolua/9router"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.045] px-6 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-300/25 hover:bg-white/[0.075]"
            >
              <span className="material-symbols-outlined text-[18px]">code</span>
              View runtime source
            </a>
          </div>
        </div>

        <aside className="landing-glass rounded-[22px] p-5 lg:mb-2" aria-label="Product overview">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">The control layer</p>
          <div className="mt-5 space-y-3">
            {[
              ["terminal", "Your tools", "Claude Code, Codex, Cursor, Cline"],
              ["hub", "Duwn", "Routing, fallback, credentials, visibility"],
              ["cloud_queue", "AI providers", "One endpoint across every model"],
            ].map(([icon, title, copy], index) => (
              <div key={title} className="relative flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-black/10 p-3.5">
                <span className="flex size-9 items-center justify-center rounded-xl bg-cyan-300/[0.08] text-cyan-200">
                  <span className="material-symbols-outlined text-[19px]">{icon}</span>
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="truncate text-xs text-slate-500">{copy}</p>
                </div>
                {index < 2 ? (
                  <span className="material-symbols-outlined ml-auto text-[18px] text-blue-300/50">south</span>
                ) : null}
              </div>
            ))}
          </div>
        </aside>

        <div className="grid grid-cols-3 gap-3 border-t border-white/[0.07] pt-6 lg:col-span-2">
          {SIGNALS.map((signal) => (
            <div key={signal.label}>
              <p className="tabular-nums text-xl font-bold tracking-[-0.03em] text-white sm:text-2xl">{signal.value}</p>
              <p className="mt-1 text-xs text-slate-500">{signal.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
