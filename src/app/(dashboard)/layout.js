import DashboardLayout from "@/shared/components/layouts/DashboardLayout";

// Updates can replace the running app while a browser still holds an older
// prerendered shell. Always render the authenticated control plane from the
// active build so routes cannot disagree about sidebar/header UI.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function DashboardRootLayout({ children }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}

