import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import DashboardShell from "@/components/layout/DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get profile + workspace name for the sidebar
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, workspaces(name)")
    .eq("id", user.id)
    .single();

  const ws = profile?.workspaces as unknown as { name: string } | { name: string }[] | null;
const shopName = Array.isArray(ws) ? ws[0]?.name || "My Shop" : ws?.name || "My Shop";
  const userName = profile?.full_name || user.email || "User";
  const userRole = profile?.role || "mechanic";

  return (
    <DashboardShell
      shopName={shopName}
      userName={userName}
      userRole={userRole}
    >
      {children}
    </DashboardShell>
  );
}