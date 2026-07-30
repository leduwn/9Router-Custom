import BrandMark from "@/shared/components/BrandMark";
import { APP_CONFIG } from "@/shared/constants/config";

const links = [
  ["Dashboard", "/dashboard/endpoint"],
  ["Documentation", "https://github.com/decolua/9router#readme"],
  ["GitHub", "https://github.com/decolua/9router"],
  ["npm runtime", "https://www.npmjs.com/package/9router"],
  ["MIT license", "https://github.com/decolua/9router/blob/master/LICENSE"],
];

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.07] bg-[#040b14] px-6 py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-9">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-start">
          <div>
            <div className="flex items-center gap-3">
              <BrandMark size="md" />
              <div>
                <p className="font-bold tracking-[-0.025em] text-white">{APP_CONFIG.name}</p>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600">AI routing control plane</p>
              </div>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-6 text-slate-500">
              A focused frontend for operating the open-source 9router runtime.
            </p>
          </div>

          <nav className="grid grid-cols-2 gap-x-8 gap-y-3 sm:flex sm:flex-wrap sm:justify-end" aria-label="Footer navigation">
            {links.map(([label, href]) => {
              const external = href.startsWith("http");
              return (
                <a
                  key={label}
                  href={href}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noopener noreferrer" : undefined}
                  className="text-sm font-medium text-slate-500 transition-colors hover:text-cyan-200"
                >
                  {label}
                </a>
              );
            })}
          </nav>
        </div>

        <div className="flex flex-col gap-2 border-t border-white/[0.06] pt-6 text-xs text-slate-700 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Duwn. Interface branding only.</p>
          <p>Runtime commands, APIs, paths, and compatibility remain 9router.</p>
        </div>
      </div>
    </footer>
  );
}
