"use client";

import { useEffect, useRef, useState } from "react";
import BrandMark from "@/shared/components/BrandMark";
import ProviderIcon from "@/shared/components/ProviderIcon";

const TOOLS = [
  { id: "claude", name: "Claude Code", image: "/providers/claude.png" },
  { id: "codex", name: "Codex", image: "/providers/codex.png" },
  { id: "cursor", name: "Cursor", image: "/providers/cursor.png" },
];

const PROVIDERS = [
  { id: "openai", name: "OpenAI", image: "/providers/openai.png" },
  { id: "anthropic", name: "Anthropic", image: "/providers/claude.png" },
  { id: "gemini", name: "Gemini", image: "/providers/gemini.png" },
];

function EndpointItem({ item, active = false }) {
  return (
    <div className={`flex items-center gap-3 rounded-2xl border px-3.5 py-3 transition-all duration-500 ${
      active
        ? "border-cyan-300/25 bg-cyan-300/[0.075] shadow-[0_12px_32px_-22px_rgba(34,211,238,0.8)]"
        : "border-white/[0.07] bg-white/[0.03]"
    }`}>
      <span className="flex size-9 items-center justify-center rounded-xl bg-white/[0.055]">
        <ProviderIcon
          src={item.image}
          alt={item.name}
          size={25}
          className="max-h-[25px] max-w-[25px] rounded object-contain"
          fallbackText={item.name.slice(0, 2).toUpperCase()}
        />
      </span>
      <span className="text-xs font-semibold text-slate-300">{item.name}</span>
      {active ? <span className="ml-auto size-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.9)]" /> : null}
    </div>
  );
}

export default function FlowAnimation() {
  const [activeFlow, setActiveFlow] = useState(0);
  const sectionRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return undefined;
    }

    let visible = false;
    let interval = null;
    const stop = () => {
      if (interval) globalThis.clearInterval(interval);
      interval = null;
    };
    const start = () => {
      if (!visible || document.hidden || interval) return;
      interval = globalThis.setInterval(() => {
        setActiveFlow((current) => (current + 1) % PROVIDERS.length);
      }, 2200);
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) start();
        else stop();
      },
      { rootMargin: "120px" },
    );
    const onVisibilityChange = () => {
      if (document.hidden) stop();
      else start();
    };

    observer.observe(section);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      stop();
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative w-full overflow-hidden rounded-[26px] border border-white/[0.075] bg-white/[0.028] p-5 shadow-[0_32px_80px_-52px_rgba(33,136,255,0.7)] sm:p-8" aria-label="Routing flow">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(33,136,255,0.1),transparent_45%)]" />

      <div className="relative grid items-center gap-5 md:grid-cols-[1fr_auto_1fr] md:gap-10">
        <div className="grid gap-2.5">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600">Your tools</p>
          {TOOLS.map((tool) => <EndpointItem key={tool.id} item={tool} />)}
        </div>

        <div className="relative mx-auto flex size-36 flex-col items-center justify-center rounded-[34px] border border-cyan-300/20 bg-[#091a2d]/92 shadow-[0_0_50px_-18px_rgba(34,211,238,0.72)]">
          <div className="absolute inset-3 rounded-[26px] border border-white/[0.06]" />
          <BrandMark size="xl" />
          <p className="mt-3 text-sm font-bold tracking-[-0.02em] text-white">Duwn</p>
          <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-cyan-300/65">Route · observe</p>
        </div>

        <div className="grid gap-2.5">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600 md:text-right">Providers</p>
          {PROVIDERS.map((provider, index) => (
            <EndpointItem key={provider.id} item={provider} active={activeFlow === index} />
          ))}
        </div>
      </div>

      <div className="relative mt-6 flex items-center justify-center gap-2 border-t border-white/[0.06] pt-5 text-xs text-slate-500">
        <span className="material-symbols-outlined text-[16px] text-cyan-300/70">conversion_path</span>
        The 9router runtime handles protocol translation and streaming underneath.
      </div>
    </section>
  );
}
