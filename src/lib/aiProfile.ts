import type { SupabaseClient } from "@supabase/supabase-js";
import { Experience, formatHours } from "@/lib/types";

/**
 * Compact profile summary shared by the outline and mock-interview prompts.
 * Kept deterministic and bounded so a user with 200 entries does not blow
 * the context window or the request cost.
 */
export async function buildAiProfile(supabase: SupabaseClient, userId: string) {
  const [{ data: profileRow }, { data: expRows }] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, archetype_id, archetype_data, intended_specialty, graduation_year")
      .eq("id", userId)
      .single(),
    supabase.from("experiences").select("*").order("hours", { ascending: false }).limit(25),
  ]);

  const experiences: Experience[] = (expRows ?? []) as Experience[];
  const totalHours = experiences.reduce((s, e) => s + Number(e.hours ?? 0), 0);

  const byType: Record<string, number> = {};
  for (const e of experiences) byType[e.type] = (byType[e.type] ?? 0) + Number(e.hours ?? 0);

  const lines = experiences
    .slice(0, 12)
    .map(
      (e, i) =>
        `${i + 1}. "${e.title}" at ${e.organization} (${e.type.replace("_", " ")}), ${formatHours(e.hours)} hrs` +
        (e.description ? `\n   What they did: ${e.description.slice(0, 300)}` : "") +
        (e.reflection ? `\n   Their reflection: ${e.reflection.slice(0, 300)}` : "")
    )
    .join("\n");

  return {
    profileRow,
    experiences,
    totalHours,
    summary: [
      `Name: ${profileRow?.full_name ?? "Not given"}`,
      `Archetype: ${profileRow?.archetype_id ?? "Not yet generated"}`,
      `Intended specialty: ${profileRow?.intended_specialty ?? "Undecided"}`,
      `Graduation year: ${profileRow?.graduation_year ?? "Not given"}`,
      `Total hours: ${formatHours(totalHours)} across ${experiences.length} entries`,
      `Hours by category: ${Object.entries(byType).map(([k, v]) => `${k.replace("_", " ")}=${formatHours(v)}`).join(", ") || "none"}`,
      "",
      "Experiences:",
      lines || "(none logged)",
    ].join("\n"),
  };
}
