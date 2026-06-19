import Link from "next/link";

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "#000000" }}>
      <div className="w-full max-w-md text-center">
        {/* Logo */}
        <div className="inline-flex items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#FFFFFF" }}>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="2,12 7,12 8,9 10,12 12,3 13,21 14,12 16,9 18,12 22,12" />
            </svg>
          </div>
          <span className="font-semibold text-xl" style={{ color: "#FFFFFF" }}>CliniLog</span>
        </div>

        {/* Icon */}
        <div
          className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6"
          style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)" }}
        >
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="#FFFFFF"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold mb-3" style={{ color: "#FFFFFF" }}>
          Check your email
        </h1>
        <p className="text-base leading-relaxed mb-8" style={{ color: "rgba(255,255,255,0.55)" }}>
          We sent a confirmation link to your email address. Click the link to
          activate your CliniLog account and start logging your clinical
          experiences.
        </p>

        <div className="glass-card rounded-2xl p-6 text-left mb-6">
          <h2 className="text-sm font-semibold mb-3" style={{ color: "rgba(255,255,255,0.85)" }}>
            Next steps
          </h2>
          <ol className="space-y-2.5 text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>
            {["Open your email inbox", "Find the email from CliniLog", "Click the confirmation link to activate your account"].map((step, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span
                  className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mt-0.5"
                  style={{ backgroundColor: "rgba(255,255,255,0.08)", color: "#FFFFFF", border: "1px solid rgba(255,255,255,0.15)" }}
                >
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>

        <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
          Already confirmed?{" "}
          <Link
            href="/auth/login"
            className="font-medium hover:opacity-80"
            style={{ color: "#FFFFFF" }}
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
