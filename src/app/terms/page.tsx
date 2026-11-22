// Draft generated from a code audit. Have a licensed attorney review before relying on it.
//
// Facts about data and features are backed by DATA_AUDIT.md. Bump
// LEGAL_VERSION in src/lib/legal.ts when a change is material so signed-in
// users accept the new version.
import Link from "next/link";
import LegalPage, { Section } from "@/components/LegalPage";
import { GOVERNING_LAW, LEGAL_EFFECTIVE, LEGAL_VERSION, OPERATOR } from "@/lib/legal";

export const metadata = {
  description: "The rules for using ClinicLog MD: who can use it, what it is and is not, and your content.",
};

const SECTIONS = [
  { id: "acceptance", title: "Agreeing to these terms" },
  { id: "eligibility", title: "Who can use ClinicLog MD" },
  { id: "service", title: "What ClinicLog MD is and is not" },
  { id: "content", title: "Your content" },
  { id: "use", title: "Rules for using the service" },
  { id: "ai", title: "AI features" },
  { id: "data", title: "School and specialty information" },
  { id: "changes-service", title: "Changes to the service and cost" },
  { id: "termination", title: "Ending your account" },
  { id: "ip", title: "Our content and your feedback" },
  { id: "links", title: "Links to other sites" },
  { id: "disclaimer", title: "No warranties" },
  { id: "liability", title: "Limit on our liability" },
  { id: "indemnity", title: "Your responsibility for claims" },
  { id: "law", title: "Governing law" },
  { id: "changes", title: "Changes to these terms" },
  { id: "general", title: "Other terms" },
  { id: "contact", title: "Contact" },
];

