// Shared HTML shell for ClinicLog MD emails: a black header with the gold
// mark, black text on white, and a gold button with black text. Email
// clients ignore CSS variables and most <style> rules, so everything is
// inline and the colours come from the palette that mirrors theme.css.
// Plain-text versions are built separately by each sender and are unchanged.

import { PALETTE as P } from "./palette";

const SITE = "https://www.cliniclogmd.com";
const FONT = "system-ui,-apple-system,Segoe UI,sans-serif";
const MONO = "ui-monospace,Menlo,monospace";

export const EMAIL = {
  text: P.ink,
  muted: P.gray700,
  label: P.gold700,
  hairline: P.gray300,
  link: P.black,
};

export function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function para(html: string, style = ""): string {
  return `<p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:${EMAIL.text};${style}">${html}</p>`;
}

export function button(href: string, label: string): string {
  return `<a href="${esc(href)}" class="cl-btn" style="display:inline-block;background:${P.gold500};color:${P.black};text-decoration:none;padding:12px 20px;font-size:15px;font-weight:700;border:2px solid ${P.gold500}">${esc(label)}</a>`;
}

/**
 * The full document. `footer` is trusted HTML built by the caller (it holds
 * the unsubscribe links); everything user-derived must be escaped first.
 */
export function emailShell({ eyebrow, title, body, footer }: { eyebrow: string; title: string; body: string; footer: string }): string {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light dark"><meta name="supported-color-schemes" content="light dark">
<style>@media (prefers-color-scheme: dark){.cl-page{background:${P.black}!important}.cl-card{background:${P.ink}!important;border-color:${P.gold500}!important}.cl-card p,.cl-card h1,.cl-card td{color:${P.cream}!important}.cl-eyebrow{color:${P.gold300}!important}.cl-foot,.cl-foot a{color:${P.creamMuted}!important}}</style></head>
<body class="cl-page" style="margin:0;background:${P.paper};font-family:${FONT};color:${EMAIL.text}">
<div style="max-width:520px;margin:0 auto;padding:32px 24px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse"><tr><td style="background:${P.black};padding:14px 16px;border-bottom:3px solid ${P.gold500}">
<img src="${SITE}/icon-192.png" width="24" height="24" alt="" style="display:inline-block;vertical-align:middle;border:0">
<span style="display:inline-block;vertical-align:middle;margin-left:10px;color:${P.cream};font-weight:700;font-size:14px;letter-spacing:.06em">CLINICLOG MD</span>
</td></tr></table>
<div class="cl-card" style="background:${P.white};border:2px solid ${P.black};border-top:0;padding:24px">
<p class="cl-eyebrow" style="margin:0 0 6px;font-family:${MONO};font-size:12px;letter-spacing:.1em;color:${EMAIL.label}">${esc(eyebrow)}</p>
<h1 style="margin:0 0 16px;font-size:20px;line-height:1.3;color:${EMAIL.text}">${esc(title)}</h1>
${body}
</div>
<p class="cl-foot" style="margin:16px 0 0;font-size:12px;line-height:1.6;color:${EMAIL.muted}">${footer}<br>ClinicLog MD, cliniclogmd.com</p>
</div></body></html>`;
}

/** A small standalone page (the unsubscribe confirmation) in the same style. */
export function brandPage(title: string, body: string): string {
  return `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${esc(title)} | ClinicLog MD</title></head><body style="margin:0;background:${P.paper};color:${EMAIL.text};font-family:${FONT}"><div style="max-width:440px;margin:64px auto 0;background:${P.black};padding:14px 16px;border-bottom:3px solid ${P.gold500};color:${P.cream};font-weight:700;font-size:14px;letter-spacing:.06em">CLINICLOG MD</div><div style="max-width:440px;margin:0 auto 64px;padding:24px;background:${P.white};border:2px solid ${P.black};border-top:0">${body}</div></body></html>`;
}

export const EMAIL_STYLE = { muted: `color:${EMAIL.muted}`, link: `color:${EMAIL.link};font-weight:600` };
export const PAGE_BUTTON = `background:${P.gold500};color:${P.black};border:2px solid ${P.gold500};padding:10px 18px;font-weight:700;cursor:pointer;min-height:44px`;
