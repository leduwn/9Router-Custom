const FEATURES = [
  {
    icon: "alt_route",
    title: "One route, many providers",
    description: "Keep a stable OpenAI-compatible endpoint while models and providers change behind it.",
    detail: "Route by model, account, combo, or fallback policy.",
    className: "md:col-span-2",
  },
  {
    icon: "key",
    title: "Credentials in one place",
    description: "Manage OAuth sessions and API keys without scattering secrets across every tool.",
    detail: "Local-first credential storage.",
  },
  {
    icon: "monitoring",
    title: "Usage you can read",
    description: "See requests, tokens, quota, cost, and provider health without digging through raw logs.",
    detail: "Live traffic and account limits.",
  },
  {
    icon: "terminal",
    title: "Built for your CLI workflow",
    description: "Configure Claude Code, Codex, Cursor, Cline, and other tools from the same dashboard.",
    detail: "Keep technical 9router compatibility.",
  },
  {
    icon: "sync_alt",
    title: "Fallback without friction",
    description: "Move traffic to another account or provider when quotas, latency, or upstream errors get in the way.",
    detail: "Automatic recovery paths.",
    className: "md:col-span-2",
  },
];

export default function Features() {
  return (
    <section className="px-6 py-24 sm:py-32" id="features">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">What stays under control</p>
            <h2 className="text-balance text-3xl font-bold tracking-[-0.045em] text-white sm:text-5xl">
              Powerful where it matters. Quiet everywhere else.
            </h2>
          </div>
          <p className="max-w-2xl text-pretty text-base leading-7 text-slate-400 lg:justify-self-end">
            Duwn exposes the depth of the 9router runtime through a calmer interface, so complex routing remains understandable as your setup grows.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature, index) => (
            <article
              key={feature.title}
              className={`group relative overflow-hidden rounded-[20px] border border-white/[0.075] bg-white/[0.035] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300/20 hover:bg-white/[0.055] ${feature.className || ""}`}
            >
              <div className="absolute right-0 top-0 size-32 translate-x-1/3 -translate-y-1/3 rounded-full bg-blue-500/0 blur-3xl transition-colors duration-300 group-hover:bg-blue-500/15" />
              <div className="relative">
                <div className="mb-8 flex items-center justify-between">
                  <span className="flex size-10 items-center justify-center rounded-xl border border-cyan-300/10 bg-cyan-300/[0.07] text-cyan-200">
                    <span className="material-symbols-outlined text-[21px]">{feature.icon}</span>
                  </span>
                  <span className="tabular-nums text-xs font-semibold text-slate-600">0{index + 1}</span>
                </div>
                <h3 className="text-lg font-semibold tracking-[-0.02em] text-white">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-400">{feature.description}</p>
                <p className="mt-6 border-t border-white/[0.065] pt-4 text-xs font-medium text-slate-500">{feature.detail}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
