"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useNotificationStore } from "@/store/notificationStore";
import { APP_CONFIG } from "@/shared/constants/config";
import Sidebar from "../Sidebar";
import Header from "../Header";

const UI_BUILD_ID = process.env.NEXT_PUBLIC_DUWN_UI_BUILD_ID || APP_CONFIG.version;

function getToastStyle(type) {
  if (type === "success") {
    return {
      wrapper: "border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400",
      icon: "check_circle",
    };
  }
  if (type === "error") {
    return {
      wrapper: "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400",
      icon: "error",
    };
  }
  if (type === "warning") {
    return {
      wrapper: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
      icon: "warning",
    };
  }
  return {
    wrapper: "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400",
    icon: "info",
  };
}

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const notifications = useNotificationStore((state) => state.notifications);
  const removeNotification = useNotificationStore((state) => state.removeNotification);

  useEffect(() => {
    let active = true;
    let checking = false;

    function removeUiCacheParams() {
      const target = new URL(globalThis.location.href);
      const hadUiBuild = target.searchParams.has("_duwn_ui");
      const hadPurge = target.searchParams.has("_duwn_purge");
      target.searchParams.delete("_duwn_ui");
      target.searchParams.delete("_duwn_purge");
      if (hadUiBuild || hadPurge) {
        globalThis.history.replaceState(
          globalThis.history.state,
          "",
          `${target.pathname}${target.search}${target.hash}`,
        );
      }
    }

    async function syncUiVersion() {
      if (checking) return;
      checking = true;
      try {
        const response = await fetch(
          `/api/version?currentOnly=1&ui=${encodeURIComponent(APP_CONFIG.version)}&build=${encodeURIComponent(UI_BUILD_ID)}&t=${Date.now()}`,
          { cache: "no-store" },
        );
        if (!response.ok || !active) return;

        const { currentVersion, uiBuildId } = await response.json();
        const serverUiBuildId = uiBuildId || currentVersion;
        if (!serverUiBuildId || serverUiBuildId === UI_BUILD_ID) {
          removeUiCacheParams();
          return;
        }

        const target = new URL(globalThis.location.href);
        if (target.searchParams.get("_duwn_ui") === serverUiBuildId) return;
        target.searchParams.set("_duwn_ui", serverUiBuildId);
        globalThis.location.replace(target.toString());
      } catch {
        // Keep the current UI available when the version probe is temporarily unreachable.
      } finally {
        checking = false;
      }
    }

    syncUiVersion();
    const onVisible = () => {
      if (!document.hidden) syncUiVersion();
    };
    globalThis.addEventListener("pageshow", syncUiVersion);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      active = false;
      globalThis.removeEventListener("pageshow", syncUiVersion);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-bg">
      <a href="#main-content" className="skip-link">Skip to content</a>
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -right-24 -top-40 size-[34rem] rounded-full bg-primary/[0.055] blur-3xl dark:bg-primary/[0.08]" />
        <div className="absolute -bottom-56 left-[24%] size-[30rem] rounded-full bg-cyan-400/[0.035] blur-3xl dark:bg-cyan-400/[0.055]" />
      </div>
      <div className="fixed top-4 right-4 z-[80] flex w-[min(92vw,380px)] flex-col gap-2">
        {notifications.map((n) => {
          const style = getToastStyle(n.type);
          return (
            <div
              key={n.id}
              className={`rounded-xl border px-3.5 py-3 shadow-[var(--shadow-elev)] backdrop-blur-xl ${style.wrapper}`}
            >
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[18px] leading-5">{style.icon}</span>
                <div className="min-w-0 flex-1">
                  {n.title ? <p className="text-xs font-semibold mb-0.5">{n.title}</p> : null}
                  <p className="text-xs whitespace-pre-wrap break-words">{n.message}</p>
                </div>
                {n.dismissible ? (
                  <button
                    type="button"
                    onClick={() => removeNotification(n.id)}
                    className="text-current/70 hover:text-current"
                    aria-label="Dismiss notification"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Desktop */}
      <div className="hidden lg:flex">
        <Sidebar />
      </div>

      {/* Sidebar - Mobile */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transform lg:hidden transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main content */}
      <main id="main-content" className="relative isolate flex h-full min-w-0 flex-1 flex-col transition-colors duration-300">
        {/* Faint grid background */}
        <div className="landing-grid absolute inset-0 pointer-events-none -z-10" aria-hidden="true" />
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <div className={`flex-1 overflow-y-auto custom-scrollbar ${pathname === "/dashboard/basic-chat" ? "" : "px-4 pb-8 pt-5 sm:px-6 lg:px-9 lg:pb-10 lg:pt-7"} ${pathname === "/dashboard/basic-chat" ? "flex flex-col overflow-hidden" : ""}`}>
          <div className={`${pathname === "/dashboard/basic-chat" ? "flex-1 w-full h-full flex flex-col" : "max-w-7xl mx-auto"}`}>{children}</div>
        </div>
      </main>
    </div>
  );
}