export default function TermsPage() {
  let n = 0;
  const num = () => ++n;
  return (
    <LegalPage
      title="Terms of Service"
      version={LEGAL_VERSION}
      effective={LEGAL_EFFECTIVE}
      sections={SECTIONS}
      summary={
        <ul>
          <li>You must be 18 or older, with your own @wfu.edu account.</li>
          <li>ClinicLog MD is a planning tool. It is not admissions advice and cannot promise you a spot anywhere.</li>
          <li>What you log is yours. You are responsible for making sure it is true. We do not check your hours.</li>
          <li>Never enter patient information. AI answers can be wrong.</li>
          <li>The service is provided as it is. We may change it, and we will give notice before charging for anything.</li>
        </ul>
      }
    >
      <Section id="acceptance" n={num()} title="Agreeing to these terms">
        <p>
          These terms are an agreement between you and {OPERATOR}, who runs ClinicLog MD (&ldquo;we&rdquo;,
          &ldquo;us&rdquo;). By creating an account or using cliniclogmd.com, you agree to these terms and to the{" "}
          <Link href="/privacy">Privacy Policy</Link>. If you do not agree, do not use the service.
        </p>
      </Section>

      <Section id="eligibility" n={num()} title="Who can use ClinicLog MD">
        <ul>
          <li>You must be 18 or older.</li>
          <li>You need an @wfu.edu email address to create an account.</li>
          <li>One account per person. Do not share your account or let anyone else use it.</li>
          <li>Keep your password safe. You are responsible for what happens under your account. Tell us if you think someone else has used it.</li>
        </ul>
      </Section>

      <Section id="service" n={num()} title="What ClinicLog MD is and is not">
        <p>
          ClinicLog MD helps you log clinical, shadowing, research and volunteer hours, track schools, letters and
          interviews, and prepare for medical school applications.
        </p>
        <ul>
          <li><strong>Not affiliated.</strong> ClinicLog MD is independent. It is not run, sponsored or endorsed by Wake Forest University, the AAMC, AMCAS, AACOM, AACOMAS, the NRMP or any medical school.</li>
          <li><strong>Not advice.</strong> Nothing in ClinicLog MD is admissions, career, legal, financial or medical advice. Talk to your pre-health advisor about your plans.</li>
          <li><strong>No guarantee.</strong> Using ClinicLog MD does not guarantee an interview, an acceptance or a match. Checks, benchmarks and scores in the app are planning aids, not requirements set by any school.</li>
          <li><strong>Not an application service.</strong> ClinicLog MD does not submit anything to AMCAS, AACOMAS or any school for you.</li>
          <li><strong>Not a medical record.</strong> It is not covered by HIPAA and must not hold patient information.</li>
        </ul>
      </Section>

      <Section id="content" n={num()} title="Your content">
        <p>
          Your entries, reflections, notes and other things you add (&ldquo;your content&rdquo;) belong to you. You give
          us permission to store, copy, process and display your content only as needed to run the service for you,
          including sending it to the companies listed in the Privacy Policy, such as Google when you use an AI feature.
          This permission ends when you delete the content or your account, except for copies in backups until they expire.
        </p>
        <p>
          <strong>You are responsible for your content being true.</strong> ClinicLog MD does not verify your hours,
          dates, supervisors or anything else you log. Applications ask you to certify that what you submit is accurate.
          Do not log hours you did not do.
        </p>
        <p>
          Your content must not include patient information (see the{" "}
          <Link href="/privacy#patients">Privacy Policy</Link>) or anything you do not have the right to share. If you
          submit a first-generation story for others to read, you give us permission to show it on the site until you
          ask us to remove it.
        </p>
      </Section>

      <Section id="use" n={num()} title="Rules for using the service">
        <p>Do not:</p>
        <ul>
          <li>Enter patient information, or personal information about other people beyond what you need (such as a recommender&apos;s name).</li>
          <li>Use ClinicLog MD to make false records for an application.</li>
          <li>Try to get into another person&apos;s account or data, or test the site&apos;s security without our written permission.</li>
          <li>Get around daily limits, rate limits or sign-up rules, or use bots or scrapers on the site.</li>
          <li>Upload or send anything harmful, illegal, abusive or that infringes someone else&apos;s rights.</li>
          <li>Disrupt or overload the service, or try to copy its code or data in bulk.</li>
          <li>Use the AI features to create content that breaks Google&apos;s rules for its Gemini service.</li>
        </ul>
      </Section>

      <Section id="ai" n={num()} title="AI features">
        <ul>
          <li>The AI Advisor, Archetype, Statement Outline and Mock Interview send parts of your content to Google&apos;s Gemini. The <Link href="/privacy#ai">Privacy Policy</Link> lists exactly what each one sends, and explains that Google may use it to improve its products and that people at Google may read it.</li>
          <li>AI answers can be wrong, out of date or made up, including facts about schools and specialties. Check anything important before you rely on it.</li>
          <li>Anything you submit in an application must be true and in your own words. Do not paste AI text into an application as if you wrote it. Schools and application services have their own rules about AI.</li>
          <li>Each AI feature has a daily limit, and we may change or turn off AI features at any time.</li>
        </ul>
      </Section>

      <Section id="data" n={num()} title="School and specialty information">
        <p>
          School GPA and MCAT figures come from each school&apos;s own website, and specialty match figures from the NRMP.
          Many schools do not publish figures, and figures change every cycle. They describe past classes and are not a
          prediction of your chances. See <Link href="/data-sources">Data sources</Link> for where each figure comes from.
          Always check the school&apos;s own site before you apply.
        </p>
      </Section>

      <Section id="changes-service" n={num()} title="Changes to the service and cost">
        <p>
          We may add, change or remove features at any time. We do not charge for ClinicLog MD today. If we ever plan to
          charge for any part of it, we will tell you before the charge starts, and you can download your data or delete
          your account first. We cannot promise the service will always exist or stay the same.
        </p>
      </Section>

      <Section id="termination" n={num()} title="Ending your account">
        <ul>
          <li>You can delete your account at any time on the Profile page. Deleting it removes your data as the Privacy Policy describes.</li>
          <li>We may suspend or close your account if you break these terms, if the law requires it, or if we need to protect the service or other users. When we can, we will tell you first and give you a chance to download your data.</li>
          <li>If we shut down ClinicLog MD, we will try to give you at least 30 days&apos; notice so you can download your data.</li>
          <li>Sections on your content, our content, no warranties, liability, claims and governing law still apply after your account ends.</li>
        </ul>
      </Section>

      <Section id="ip" n={num()} title="Our content and your feedback">
        <p>
          The ClinicLog MD name, logo, design, code and text we write belong to us. You may use them only to use the
          service. If you send us ideas or feedback, we may use them without paying you or owing you anything.
        </p>
      </Section>

      <Section id="links" n={num()} title="Links to other sites">
        <p>
          ClinicLog MD links to other websites, such as school pages, the AAMC and the NRMP. We do not control those
          sites and are not responsible for them. Their own terms and policies apply.
        </p>
      </Section>

      <Section id="disclaimer" n={num()} title="No warranties">
        <p>
          ClinicLog MD is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo;. To the fullest extent the law
          allows, we make no promises of any kind, including that the service will be accurate, complete, secure, without
          errors or always available, or that it fits any particular purpose. Keep your own copy of anything important.
        </p>
      </Section>

      <Section id="liability" n={num()} title="Limit on our liability">
        <p>
          To the fullest extent the law allows, we are not liable for any indirect, incidental, special or consequential
          damages, or for lost data, lost opportunities or admissions outcomes, that come from using or not being able to
          use ClinicLog MD. Our total liability for any claim about the service is limited to $50 or the amount you paid us
          in the 12 months before the claim, whichever is more. Some places do not allow these limits, so they may not all
          apply to you.
        </p>
      </Section>

      <Section id="indemnity" n={num()} title="Your responsibility for claims">
        <p>
          If someone makes a claim against us because of your content or because you broke these terms or the law, you
          agree to cover our reasonable costs from that claim, including legal fees, to the extent the law allows.
        </p>
      </Section>

      <Section id="law" n={num()} title="Governing law">
        <p>
          The laws of the State of {GOVERNING_LAW}, United States, govern these terms, without regard to rules about which
          law applies. Any dispute will be handled in the state or federal courts located in {GOVERNING_LAW}, unless the
          law where you live gives you the right to bring it somewhere else. Before filing a claim, please contact us so we
          can try to fix the problem.
        </p>
      </Section>

      <Section id="changes" n={num()} title="Changes to these terms">
        <p>
          If we change these terms in a way that matters, we will change the version number at the top, and the next time
          you sign in we will show you what changed and ask you to accept it before you continue. If you do not accept, you
          can stop using the service and delete your account. Small fixes, such as typos, may be made without a new version.
        </p>
      </Section>

      <Section id="general" n={num()} title="Other terms">
        <ul>
          <li><strong>Severability:</strong> if a court finds part of these terms cannot be enforced, the rest still applies.</li>
          <li><strong>Entire agreement:</strong> these terms and the Privacy Policy are the whole agreement between you and us about ClinicLog MD.</li>
          <li><strong>No waiver:</strong> if we do not enforce a term right away, we can still enforce it later.</li>
          <li><strong>Transfer:</strong> you may not transfer your account or these terms. We may transfer them if ClinicLog MD is passed to someone else, and we will tell you first.</li>
        </ul>
      </Section>

      <Section id="contact" n={num()} title="Contact">
        <p>
          Sign in, open the Help Center (the Help button in the sidebar or on your Profile page) and send a message under
          Report a problem.
        </p>
      </Section>
    </LegalPage>
  );
}
