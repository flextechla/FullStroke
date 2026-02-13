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

  const shopName =
    (profile?.workspaces as { name: string } | null)?.name || "My Shop";
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