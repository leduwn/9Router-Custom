"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BrandMark from "@/shared/components/BrandMark";
import { APP_CONFIG } from "@/shared/constants/config";

const navLinks = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Docs", href: "https://github.com/decolua/9router#readme", external: true },
];

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.07] bg-[#06101d]/78 backdrop-blur-2xl">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-6">
        <button
          type="button"
          className="group flex items-center gap-3 rounded-xl"
          onClick={() => router.push("/landing")}
          aria-label="Duwn home"
        >
          <BrandMark size="md" className="transition-transform duration-200 group-hover:-rotate-2 group-hover:scale-105" />
          <span className="text-[18px] font-bold tracking-[-0.03em] text-white">{APP_CONFIG.name}</span>
        </button>

        <div className="hidden items-center gap-7 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noopener noreferrer" : undefined}
              className="text-sm font-medium text-slate-400 transition-colors hover:text-white"
            >
              {link.label}
            </a>
          ))}
          <a
            href="https://github.com/decolua/9router"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 transition-colors hover:text-white"
          >
            GitHub
            <span className="material-symbols-outlined text-[15px]">open_in_new</span>
          </a>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="hidden h-10 items-center justify-center rounded-xl bg-white px-4 text-sm font-bold text-slate-950 transition-all duration-200 hover:-translate-y-0.5 hover:bg-cyan-50 sm:flex"
          >
            Open dashboard
          </button>
          <button
            type="button"
            className="flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white md:hidden"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation"
          >
            <span className="material-symbols-outlined">{mobileMenuOpen ? "close" : "menu"}</span>
          </button>
        </div>
      </div>

      {mobileMenuOpen ? (
        <div className="border-t border-white/[0.07] bg-[#071321]/96 px-5 py-5 backdrop-blur-2xl md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noopener noreferrer" : undefined}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-xl px-3 py-3 text-sm font-medium text-slate-300 hover:bg-white/[0.05] hover:text-white"
              >
                {link.label}
              </a>
            ))}
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="mt-3 h-11 rounded-xl bg-white text-sm font-bold text-slate-950"
            >
              Open dashboard
            </button>
          </div>
        </div>
      ) : null}
    </nav>
  );
}
