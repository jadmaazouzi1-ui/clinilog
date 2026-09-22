import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/AppShell";
import ImportView from "./ImportView";

export default async function ImportPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  return (
    <AppShell userEmail={user.email ?? ""} activePath="/import">
      <main className="w-full px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
            Bulk Import Experiences
          </h1>
          <p className="text-sm" style={{ color: "rgba(22,36,29,0.6)" }}>
            Already tracking your experiences in a spreadsheet? Import them all at once.
          </p>
        </div>
        <ImportView />
      </main>
    </AppShell>
  );
}
