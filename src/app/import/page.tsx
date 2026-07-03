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
      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2" style={{ color: "#000000" }}>
            Bulk Import Experiences
          </h1>
          <p className="text-sm" style={{ color: "rgba(0,0,0,0.6)" }}>
            Already tracking your experiences in a spreadsheet? Import them all at once.
          </p>
        </div>
        <ImportView />
      </main>
    </AppShell>
  );
}
