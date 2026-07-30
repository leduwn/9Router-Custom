import Link from "next/link";
import { GoogleAnalytics } from "@next/third-parties/google";
import Navigation from "./components/Navigation";
import HeroSection from "./components/HeroSection";
import FlowAnimation from "./components/FlowAnimation";
import HowItWorks from "./components/HowItWorks";
import Features from "./components/Features";
import GetStarted from "./components/GetStarted";
import Footer from "./components/Footer";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#06101d] font-sans text-slate-100 selection:bg-cyan-300/30">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(33,136,255,0.2),transparent_34rem),radial-gradient(circle_at_88%_28%,rgba(34,211,238,0.12),transparent_30rem),linear-gradient(180deg,#06101d_0%,#081525_52%,#06101d_100%)]" />
        <div className="absolute inset-0 opacity-[0.055] [background-image:linear-gradient(to_right,#8fd3ff_1px,transparent_1px),linear-gradient(to_bottom,#8fd3ff_1px,transparent_1px)] [background-size:64px_64px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_10%,rgba(2,8,18,0.58)_100%)]" />
      </div>

      <div className="relative z-10">
        <Navigation />
        <main id="landing-content">
          <HeroSection />
          <div className="mx-auto flex max-w-7xl justify-center px-6 pb-28">
            <FlowAnimation />
          </div>
          <GetStarted />
          <HowItWorks />
          <Features />

          <section className="render-lazy relative overflow-hidden px-6 py-28 sm:py-36">
            <div className="absolute inset-x-6 top-0 mx-auto h-px max-w-7xl bg-linear-to-r from-transparent via-cyan-300/25 to-transparent" />
            <div className="mx-auto max-w-4xl text-center">
              <p className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">Ready when you are</p>
              <h2 className="text-balance text-4xl font-bold tracking-[-0.045em] text-white sm:text-5xl">
                Give every AI tool one dependable route.
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-7 text-slate-400 sm:text-lg">
                Duwn keeps providers, keys, traffic, and fallback rules in one focused workspace powered by the 9router runtime.
              </p>
              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/dashboard"
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-linear-to-b from-cyan-300 to-blue-500 px-7 text-sm font-bold text-slate-950 shadow-[0_18px_42px_-20px_rgba(34,211,238,0.85)] transition-all duration-200 hover:-translate-y-0.5 hover:brightness-105 sm:w-auto"
                >
                  Open dashboard
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Link>
                <a
                  href="https://github.com/decolua/9router#readme"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-12 w-full items-center justify-center rounded-xl border border-white/10 bg-white/[0.045] px-7 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-300/25 hover:bg-white/[0.075] sm:w-auto"
                >
                  Read documentation
                </a>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
      <GoogleAnalytics gaId="G-LC959F603F" />
    </div>
  );
}
