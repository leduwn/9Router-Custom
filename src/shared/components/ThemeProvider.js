"use client";

import { useEffect } from "react";
import useThemeStore from "@/store/themeStore";

export function ThemeProvider({ children }) {
  const initTheme = useThemeStore((state) => state.initTheme);

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return <>{children}</>;
}

