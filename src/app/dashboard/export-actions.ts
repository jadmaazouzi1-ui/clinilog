"use server";

import { createClient } from "@/lib/supabase/server";
import { checkUserRateLimit } from "@/lib/rateLimit";

// Gate for client-side jsPDF generation: counts an export against the
// user's daily quota (10/day) before the PDF is built in the browser.
export async function recordPdfExport(): Promise<{ allowed: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { allowed: false, error: "Not authenticated." };

  const limit = await checkUserRateLimit(supabase, "pdf_export");
  if (!limit.allowed) {
    return { allowed: false, error: "Daily export limit reached (10/day). Come back tomorrow." };
  }
  return { allowed: true };
}
