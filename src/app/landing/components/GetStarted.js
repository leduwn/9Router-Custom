"use client";

import { useCopyToClipboard } from "@/shared/hooks/useCopyToClipboard";

const STEPS = [
  ["Install the runtime", "Run the existing 9router package on the machine that will route traffic."],
  ["Open Duwn", "Add providers, credentials, fallback rules, and API keys in the dashboard."],
  ["Connect your tools", "Point clients to http://localhost:20128/v1 and keep working as usual."],
];

export default function GetStarted() {
  const { copied, copy } = useCopyToClipboard();

  return (
    <section className="render-lazy border-y border-white/[0.07] bg-[#040c17]/72 px-6 py-24 sm:py-28">
      <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
        <div>
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">Start locally</p>
          <h2 className="text-balance text-3xl font-bold tracking-[-0.045em] text-white sm:text-5xl">
            Keep the setup simple.
          </h2>
          <p className="mt-5 max-w-xl text-pretty text-base leading-7 text-slate-400">
            Duwn is the interface; 9router remains the compatible runtime, command, storage namespace, and API layer underneath.
          </p>

          <ol className="mt-9 space-y-6">
            {STEPS.map(([title, description], index) => (
              <li key={title} className="flex gap-4">
                <span className="tabular-nums flex size-8 shrink-0 items-center justify-center rounded-xl border border-cyan-300/15 bg-cyan-300/[0.065] text-xs font-bold text-cyan-200">
                  {index + 1}
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-white">{title}</h3>
                  <p className="mt-1 max-w-md text-sm leading-6 text-slate-500">{description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="overflow-hidden rounded-[22px] border border-white/[0.09] bg-[#07111f] shadow-[0_30px_80px_-46px_rgba(34,211,238,0.58)]">
          <div className="flex items-center border-b border-white/[0.07] bg-white/[0.025] px-4 py-3">
            <div className="flex gap-1.5" aria-hidden="true">
              <span className="size-2.5 rounded-full bg-slate-600" />
              <span className="size-2.5 rounded-full bg-slate-600" />
              <span className="size-2.5 rounded-full bg-slate-600" />
            </div>
            <span className="ml-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600">terminal · local</span>
            <button
              type="button"
              onClick={() => copy("npx 9router", "landing")}
              className="ml-auto rounded-lg px-2 py-1 text-xs font-medium text-slate-500 transition-colors hover:bg-white/[0.05] hover:text-cyan-200"
            >
              {copied === "landing" ? "Copied" : "Copy command"}
            </button>
          </div>

          <div className="overflow-x-auto p-5 font-mono text-[13px] leading-7 sm:p-7">
            <p><span className="text-cyan-300">$</span> <span className="text-slate-100">npx 9router</span></p>
            <div className="mt-4 text-slate-500">
              <p><span className="text-blue-400">›</span> Starting Duwn control plane</p>
              <p><span className="text-blue-400">›</span> 9router runtime listening on <span className="text-slate-300">:20128</span></p>
              <p><span className="text-blue-400">›</span> Dashboard <span className="text-slate-300">http://localhost:20128/dashboard</span></p>
              <p><span className="text-emerald-400">✓</span> Ready to route</p>
            </div>

            <div className="mt-6 border-t border-white/[0.07] pt-5 text-xs leading-6 text-slate-600">
              <p className="mb-1 text-slate-500">Data paths stay compatible:</p>
              <p>macOS/Linux · ~/.9router/db/data.sqlite</p>
              <p>Windows · %APPDATA%/9router/db/data.sqlite</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
