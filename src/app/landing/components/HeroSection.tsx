"use client";

export default function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 px-6 min-h-[90vh] flex flex-col items-center justify-center overflow-hidden">
      {/* Glow effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-[#2188ff]/10 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="relative z-10 max-w-4xl w-full text-center flex flex-col items-center gap-8">
        {/* Version badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-[#20364f] bg-[#0f1d30]/50 px-3 py-1 text-xs font-medium text-[#2188ff]">
          <span className="flex h-2 w-2 rounded-full bg-[#2188ff] animate-pulse"></span>
          v1.0 is now live
        </div>

        {/* Main heading */}
        <h1 className="text-5xl md:text-7xl font-black leading-[1.1] tracking-tight">
          One Endpoint for <br/>
          <span className="text-[#2188ff]">All AI Providers</span>
        </h1>

        {/* Description */}
        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto font-light">
          AI endpoint proxy with web dashboard - A JavaScript port of CLIProxyAPI. Works seamlessly with Claude Code, OpenAI Codex, Cline, RooCode, and other CLI tools.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 w-full">
          <button className="h-12 px-8 rounded-lg bg-[#2188ff] hover:bg-[#2188ff]/90 text-white text-base font-bold transition-all shadow-[0_0_15px_rgba(33,136,255,0.4)] flex items-center gap-2">
            <span className="material-symbols-outlined">rocket_launch</span>
            Get Started
          </button>
          <a 
            href="https://github.com/leduwn/9Router-Custom"
            target="_blank" 
            rel="noopener noreferrer"
            className="h-12 px-8 rounded-lg border border-[#20364f] bg-[#0f1d30] hover:bg-[#15263b] text-white text-base font-bold transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined">code</span>
            View on GitHub
          </a>
        </div>
      </div>
    </section>
  );
}

