"use server";

/*
  Run the following SQL in your Supabase SQL editor to create the fee_waivers table:

  CREATE TABLE fee_waivers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    amount_saved NUMERIC(10,2),
    status TEXT NOT NULL DEFAULT 'Not Applied',
    deadline DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
  );
  ALTER TABLE fee_waivers ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Users can manage their own fee waivers" ON fee_waivers FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
*/

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function addWaiver(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const name = formData.get("name") as string;
  const amountSavedRaw = formData.get("amount_saved") as string;
  const status = formData.get("status") as string;
  const deadlineRaw = formData.get("deadline") as string;
  const notes = formData.get("notes") as string;

  const amount_saved = amountSavedRaw ? parseFloat(amountSavedRaw) : null;
  const deadline = deadlineRaw || null;

  await supabase.from("fee_waivers").insert({
    user_id: user.id,
    name,
    amount_saved,
    status: status || "Not Applied",
    deadline,
    notes: notes || null,
  });

  redirect("/fee-tracker");
}

export async function updateWaiverStatus(id: string, status: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  await supabase
    .from("fee_waivers")
    .update({ status })
    .eq("id", id)
    .eq("user_id", user.id);

  revalidatePath("/fee-tracker");
}

export async function deleteWaiver(id: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  await supabase
    .from("fee_waivers")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  redirect("/fee-tracker");
}
