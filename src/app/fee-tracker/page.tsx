import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { addWaiver, updateWaiverStatus, deleteWaiver } from "./actions";
import Navbar from "@/components/Navbar";

type WaiverStatus = "Not Applied" | "Applied" | "Approved" | "Denied";

const STATUS_STYLES: Record<WaiverStatus, { background: string; color: string; border: string }> = {
  "Not Applied": {
    background: "rgba(248,250,252,0.08)",
    color: "rgba(248,250,252,0.5)",
    border: "1px solid rgba(248,250,252,0.15)",
  },
  Applied: {
    background: "rgba(0,212,255,0.1)",
    color: "#00D4FF",
    border: "1px solid rgba(0,212,255,0.3)",
  },
  Approved: {
    background: "rgba(16,185,129,0.1)",
    color: "#10B981",
    border: "1px solid rgba(16,185,129,0.3)",
  },
  Denied: {
    background: "rgba(255,71,87,0.1)",
    color: "#FF4757",
    border: "1px solid rgba(255,71,87,0.3)",
  },
};

function formatDeadline(dateStr: string | null) {
  if (!dateStr) return null;
  const [year, month, day] = dateStr.split("-");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[parseInt(month, 10) - 1]} ${parseInt(day, 10)}, ${year}`;
}

export default async function FeeTrackerPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: waivers } = await supabase
    .from("fee_waivers")
    .select("*")
    .order("created_at", { ascending: false });

  const waiverList = waivers ?? [];

  const totalSaved = waiverList
    .filter((w) => w.status === "Approved" && w.amount_saved != null)
    .reduce((sum: number, w) => sum + (w.amount_saved as number), 0);

  const appliedCount = waiverList.filter((w) => w.status === "Applied").length;
  const approvedCount = waiverList.filter((w) => w.status === "Approved").length;

  const stats = [
    { label: "Total Tracked", value: waiverList.length.toString(), unit: "waivers" },
    {
      label: "Total Saved",
      value: totalSaved > 0 ? `$${totalSaved.toFixed(2)}` : "$0",
      unit: "approved",
    },
    { label: "Applied", value: appliedCount.toString(), unit: "pending" },
    { label: "Approved", value: approvedCount.toString(), unit: "approved" },
  ];

  return (
    <div className="min-h-screen dot-grid-bg" style={{ backgroundColor: "#0A1628" }}>
      <Navbar userEmail={user.email ?? ""} activePath="/fee-tracker" />

      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Back link */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-medium mb-8"
          style={{ color: "#00D4FF" }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </Link>

        {/* Page heading */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1" style={{ color: "#F8FAFC" }}>Fee Assistance Tracker</h1>
          <p className="text-sm" style={{ color: "rgba(248,250,252,0.6)" }}>
            Track your fee waiver applications and see how much you&apos;ve saved.
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl p-5"
              style={{ backgroundColor: "#1E2A3A", border: "1px solid rgba(0,212,255,0.14)" }}
            >
              <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "rgba(248,250,252,0.6)" }}>
                {stat.label}
              </p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold" style={{ color: "#00D4FF" }}>{stat.value}</span>
                <span className="text-xs font-medium" style={{ color: "rgba(248,250,252,0.5)" }}>{stat.unit}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Add waiver form */}
        <div className="glass-card rounded-2xl p-6 mb-8">
          <h2 className="text-base font-semibold mb-5" style={{ color: "#F8FAFC" }}>Add Waiver</h2>
          <form action={addWaiver} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1.5" style={{ color: "rgba(248,250,252,0.85)" }}>
                  Program / Waiver Name <span style={{ color: "#FF4757" }}>*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="e.g. AAMC Fee Assistance"
                  className="input-dark w-full px-3.5 py-2.5 rounded-xl text-sm"
                />
              </div>

              {/* Amount Saved */}
              <div>
                <label htmlFor="amount_saved" className="block text-sm font-medium mb-1.5" style={{ color: "rgba(248,250,252,0.85)" }}>
                  Amount Saved ($){" "}
                  <span className="font-normal" style={{ color: "rgba(248,250,252,0.4)" }}>(optional)</span>
                </label>
                <input
                  id="amount_saved"
                  name="amount_saved"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="e.g. 2000.00"
                  className="input-dark w-full px-3.5 py-2.5 rounded-xl text-sm"
                />
              </div>

              {/* Status */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium mb-1.5" style={{ color: "rgba(248,250,252,0.85)" }}>
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  className="input-dark w-full px-3.5 py-2.5 rounded-xl text-sm"
                  defaultValue="Not Applied"
                >
                  <option value="Not Applied">Not Applied</option>
                  <option value="Applied">Applied</option>
                  <option value="Approved">Approved</option>
                  <option value="Denied">Denied</option>
                </select>
              </div>

              {/* Deadline */}
              <div>
                <label htmlFor="deadline" className="block text-sm font-medium mb-1.5" style={{ color: "rgba(248,250,252,0.85)" }}>
                  Deadline{" "}
                  <span className="font-normal" style={{ color: "rgba(248,250,252,0.4)" }}>(optional)</span>
                </label>
                <input
                  id="deadline"
                  name="deadline"
                  type="date"
                  className="input-dark w-full px-3.5 py-2.5 rounded-xl text-sm"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium mb-1.5" style={{ color: "rgba(248,250,252,0.85)" }}>
                Notes{" "}
                <span className="font-normal" style={{ color: "rgba(248,250,252,0.4)" }}>(optional)</span>
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                placeholder="Any notes about this waiver..."
                className="input-dark w-full px-3.5 py-2.5 rounded-xl text-sm resize-none"
              />
            </div>

            <div className="pt-1">
              <button
                type="submit"
                className="inline-flex items-center gap-2 teal-glow px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors focus:outline-none"
                style={{ backgroundColor: "#00D4FF", color: "#0A1628" }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Waiver
              </button>
            </div>
          </form>
        </div>

        {/* Waiver list */}
        {waiverList.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center">
            <div
              className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-4"
              style={{ background: "rgba(0,212,255,0.1)" }}
            >
              <svg className="w-7 h-7" fill="none" stroke="#00D4FF" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold mb-2" style={{ color: "#F8FAFC" }}>No waivers tracked yet</h2>
            <p className="text-sm max-w-sm mx-auto" style={{ color: "rgba(248,250,252,0.6)" }}>
              Add your first fee waiver above to start tracking your applications and savings.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide mb-4" style={{ color: "rgba(248,250,252,0.5)" }}>
              Your Waivers
            </h2>
            {waiverList.map((waiver) => {
              const status = waiver.status as WaiverStatus;
              const badgeStyle = STATUS_STYLES[status] ?? STATUS_STYLES["Not Applied"];
              const deadlineFormatted = formatDeadline(waiver.deadline);

              return (
                <div key={waiver.id} className="glass-card rounded-2xl p-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap mb-1">
                        <h3 className="text-sm font-semibold" style={{ color: "#F8FAFC" }}>
                          {waiver.name}
                        </h3>
                        <span
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          style={badgeStyle}
                        >
                          {waiver.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs flex-wrap" style={{ color: "rgba(248,250,252,0.5)" }}>
                        {waiver.amount_saved != null && (
                          <span className="font-semibold" style={{ color: "#10B981" }}>
                            ${Number(waiver.amount_saved).toFixed(2)} saved
                          </span>
                        )}
                        {deadlineFormatted && (
                          <span>Deadline: {deadlineFormatted}</span>
                        )}
                      </div>

                      {waiver.notes && (
                        <p className="mt-2 text-xs leading-relaxed" style={{ color: "rgba(248,250,252,0.6)" }}>
                          {waiver.notes}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Inline status update */}
                      <form
                        action={async (formData: FormData) => {
                          "use server";
                          const newStatus = formData.get("status") as string;
                          await updateWaiverStatus(waiver.id, newStatus);
                        }}
                        className="flex items-center gap-2"
                      >
                        <select
                          name="status"
                          defaultValue={waiver.status}
                          className="input-dark text-xs px-2.5 py-1.5 rounded-lg"
                          style={{ minWidth: "110px" }}
                        >
                          <option value="Not Applied">Not Applied</option>
                          <option value="Applied">Applied</option>
                          <option value="Approved">Approved</option>
                          <option value="Denied">Denied</option>
                        </select>
                        <button
                          type="submit"
                          className="text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors"
                          style={{ color: "#00D4FF", border: "1px solid rgba(0,212,255,0.35)", background: "rgba(0,212,255,0.08)" }}
                        >
                          Update
                        </button>
                      </form>

                      {/* Delete */}
                      <form action={deleteWaiver.bind(null, waiver.id)}>
                        <button
                          type="submit"
                          className="p-2 rounded-lg transition-colors"
                          style={{ color: "#FF4757", border: "1px solid rgba(255,71,87,0.25)", background: "rgba(255,71,87,0.08)" }}
                          aria-label="Delete waiver"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
