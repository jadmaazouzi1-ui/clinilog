import LegalPage from "@/components/LegalPage";

export const metadata = { title: "Privacy Policy | ClinicLog MD" };

export default function PrivacyPage() {
  return (
    <LegalPage page="/privacy" title="Privacy Policy" updated="27 OCT 2026">
      <p>
        ClinicLog MD helps pre-med students track their experiences and plan applications. This page
        explains, in plain terms, what we store, who can see it, and how to take it with you or delete it.
      </p>

      <h2>What we store</h2>
      <ul>
        <li><strong>Account:</strong> your email address and, if you give it, your name.</li>
        <li><strong>Profile:</strong> school, graduation year, intended specialty, and settings such as your theme.</li>
        <li><strong>Experiences:</strong> titles, organizations, categories, dates, hours, descriptions and reflections you log.</li>
        <li><strong>Application tracking:</strong> schools you mark, secondary essay notes, interviews, waitlist updates, letters of recommendation, fees, gap-year and post-bacc records.</li>
        <li><strong>AI results:</strong> your generated archetype, so it does not have to be regenerated each visit.</li>
        <li><strong>Usage records:</strong> daily counters that enforce fair-use limits, which pages are visited (to see which tools are used), and referral sign-ups.</li>
      </ul>

      <h2>Your data is private to you</h2>
      <p>
        Every record you create is visible only to your account. The database enforces this on every
        request, not just the app. We do not publish your entries, and other students cannot see them.
        The site shows only anonymous totals, such as total hours logged across all users.
      </p>

      <h2>AI features</h2>
      <p>
        When you use an AI feature (Archetype, Reframe, AI Advisor, Statement Outline, Mock Interview), the
        relevant text you entered, such as your experience descriptions and profile, is sent to
        Google&apos;s Gemini API to generate the result. It is sent only when you use the feature, and
        only your own data is included.
      </p>

      <h2>Who processes your data</h2>
      <ul>
        <li><strong>Supabase</strong> stores the database and handles sign-in.</li>
        <li><strong>Vercel</strong> hosts the website.</li>
        <li><strong>Google (Gemini API)</strong> processes text you send to the AI features.</li>
        <li><strong>Resend</strong> delivers the optional weekly summary email, if it is enabled.</li>
      </ul>

      <h2>We do not sell your data</h2>
      <p>We do not sell, rent or trade your personal information, and we do not use it for advertising.</p>
      <p>
        ClinicLog MD is independent of Wake Forest University. Your entries are not shared with the
        university, its advisors or its health professions committee. Anything you want them to see,
        you share yourself.
      </p>

      <h2>Emails</h2>
      <p>
        Account emails (confirmation, password reset) are sent when you request them. The optional weekly
        summary goes only to your own account email, only while you are actively logging, and every
        message has a one-click unsubscribe link.
      </p>

      <h2>Export or delete your data</h2>
      <p>
        On your <strong>Profile</strong> page you can download everything we store about you as a file,
        or permanently delete your account. Deleting your account removes your profile, experiences and
        every other record linked to it. Anonymous page-visit counts are kept but are no longer linked to you.
      </p>

      <h2>Security</h2>
      <p>
        Connections are encrypted, access to each record is restricted to its owner in the database, and
        sign-in attempts and AI requests are rate limited. No system is perfectly secure, so please use a
        password you do not use anywhere else.
      </p>

      <h2>Changes</h2>
      <p>If this policy changes, the date at the top of this page will change with it.</p>
    </LegalPage>
  );
}
