const STEPS = [
  {
    number: "01",
    icon: "terminal",
    title: "Point your tools once",
    description: "Keep using the clients you know. Replace only the base URL with your local or remote 9router endpoint.",
  },
  {
    number: "02",
    icon: "hub",
    title: "Shape routes in Duwn",
    description: "Choose models, accounts, combos, fallback order, and security from one visual workspace.",
    featured: true,
  },
  {
    number: "03",
    icon: "cloud_queue",
    title: "Let the runtime decide",
    description: "The 9router engine translates formats, refreshes credentials, retries safely, and streams the response back.",
  },
];

export default function HowItWorks() {
  return (
    <section className="render-lazy border-y border-white/[0.07] bg-white/[0.018] px-6 py-24 sm:py-32" id="how-it-works">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">How it works</p>
          <h2 className="text-balance text-3xl font-bold tracking-[-0.045em] text-white sm:text-5xl">
            A calm interface over a capable routing engine.
          </h2>
          <p className="mt-5 max-w-2xl text-pretty text-base leading-7 text-slate-400">
            Duwn changes how the runtime feels to operate, not how your existing integrations connect.
          </p>
        </div>

        <div className="relative mt-14 grid gap-4 lg:grid-cols-3">
          <div className="absolute left-[16%] right-[16%] top-10 hidden h-px bg-linear-to-r from-transparent via-cyan-300/25 to-transparent lg:block" aria-hidden="true" />
          {STEPS.map((step) => (
            <article
              key={step.number}
              className={`relative rounded-[20px] border p-6 ${
                step.featured
                  ? "border-cyan-300/20 bg-linear-to-b from-cyan-300/[0.075] to-blue-500/[0.035] shadow-[0_20px_50px_-34px_rgba(34,211,238,0.8)]"
                  : "border-white/[0.07] bg-[#071321]/70"
              }`}
            >
              <div className="mb-8 flex items-center justify-between">
                <span className={`flex size-11 items-center justify-center rounded-2xl ${step.featured ? "bg-cyan-300 text-slate-950" : "bg-white/[0.05] text-slate-300"}`}>
                  <span className="material-symbols-outlined text-[22px]">{step.icon}</span>
                </span>
                <span className="tabular-nums text-xs font-bold tracking-[0.16em] text-slate-600">{step.number}</span>
              </div>
              <h3 className="text-lg font-semibold tracking-[-0.02em] text-white">{step.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-400">{step.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
