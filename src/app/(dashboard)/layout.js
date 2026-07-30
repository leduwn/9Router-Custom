import { DashboardLayout } from "@/shared/components";

// The dashboard is an authenticated control plane, not cacheable marketing content.
// Rendering it dynamically prevents an old app shell from surviving a runtime update.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function DashboardRootLayout({ children }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}

