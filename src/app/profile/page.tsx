import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { upsertProfile } from "./actions";
import AppShell from "@/components/AppShell";
import { Notice } from "@/components/ui";
import ReferralPanel from "./ReferralPanel";
import AccountData from "./AccountData";
import WeeklySummaryToggle from "./WeeklySummaryToggle";
import { LEGAL_VERSION } from "@/lib/legal";
import HelpButton from "@/components/tour/HelpButton";
import { ReminderSettings, BreakSettings } from "./ReminderSettings";
import WalletCard from "@/components/WalletCard";
import { ensureReferralCode, referralCount } from "@/lib/referral";
import { Experience } from "@/lib/types";

export const metadata = {
  description: "Your profile, graduation year, referral link, wallet card and data export.",
};

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { saved, error: pageError } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const [referral, refCount, { data: expRows }, { data: notifPrefs }, { data: breakRows }] = await Promise.all([
    ensureReferralCode(user.id),
    referralCount(user.id),
    supabase.from("experiences").select("*"),
    supabase.from("notification_prefs").select("reminders_enabled, gap_days, pause_in_breaks").eq("user_id", user.id).maybeSingle(),
    supabase.from("user_breaks").select("id, start_date, end_date").eq("user_id", user.id).order("start_date", { ascending: false }),
  ]);
  const experiences: Experience[] = (expRows ?? []) as Experience[];

  return (
    <AppShell userEmail={user.email ?? ""} activePath="/profile">

      <main className="page">
        {/* Back link */}
        <Link
          href="/dashboard"
          className="link text-sm inline-block" style={{ marginBottom: "var(--sp-15)" }}>
          Back to Overview
        </Link>

        {saved === "1" && (
          <div style={{ marginBottom: "var(--sp-3)" }}>
            <Notice tone="success">Saved.</Notice>
          </div>
        )}

        {pageError && (
          <div style={{ marginBottom: "var(--sp-3)" }}>
            <Notice tone="danger">{decodeURIComponent(pageError)}</Notice>
          </div>
        )}

        <div className="flex items-start justify-between gap-3" style={{ marginBottom: "var(--sp-4)" }}>
          <h1 className="text-2xl">Profile and settings</h1>
          <HelpButton className="md:hidden" tourId="help-profile" />
        </div>

        <Settings title="Your details" note="Your graduation year sets the timeline for the suggestions on Overview.">
          <form action={upsertProfile} className="space-y-6">
            {/* Full Name */}
            <div>
              <label
                htmlFor="full_name"
                className="label"
              >
                Full name
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                defaultValue={profile?.full_name ?? ""}
                placeholder="e.g. Jane Smith"
                className="field"
              />
            </div>

            {/* Undergraduate School */}
            <div>
              <label
                htmlFor="undergraduate_school"
                className="label"
              >
                Undergraduate school
              </label>
              <input
                id="undergraduate_school"
                name="undergraduate_school"
                type="text"
                list="university-list"
                defaultValue={profile?.undergraduate_school ?? ""}
                placeholder="Start typing your school..."
                className="field"
              />
              <datalist id="university-list">
                <option value="Arizona State University" />
                <option value="Boston College" />
                <option value="Boston University" />
                <option value="Brandeis University" />
                <option value="Brown University" />
                <option value="California Institute of Technology" />
                <option value="Carnegie Mellon University" />
                <option value="Case Western Reserve University" />
                <option value="City University of New York" />
                <option value="Clemson University" />
                <option value="Columbia University" />
                <option value="Cornell University" />
                <option value="Dartmouth College" />
                <option value="Duke University" />
                <option value="Emory University" />
                <option value="Florida International University" />
                <option value="Florida State University" />
                <option value="Fordham University" />
                <option value="George Washington University" />
                <option value="Georgetown University" />
                <option value="Georgia Institute of Technology" />
                <option value="Harvard University" />
                <option value="Howard University" />
                <option value="Indiana University Bloomington" />
                <option value="Johns Hopkins University" />
                <option value="Lehigh University" />
                <option value="Louisiana State University" />
                <option value="Loyola University Chicago" />
                <option value="Massachusetts Institute of Technology" />
                <option value="Miami University" />
                <option value="Michigan State University" />
                <option value="New York University" />
                <option value="North Carolina State University" />
                <option value="Northeastern University" />
                <option value="Northwestern University" />
                <option value="Ohio State University" />
                <option value="Penn State University" />
                <option value="Princeton University" />
                <option value="Purdue University" />
                <option value="Rice University" />
                <option value="Rutgers University" />
                <option value="Stanford University" />
                <option value="Stony Brook University" />
                <option value="Syracuse University" />
                <option value="Temple University" />
                <option value="Tufts University" />
                <option value="Tulane University" />
                <option value="University of Alabama" />
                <option value="University of Arizona" />
                <option value="University of California, Berkeley" />
                <option value="University of California, Davis" />
                <option value="University of California, Irvine" />
                <option value="University of California, Los Angeles" />
                <option value="University of California, Riverside" />
                <option value="University of California, San Diego" />
                <option value="University of California, Santa Barbara" />
                <option value="University of Chicago" />
                <option value="University of Colorado Boulder" />
                <option value="University of Connecticut" />
                <option value="University of Florida" />
                <option value="University of Georgia" />
                <option value="University of Houston" />
                <option value="University of Illinois Chicago" />
                <option value="University of Illinois Urbana-Champaign" />
                <option value="University of Iowa" />
                <option value="University of Kansas" />
                <option value="University of Kentucky" />
                <option value="University of Maryland" />
                <option value="University of Massachusetts Amherst" />
                <option value="University of Miami" />
                <option value="University of Michigan" />
                <option value="University of Minnesota" />
                <option value="University of Missouri" />
                <option value="University of Nebraska" />
                <option value="University of North Carolina at Chapel Hill" />
                <option value="University of Notre Dame" />
                <option value="University of Oregon" />
                <option value="University of Pennsylvania" />
                <option value="University of Pittsburgh" />
                <option value="University of Rochester" />
                <option value="University of South Carolina" />
                <option value="University of Southern California" />
                <option value="University of Tennessee" />
                <option value="University of Texas at Austin" />
                <option value="University of Texas at Dallas" />
                <option value="University of Utah" />
                <option value="University of Virginia" />
                <option value="University of Washington" />
                <option value="University of Wisconsin-Madison" />
                <option value="Vanderbilt University" />
                <option value="Villanova University" />
                <option value="Virginia Tech" />
                <option value="Wake Forest University" />
                <option value="Washington University in St. Louis" />
                <option value="Yale University" />
              </datalist>
            </div>

            {/* Graduation Year */}
            <div data-tour="profile-grad-year">
              <label
                htmlFor="graduation_year"
                className="label"
              >
                Graduation year
              </label>
              <input
                id="graduation_year"
                name="graduation_year"
                type="number"
                min={2000}
                max={2040}
                defaultValue={profile?.graduation_year ?? ""}
                placeholder="e.g. 2026"
                className="field"
              />
            </div>

            {/* Intended Specialty */}
            <div>
              <label
                htmlFor="intended_specialty"
                className="label"
              >
                Intended specialty
              </label>
              <input
                id="intended_specialty"
                name="intended_specialty"
                type="text"
                defaultValue={profile?.intended_specialty ?? ""}
                placeholder="e.g. Internal Medicine"
                className="field"
              />
            </div>

            <hr className="rule" />

            {/* Committee letter tracker */}
            <h3 className="text-base" style={{ marginBottom: "var(--sp-1)" }}>Committee letter</h3>
            <div style={{ marginBottom: "var(--sp-2)" }}>
              <label className="flex items-center gap-2 text-sm" style={{ color: "var(--text)", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  name="committee_letter_required"
                  defaultChecked={profile?.committee_letter_required ?? false}
                  style={{ accentColor: "var(--text)", width: 15, height: 15 }}
                />
                My schools require a committee letter
              </label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: "var(--sp-2)", marginBottom: "var(--sp-2)" }}>
              <div>
                <label htmlFor="committee_letter_status" className="label">Status</label>
                <select
                  id="committee_letter_status"
                  name="committee_letter_status"
                  defaultValue={profile?.committee_letter_status ?? "Not Started"}
                  className="field"
                >
                  {["Not Started", "Requested", "In Progress", "Submitted", "Not Required"].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="amcas_target_date" className="label">AMCAS opening date <span className="optional">(for the countdown)</span></label>
                <input
                  id="amcas_target_date"
                  name="amcas_target_date"
                  type="date"
                  defaultValue={profile?.amcas_target_date ?? ""}
                  className="field"
                />
              </div>
            </div>
            <div style={{ marginBottom: "var(--sp-2)" }}>
              <label htmlFor="committee_letter_notes" className="label">Notes</label>
              <textarea
                id="committee_letter_notes"
                name="committee_letter_notes"
                rows={3}
                defaultValue={profile?.committee_letter_notes ?? ""}
                placeholder="Deadline for the committee packet, who to contact"
                className="field"
              />
            </div>

            <div className="pt-2">
              <button type="submit" className="btn btn-primary">
                Save details
              </button>
            </div>
          </form>
        </Settings>

        <Settings title="Emails, reminders and breaks" note="The weekly summary is on until you turn it off. Gap reminders are off unless you turn them on. Breaks pause the gap check." tour="reminders">
          <WeeklySummaryToggle initialOn={!profile?.digest_opt_out} />
          <ReminderSettings initial={notifPrefs ?? null} />
          <BreakSettings initial={breakRows ?? []} />
        </Settings>

        <Settings title="Invite a classmate" note="Anyone who signs up through your link is counted here." tour="referral">
          <ReferralPanel code={referral} count={refCount} />
        </Settings>

        <Settings title="Wallet card" note="A wallet-sized PDF with your totals and top placements, to carry into an interview." tour="wallet-card">
          <WalletCard
            name={profile?.full_name ?? user.email ?? "Applicant"}
            experiences={experiences}
            archetype={profile?.archetype_id ?? null}
          />
        </Settings>
        <Settings title="Privacy and data" note="Download everything, or delete the account and every entry with it." tour="account-data">
          <p className="text-sm" style={{ color: "var(--text-muted)", marginBottom: "var(--sp-2)" }}>
            {profile?.legal_version
              ? <>You accepted the Terms and Privacy Policy version {profile.legal_version}
                  {profile.legal_accepted_at ? <> on {new Date(profile.legal_accepted_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}</> : null}.
                  {profile.legal_version !== LEGAL_VERSION ? " A newer version is waiting for you." : ""}{" "}</>
              : null}
            Read the <Link href="/privacy" className="link">Privacy Policy</Link> and the{" "}
            <Link href="/terms" className="link">Terms of Service</Link>.
          </p>
          <AccountData />
        </Settings>
      </main>
    </AppShell>
  );
}

/** One settings group: what it is on the left, the controls on the right. */
function Settings({ title, note, tour, children }: { title: string; note?: string; tour?: string; children: React.ReactNode }) {
  return (
    <section className="grid lg:grid-cols-12" style={{ gap: "var(--sp-2) var(--sp-4)", padding: "var(--sp-4) 0", borderTop: "1px solid var(--border-strong)" }} data-tour={tour}>
      <div className="lg:col-span-4">
        <h2 className="section-title">{title}</h2>
        {note ? <p className="text-sm" style={{ color: "var(--text-muted)" }}>{note}</p> : null}
      </div>
      <div className="lg:col-span-8">{children}</div>
    </section>
  );
}
