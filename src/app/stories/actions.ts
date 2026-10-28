"use server";

// Run this SQL in Supabase SQL Editor:
//
// CREATE TABLE story_submissions (
//   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
//   name TEXT NOT NULL,
//   undergrad_school TEXT NOT NULL,
//   medical_school TEXT NOT NULL,
//   background TEXT NOT NULL,
//   quote TEXT NOT NULL,
//   submitted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
//   reviewed BOOLEAN DEFAULT FALSE
// );
// ALTER TABLE story_submissions ENABLE ROW LEVEL SECURITY;
// CREATE POLICY "Anyone can submit a story"
//   ON story_submissions FOR INSERT WITH CHECK (true);

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { sanitizeText, CAPS } from "@/lib/sanitize";
import { checkAuthRateLimit } from "@/lib/rateLimit";

export async function submitStory(formData: FormData) {
  // A Server Action can be invoked by POSTing its action id to any page,
  // including public ones, so the proxy guarding /stories does not protect
  // this function. It has to check the session itself.
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const limit = await checkAuthRateLimit(supabase, `user:${user.id}`, "story_submit", 3, 86400);
  if (!limit.allowed) {
    redirect(`/stories?error=${encodeURIComponent("You can submit up to 3 stories a day. Try again tomorrow.")}`);
  }

  const name = sanitizeText(formData.get("name"), 100);
  const undergrad_school = sanitizeText(formData.get("undergrad_school"), 100);
  const medical_school = sanitizeText(formData.get("medical_school"), 100);
  const background = sanitizeText(formData.get("background"), CAPS.generic);
  const quote = sanitizeText(formData.get("quote"), CAPS.generic);

  if (!name || !medical_school || !background || !quote) {
    redirect("/stories?error=Please+fill+in+all+required+fields");
  }

  const { error } = await supabase.from("story_submissions").insert({
    name,
    undergrad_school: undergrad_school || "",
    medical_school,
    background,
    quote,
  });

  if (error) {
    console.error("[stories]", error.message);
    redirect(`/stories?error=${encodeURIComponent("Something went wrong saving that. Please try again.")}`);
  }

  redirect("/stories?submitted=1");
}
