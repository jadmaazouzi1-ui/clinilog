// Draft generated from a code audit. Have a licensed attorney review before relying on it.
//
// Every statement here is backed by DATA_AUDIT.md. Change the code or the
// audit first, then this page, and bump LEGAL_VERSION in src/lib/legal.ts
// when the change is material so signed-in users accept it again.
import Link from "next/link";
import LegalPage, { Section } from "@/components/LegalPage";
import { LEGAL_EFFECTIVE, LEGAL_VERSION, OPERATOR } from "@/lib/legal";

export const metadata = {
  description: "What ClinicLog MD collects, what the AI features send to Google, and how to export or delete it.",
};

const SECTIONS = [
  { id: "who", title: "Who we are" },
  { id: "collect", title: "What we collect" },
  { id: "use", title: "How we use it" },
  { id: "ai", title: "AI features" },
  { id: "sharing", title: "Who receives your data" },
  { id: "patients", title: "Do not enter patient information" },
  { id: "choices", title: "Your choices" },
  { id: "retention", title: "How long we keep it" },
  { id: "security", title: "Security" },
  { id: "cookies", title: "Cookies and browser storage" },
  { id: "age", title: "Age limit" },
  { id: "international", title: "Where your data is stored" },
  { id: "rights", title: "California, EU and UK rights" },
  { id: "changes", title: "Changes to this policy" },
  { id: "contact", title: "Contact" },
];

