import Link from "next/link";
import AuthFrame from "@/components/AuthFrame";

export const metadata = {
  description: "Check your inbox for the confirmation link.",
};

export default function VerifyEmailPage() {
  return (
    <AuthFrame
      title="Check your Wake Forest inbox"
      intro="We sent a confirmation link to the address you signed up with. Open it on any device and your account is ready."
      footer={<>Already confirmed? <Link href="/auth/login" className="link">Sign in</Link></>}
    >
      <ul className="text-sm" style={{ display: "grid", gap: "var(--sp-15)", color: "var(--text-muted)" }}>
        <li>The email comes from ClinicLog MD and can take a few minutes.</li>
        <li>University mail filters sometimes hold it in quarantine or junk. Check there before signing up again.</li>
        <li>The link works once. If it has expired, sign up again with the same address.</li>
      </ul>
    </AuthFrame>
  );
}
