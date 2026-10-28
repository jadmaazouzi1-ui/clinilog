/**
 * Canonical public origin. Used anywhere an absolute URL is built for an email
 * or an auth provider, instead of trusting the request's Host header, which a
 * client controls.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.cliniclogmd.com").replace(/\/+$/, "");
