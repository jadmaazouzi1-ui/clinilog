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

export async function submitStory(formData: FormData) {
  const name = sanitizeText(formData.get("name"), 100);
  const undergrad_school = sanitizeText(formData.get("undergrad_school"), 100);
  const medical_school = sanitizeText(formData.get("medical_school"), 100);
  const background = sanitizeText(formData.get("background"), CAPS.generic);
  const quote = sanitizeText(formData.get("quote"), CAPS.generic);

  if (!name || !medical_school || !background || !quote) {
    redirect("/stories?error=Please+fill+in+all+required+fields");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("story_submissions").insert({
    name,
    undergrad_school: undergrad_school || "",
    medical_school,
    background,
    quote,
  });

  if (error) {
    redirect(`/stories?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/stories?submitted=1");
}
