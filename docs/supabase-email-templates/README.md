# Supabase auth email templates

Supabase sends the sign-up confirmation, password reset and magic link emails
itself, so they cannot be changed from the app code. Paste these in by hand.

1. Open https://supabase.com/dashboard/project/tsapqeaxqveiwvqxcaap/auth/templates
   (Authentication, then Emails, then the Templates tab).
2. Choose **Confirm signup**. Set the subject to `Confirm your ClinicLog MD account`.
   Switch the editor to source, select everything, and paste the contents of
   `confirm-signup.html`. Click **Save changes**.
3. Choose **Reset Password**. Subject: `Reset your ClinicLog MD password`.
   Paste `reset-password.html`. Save.
4. Choose **Magic Link**. Subject: `Your ClinicLog MD sign-in link`.
   Paste `magic-link.html`. Save.
5. Send yourself a test: sign out, use Forgot password on the site, and check
   the email in a light and a dark mail client.

Each template keeps Supabase's `{{ .ConfirmationURL }}` variable, which is
the only one they need. The mark image loads from
`https://www.cliniclogmd.com/icon-192.png`, so it shows once the recolour is
deployed. Colours are literal because email clients ignore CSS variables;
they match `src/styles/theme.css`.
