import Link from "next/link";

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-6">
          <svg
            className="w-8 h-8 text-indigo-600"
            fill="none"
            stroke="currentColor"
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

        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Check your email
        </h1>
        <p className="text-gray-500 text-base leading-relaxed mb-8">
          We sent a confirmation link to your email address. Click the link to
          activate your CliniLog account and start logging your clinical
          experiences.
        </p>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 text-left mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            Next steps
          </h2>
          <ol className="space-y-2.5 text-sm text-gray-500">
            <li className="flex items-start gap-2.5">
              <span className="flex-shrink-0 w-5 h-5 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                1
              </span>
              Open your email inbox
            </li>
            <li className="flex items-start gap-2.5">
              <span className="flex-shrink-0 w-5 h-5 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                2
              </span>
              Find the email from CliniLog
            </li>
            <li className="flex items-start gap-2.5">
              <span className="flex-shrink-0 w-5 h-5 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                3
              </span>
              Click the confirmation link to activate your account
            </li>
          </ol>
        </div>

        <p className="text-sm text-gray-400">
          Already confirmed?{" "}
          <Link
            href="/auth/login"
            className="text-indigo-600 font-medium hover:text-indigo-700"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
