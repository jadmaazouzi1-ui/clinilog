import Link from "next/link";
import type { Experience } from "@/lib/types";

const TYPES: [string, string][] = [
  ["clinical_work", "Clinical Work"],
  ["shadowing", "Shadowing"],
  ["research", "Research"],
  ["volunteer", "Volunteering"],
  ["other", "Other"],
];

/** The one form for adding and editing an experience. Field names and ids
 *  are what the server actions and the tour read; change them together. */
export default function ExperienceForm({
  action,
  values,
  submitLabel,
  cancelHref,
}: {
  action: (formData: FormData) => void | Promise<void>;
  values?: Experience;
  submitLabel: string;
  cancelHref: string;
}) {
  return (
    <form action={action} className="grid grid-cols-1 lg:grid-cols-12" style={{ gap: "var(--sp-4) var(--sp-6)" }}>
      <div className="lg:col-span-8" style={{ display: "grid", gap: "var(--sp-3)" }}>
        <div data-tour="f-placement" style={{ display: "grid", gap: "var(--sp-3)" }}>
          <div>
            <label htmlFor="title" className="label">What you did</label>
            <input
              id="title"
              name="title"
              type="text"
              required
              maxLength={200}
              defaultValue={values?.title}
              placeholder="Emergency department scribe"
              className="field"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: "var(--sp-3)" }}>
            <div>
              <label htmlFor="organization" className="label">Where</label>
              <input
                id="organization"
                name="organization"
                type="text"
                required
                maxLength={200}
                defaultValue={values?.organization}
                placeholder="Hospital, clinic, lab or group"
                className="field"
              />
            </div>
            <div>
              <label htmlFor="experience_type" className="label">AMCAS category</label>
              <select id="experience_type" name="experience_type" required className="field" defaultValue={values?.type ?? ""}>
                <option value="" disabled>
                  Choose one
                </option>
                {TYPES.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <fieldset className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: "var(--sp-3)" }} data-tour="f-dates">
          <legend className="sr-only">Dates and hours</legend>
          <div>
            <label htmlFor="start_date" className="label">Started</label>
            <input id="start_date" name="start_date" type="date" required defaultValue={values?.start_date} className="field tnum" />
          </div>
          <div>
            <label htmlFor="end_date" className="label">
              Ended <span className="optional">(leave blank if ongoing)</span>
            </label>
            <input id="end_date" name="end_date" type="date" defaultValue={values?.end_date ?? ""} className="field tnum" />
          </div>
          <div>
            <label htmlFor="hours" className="label">Total hours</label>
            <input
              id="hours"
              name="hours"
              type="number"
              inputMode="decimal"
              required
              min="0.1"
              max="1000"
              step="any"
              defaultValue={values?.hours}
              placeholder="40"
              className="field tnum"
              aria-describedby="hours-hint"
            />
            <p className="hint" id="hours-hint">Up to 1,000 per entry. Halves are fine.</p>
          </div>
        </fieldset>

        <div data-tour="f-desc">
          <label htmlFor="description" className="label">
            Description <span className="optional">(optional)</span>
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            defaultValue={values?.description ?? ""}
            placeholder="What you did, with numbers where you have them."
            className="field"
            aria-describedby="description-hint"
          />
          <p className="hint" id="description-hint">
            Rough notes now are fine. Never include patient names, dates of birth, record numbers or anything else that
            could identify a patient. <a href="/privacy#patients" className="link">Why</a>
          </p>
        </div>

        <div data-tour="f-reflection">
          <label htmlFor="reflection" className="label">
            Reflection <span className="optional">(optional)</span>
          </label>
          <textarea
            id="reflection"
            name="reflection"
            rows={4}
            defaultValue={values?.reflection ?? ""}
            placeholder="A moment or a mistake you still think about."
            className="field"
            aria-describedby="reflection-hint"
          />
          <p className="hint" id="reflection-hint">
            Write about what you learned, not who the patient was. Leave out names, ages with dates, rooms and anything
            else that could identify a patient or a staff member.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2" style={{ paddingTop: "var(--sp-1)" }}>
          <button type="submit" className="btn btn-primary" data-tour="f-save">
            {submitLabel}
          </button>
          <Link href={cancelHref} className="btn btn-ghost">
            Cancel
          </Link>
        </div>
      </div>

      <aside aria-label="Tips" className="lg:col-span-4 text-sm" style={{ color: "var(--text-muted)" }}>
        <div style={{ borderTop: "1px solid var(--border-strong)", paddingTop: "var(--sp-15)", display: "grid", gap: "var(--sp-15)" }}>
          <p>
            <strong style={{ color: "var(--text)" }}>One entry per role.</strong> If you scribed at the same hospital
            for a year, log it once with the total, and edit the hours as they grow.
          </p>
          <p>
            <strong style={{ color: "var(--text)" }}>Count what you can verify.</strong> AMCAS asks for a contact
            person for each experience, so round down rather than up.
          </p>
          <p>
            <strong style={{ color: "var(--text)" }}>Write the reflection soon.</strong> Before an interview it is
            the part you will want to reread, and it fades fastest. It is included in your PDF export.
          </p>
        </div>
      </aside>
    </form>
  );
}
