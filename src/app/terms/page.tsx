import LegalPage from "@/components/LegalPage";

export const metadata = { title: "Terms of Use | ClinicLog MD" };

export default function TermsPage() {
  return (
    <LegalPage page="/terms" title="Terms of Use" updated="27 OCT 2026">
      <p>By creating an account or using ClinicLog MD, you agree to these terms.</p>

      <h2>What ClinicLog MD is</h2>
      <p>
        A free tool for organizing your pre-med experiences and application planning. It is not an
        admissions service, and nothing on the site guarantees admission anywhere.
      </p>
      <p>
        Accounts are open to Wake Forest students with an @wfu.edu email address. ClinicLog MD is an
        independent project. It is not run, sponsored or endorsed by Wake Forest University.
      </p>

      <h2>Accuracy</h2>
      <p>
        School statistics are approximate and some are marked &ldquo;Not reported&rdquo; where a school does
        not publish them. AI-generated text (archetypes, reframed descriptions, advice, outlines, interview
        questions) can be wrong or incomplete. Verify anything important against official sources such as
        AAMC MSAR and the schools themselves, and make sure anything you submit in an application is true
        and in your own words.
      </p>

      <h2>Your account</h2>
      <ul>
        <li>Keep your password private. You are responsible for activity on your account.</li>
        <li>Only log experiences that are genuinely yours.</li>
        <li>You keep ownership of everything you write. You can export or delete it at any time from your Profile.</li>
      </ul>

      <h2>Acceptable use</h2>
      <ul>
        <li>Do not try to access other users&apos; data or bypass security controls or usage limits.</li>
        <li>Do not use automated scripts to overload the service or its AI features.</li>
        <li>Do not submit unlawful, abusive or misleading content, including in stories.</li>
      </ul>
      <p>Accounts that break these rules may be suspended or removed.</p>

      <h2>No warranty</h2>
      <p>
        ClinicLog MD is provided as-is, without warranties of any kind. To the extent the law allows, we are
        not liable for decisions made using the service, or for loss of data, so keep your own copies of
        anything important using the export feature.
      </p>

      <h2>Changes</h2>
      <p>These terms may be updated. The date at the top shows the latest version.</p>
    </LegalPage>
  );
}