export default function PrivacyPage() {
  let n = 0;
  const num = () => ++n;
  return (
    <LegalPage
      title="Privacy Policy"
      version={LEGAL_VERSION}
      effective={LEGAL_EFFECTIVE}
      sections={SECTIONS}
      summary={
        <ul>
          <li>We store what you log so you can track your hours and applications. Only your account can see it.</li>
          <li>We do not sell your data, show ads or use tracking cookies.</li>
          <li>
            AI features send your entries to Google&apos;s Gemini, only when you use one. Google may use that text to
            improve its products, and people at Google may read it.
          </li>
          <li>Never enter patient names or anything else that could identify a patient.</li>
          <li>You can download your data or delete your account at any time from your Profile page.</li>
        </ul>
      }
    >
      <Section id="who" n={num()} title="Who we are">
        <p>
          ClinicLog MD (&ldquo;we&rdquo;, &ldquo;us&rdquo;) is a website at cliniclogmd.com that helps pre-med students
          log clinical hours and plan medical school applications. It is run by {OPERATOR}, an individual, in the United
          States. It is an independent project and is not run, sponsored or endorsed by Wake Forest University, the AAMC,
          AACOM or any medical school.
        </p>
        <p>
          This policy explains what we collect, why, who else receives it and what you can do about it. To reach us, see{" "}
          <a href="#contact">Contact</a>.
        </p>
      </Section>

      <Section id="collect" n={num()} title="What we collect">
        <h3>What you give us</h3>
        <ul>
          <li><strong>Account:</strong> your email address (it must be an @wfu.edu address), your password and your name. Your password is stored only as a scrambled hash by our sign-in provider. We never see it.</li>
          <li><strong>Profile:</strong> undergraduate school, graduation year, intended specialty, AMCAS target date, committee letter status and notes, and your theme choice.</li>
          <li><strong>Experiences:</strong> title, organization, category, dates, hours, description and reflection for each entry.</li>
          <li><strong>Application tracking:</strong> your school list, secondary prompts and notes, deadlines and fees, interviews and waitlist updates, letters of recommendation (including your recommenders&apos; names), fee waivers, gap-year plans, post-bacc courses and grades, and breaks.</li>
          <li><strong>AI results:</strong> your archetype result and when it was made. Advisor chats, statement outlines and mock interview results are not saved.</li>
          <li><strong>Feedback:</strong> anything you send through the Help Center, with the page you sent it from.</li>
          <li><strong>Stories:</strong> if you submit a first-generation story, the name, schools, background and quote you enter. Stories are not linked to your account.</li>
        </ul>
        <h3>What we create automatically</h3>
        <ul>
          <li><strong>Page views:</strong> which page you opened, when, and your account if you are signed in. We do not record your IP address or browser details with page views.</li>
          <li><strong>Usage counters:</strong> how many times a day you used an AI feature or an export, to enforce daily limits.</li>
          <li><strong>Sign-in protection:</strong> counts of sign-in and password reset attempts, kept under your IP address or email address, to slow down password guessing.</li>
          <li><strong>Email records:</strong> which emails we sent you and whether they went through.</li>
          <li><strong>Referrals:</strong> if you signed up through a classmate&apos;s link, that link&apos;s code. Your classmate sees only a count of sign-ups, not who signed up.</li>
          <li><strong>Server logs:</strong> our host, Netlify, logs each request (IP address, page, browser type and time) under its own policy. We do not use these logs for anything but running the site.</li>
        </ul>
        <h3>What we do not keep</h3>
        <ul>
          <li>GPA, MCAT and home state you type on the Schools page stay in your browser and are gone when you leave the page.</li>
          <li>Files you import are read in your browser. Only the entries you choose to save are stored.</li>
          <li>We do not collect payment details, your location, your contacts or anything from other websites.</li>
        </ul>
      </Section>

      <Section id="use" n={num()} title="How we use it">
        <ul>
          <li>To run the service: show your entries, totals, checks and trackers, and build your exports and PDFs.</li>
          <li>To run the AI features you choose to use (see <a href="#ai">AI features</a>).</li>
          <li>To send the emails described in <a href="#choices">Your choices</a>.</li>
          <li>To keep the service safe: daily limits, sign-in protection and fixing problems you report.</li>
          <li>To see which tools are used, as totals across all users. Only the operator sees these totals.</li>
        </ul>
        <p>
          <strong>We do not sell your data.</strong> We do not rent or trade it, use it for advertising or share it for
          ads on other sites. We do not share your entries with Wake Forest, its advisors, its health professions
          committee or any school. Anything you want them to see, you share yourself.
        </p>
      </Section>

      <Section id="ai" n={num()} title="AI features">
        <p>
          Four features use Google&apos;s Gemini API: the AI Advisor, Archetype, Statement Outline and Mock Interview.
          Nothing goes to Google until you open the Advisor and send a message, or press a button to generate a result.
          Each button has a note next to it that says what it sends.
        </p>
        <table className="table">
          <thead>
            <tr><th scope="col">Feature</th><th scope="col">What is sent to Google</th></tr>
          </thead>
          <tbody>
            <tr>
              <td>AI Advisor</td>
              <td>Your messages in that conversation, plus a profile summary: your archetype, intended specialty, graduation year, total hours and hours by category, and for your 12 entries with the most hours, the title, organization, category, hours and the first 300 characters of the description and of the reflection.</td>
            </tr>
            <tr>
              <td>Archetype</td>
              <td>Your graduation year, intended specialty and every entry, with title, organization, category, hours, dates and the full description and reflection.</td>
            </tr>
            <tr><td>Statement Outline</td><td>The same profile summary as the AI Advisor.</td></tr>
            <tr><td>Mock Interview</td><td>The same profile summary as the AI Advisor.</td></tr>
          </tbody>
        </table>
        <p>
          We never send your name, email address or school to Google. Your entries may still contain personal details if
          you wrote them there.
        </p>
        <div className="legal-callout">
          <p>
            <strong>How Google uses it.</strong> ClinicLog MD uses Google&apos;s unpaid Gemini API service. Under
            Google&apos;s terms for that service, Google uses what is sent, and what it sends back, to provide, improve
            and develop its products and machine learning technology. People at Google may read and label that text after
            Google disconnects it from our account. Google asks that sensitive, confidential or personal information not
            be sent to this service. So keep personal details, and anything about patients, out of entries you use with AI
            features, or do not use them.
          </p>
        </div>
        <p>
          Read Google&apos;s terms at{" "}
          <a href="https://aistudio.google.com/docs/terms" rel="noopener noreferrer">aistudio.google.com/docs/terms</a>.
          We save only your archetype result. AI answers can be wrong. Check anything important with your pre-health
          advisor or the school.
        </p>
        <p>
          Each AI feature has a daily limit per account (for example, 20 Advisor messages a day).
        </p>
      </Section>

      <Section id="sharing" n={num()} title="Who receives your data">
        <p>These companies process data for us so the service can run. We do not give your data to anyone else, except when the law requires it.</p>
        <table className="table">
          <thead>
            <tr><th scope="col">Company</th><th scope="col">What it does</th><th scope="col">What it receives</th></tr>
          </thead>
          <tbody>
            <tr><td>Supabase</td><td>Database and sign-in. Sends sign-up confirmation and password reset emails, directly or through an email service we choose.</td><td>Everything listed in What we collect, except Netlify&apos;s logs. Stored in the United States.</td></tr>
            <tr><td>Netlify</td><td>Hosts the website</td><td>Every request as it passes through: IP address, page, browser type, and the pages and forms you load and send</td></tr>
            <tr><td>Google (Gemini API)</td><td>AI features</td><td>Only what the <a href="#ai">AI features</a> table lists, only when you use one</td></tr>
            <tr><td>Resend</td><td>Sends weekly summary and reminder emails</td><td>Your email address and the email&apos;s content: hours and entry counts, and for reminders, entry titles and dates. Never descriptions or reflections.</td></tr>
          </tbody>
        </table>
        <p>
          We may share information if the law requires it, to protect someone&apos;s safety, or to investigate abuse of the
          service. If ClinicLog MD is ever transferred to someone else, your data would move only under this policy, and we
          would tell you first.
        </p>
      </Section>

      <Section id="patients" n={num()} title="Do not enter patient information">
        <div className="legal-callout">
          <p>
            <strong>Never enter information that could identify a patient.</strong> That means names, initials, dates of
            birth, the exact date of a patient&apos;s visit, room or bed numbers, medical record numbers, photos, addresses or rare details
            that point to one person. Write about what you did and learned, not who the patient was.
          </p>
          <p>
            ClinicLog MD is not a medical record system. It is not covered by HIPAA, and it is not built to protect health
            information the way a hospital system is. Your site, clinic or hospital may also have its own rules about what
            you can write down. Follow them.
          </p>
        </div>
        <p>If you find patient information in an entry, edit the entry to remove it. Deleting or editing an entry removes the old text from the live database right away.</p>
      </Section>

      <Section id="choices" n={num()} title="Your choices">
        <ul>
          <li><strong>See and edit:</strong> everything you log is on its own page in the app. Edit or delete any entry at any time. Your details are on the Profile page.</li>
          <li><strong>Download:</strong> Profile, Privacy and data, Export my data gives you a JSON file of your profile, entries, school list, interviews, letters, trackers, reminder settings, breaks, tour progress, email records and referrals. You can also download your experiences as a PDF.</li>
          <li><strong>Delete your account:</strong> Profile, Privacy and data, Delete my account. It removes your account, all your entries and trackers, your feedback, your page view history and the password reset counter for your email right away.</li>
          <li><strong>Weekly summary email:</strong> on by default. It goes out only in weeks when you add an entry. Turn it off on the Profile page or with the link in any summary.</li>
          <li><strong>Gap reminders:</strong> off unless you turn them on in Profile. Every reminder has a link to turn reminders off.</li>
          <li><strong>AI features:</strong> optional. If you never use them, nothing is sent to Google.</li>
          <li><strong>Account emails</strong> such as sign-up confirmation and password reset are sent only when you ask for them.</li>
        </ul>
      </Section>

      <Section id="retention" n={num()} title="How long we keep it">
        <ul>
          <li>Your account data stays until you delete it or delete your account.</li>
          <li>When you delete something, it leaves the live database right away. Our database provider keeps backups for a limited time, so a deleted item can remain in a backup until that backup expires. We do not restore deleted accounts from backups.</li>
          <li>Sign-in protection counters kept under an IP address are not tied to your account and are not removed when you delete it. They hold only a count and a time.</li>
          <li>Stories you submitted are not linked to your account, so deleting your account does not remove them. Ask us through the Help Center and we will remove yours.</li>
          <li>Netlify keeps its request logs, and Google keeps AI inputs, under their own policies.</li>
        </ul>
      </Section>

      <Section id="security" n={num()} title="Security">
        <p>What we do:</p>
        <ul>
          <li>The database checks every request so each account can read and change only its own records.</li>
          <li>All traffic uses HTTPS. Pages block other sites from running scripts on them or framing them.</li>
          <li>Passwords are handled by our sign-in provider and stored only as hashes.</li>
          <li>Sign-in, password reset, AI features and exports have rate limits.</li>
          <li>Secret keys for the database, Google and Resend stay on the server and never reach your browser.</li>
        </ul>
        <p>
          No website is perfectly secure, and we cannot promise your data will never be exposed. The operator can access the
          database to run, fix and secure the service. If we learn of a breach that affects your data, we will tell you as
          the law requires. Use a password you do not use anywhere else.
        </p>
      </Section>

      <Section id="cookies" n={num()} title="Cookies and browser storage">
        <table className="table">
          <thead>
            <tr><th scope="col">Name</th><th scope="col">Type</th><th scope="col">Why</th></tr>
          </thead>
          <tbody>
            <tr><td>sb-&hellip;-auth-token</td><td>Cookie</td><td>Keeps you signed in</td></tr>
            <tr><td>cliniclog_ref</td><td>Cookie, 30 days</td><td>Remembers a classmate&apos;s referral code from a sign-up link until you sign in</td></tr>
            <tr><td>cliniclog-theme</td><td>Browser storage</td><td>Remembers light or dark mode</td></tr>
          </tbody>
        </table>
        <p>
          That is all. We use no analytics, advertising or tracking cookies, and load no scripts from other companies. Fonts
          are served from our own site.
        </p>
      </Section>

      <Section id="age" n={num()} title="Age limit">
        <p>
          You must be 18 or older to use ClinicLog MD. We do not knowingly collect data from anyone under 18. If you
          believe someone under 18 has an account, tell us and we will delete it.
        </p>
      </Section>

      <Section id="international" n={num()} title="Where your data is stored">
        <p>
          Your data is stored in the United States, in Supabase&apos;s us-east-2 region. Netlify may serve pages from
          servers in other countries. ClinicLog MD is built for students in the United States. Google does not allow its
          unpaid Gemini service to be offered to people in the European Economic Area, Switzerland or the United Kingdom,
          so do not use the AI features from there.
        </p>
      </Section>

      <Section id="rights" n={num()} title="California, EU and UK rights">
        <p>
          Depending on where you live, you may have the right to know what we hold about you, get a copy, correct it,
          delete it, and object to or limit how we use it. Most of these you can do yourself from the Profile page. For
          anything else, contact us and we will answer within the time the law allows. We will not treat you differently
          for using these rights.
        </p>
        <ul>
          <li><strong>California:</strong> we do not sell or share personal information as California law defines those words, and we do not use sensitive personal information to infer things about you.</li>
          <li>
            <strong>EU and UK:</strong> we use your data to provide the service you signed up for, to run the AI features
            you choose to use, and for our legitimate interest in keeping the service secure. Your data is transferred to
            and stored in the United States. You can complain to your local data protection authority.
          </li>
        </ul>
      </Section>

      <Section id="changes" n={num()} title="Changes to this policy">
        <p>
          If we change this policy in a way that matters, we will change the version number at the top, and the next time
          you sign in we will show you what changed and ask you to accept it before you continue. Small fixes, such as
          typos, may be made without a new version.
        </p>
      </Section>

      <Section id="contact" n={num()} title="Contact">
        <p>
          Sign in, open the Help Center (the Help button in the sidebar or on your Profile page) and send a message
          under Report a problem. Say that your message is a privacy request.
        </p>
        <p>
          See also the <Link href="/terms">Terms of Service</Link> and <Link href="/data-sources">Data sources</Link>.
        </p>
      </Section>
    </LegalPage>
  );
}
