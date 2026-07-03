import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/AppShell";
import PostbaccView from "./PostbaccView";
import { PostbaccCourse, PostbaccProfile } from "./actions";

export default async function PostbaccPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const [{ data: courses }, { data: profile }] = await Promise.all([
    supabase.from("postbacc_courses").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("postbacc_profile").select("*").eq("user_id", user.id).maybeSingle(),
  ]);

  const initialProfile: PostbaccProfile = {
    user_id: user.id,
    program_type: profile?.program_type ?? null,
    gpa_goal: profile?.gpa_goal ?? 3.7,
    bcpm_goal: profile?.bcpm_goal ?? 3.7,
    notes: profile?.notes ?? null,
  };

  return (
    <AppShell userEmail={user.email ?? ""} activePath="/postbacc">
      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2" style={{ color: "#000000" }}>Post-bacc Tracker</h1>
          <p className="text-sm" style={{ color: "rgba(0,0,0,0.6)" }}>
            Track your post-bacc coursework with live BCPM and cumulative GPA calculations.
          </p>
        </div>
        <PostbaccView initialCourses={(courses ?? []) as PostbaccCourse[]} initialProfile={initialProfile} />
      </main>
    </AppShell>
  );
}
