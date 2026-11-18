import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateExperience } from "../../actions";
import { Experience } from "@/lib/types";
import AppShell from "@/components/AppShell";
import ExperienceForm from "../../ExperienceForm";
import { Notice } from "@/components/ui";

export const metadata = {
  description: "Change the dates, hours or description of a logged experience.",
};

export default async function EditExperiencePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error: pageError } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: experience } = await supabase
    .from("experiences")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!experience) {
    redirect("/dashboard");
  }

  const exp = experience as Experience;

  return (
    <AppShell userEmail={user.email ?? ""} activePath="/dashboard" breadcrumbs={[{ label: "Overview", href: "/dashboard" }, { label: exp.title, href: `/dashboard/${exp.id}` }, { label: "Edit" }]}>
      <main className="page">
        <Link href={`/dashboard/${exp.id}`} className="link text-sm">
          Back to entry
        </Link>
        <h1 className="text-2xl" style={{ margin: "var(--sp-15) 0 var(--sp-4)" }}>
          Edit entry
        </h1>
        {pageError && (
          <div style={{ marginBottom: "var(--sp-3)" }}>
            <Notice tone="danger">{decodeURIComponent(pageError)}</Notice>
          </div>
        )}
        <ExperienceForm
          action={updateExperience.bind(null, exp.id)}
          values={exp}
          submitLabel="Save changes"
          cancelHref={`/dashboard/${exp.id}`}
        />
      </main>
    </AppShell>
  );
}
