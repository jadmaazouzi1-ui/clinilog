import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createExperience } from "../actions";
import AppShell from "@/components/AppShell";
import ExperienceForm from "../ExperienceForm";

export const metadata = {
  description: "Add an experience with dates, hours, a category and a description.",
};

export default async function NewExperiencePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <AppShell
      userEmail={user.email ?? ""}
      activePath="/dashboard"
      breadcrumbs={[{ label: "Overview", href: "/dashboard" }, { label: "Log hours" }]}
    >
      <main className="page">
        <Link href="/dashboard" className="link text-sm">
          Back to Overview
        </Link>
        <h1 className="text-2xl" style={{ margin: "var(--sp-15) 0 var(--sp-h)" }}>
          Log hours
        </h1>
        <p className="text-sm" style={{ color: "var(--text-muted)", marginBottom: "var(--sp-4)", maxWidth: "60ch" }}>
          The hours count toward your totals as soon as you save. Everything here can be changed later.
        </p>
        <ExperienceForm action={createExperience} submitLabel="Save entry" cancelHref="/dashboard" />
      </main>
    </AppShell>
  );
}
