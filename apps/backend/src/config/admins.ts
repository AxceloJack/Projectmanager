// Emails that always have admin access (auto-approved on sign-up).
export const ADMIN_EMAILS = ['jack@axcelo.co', 'arturs@axcelo.co'].map((e) => e.toLowerCase());

export function isAdminEmail(email?: string | null): boolean {
  return !!email && ADMIN_EMAILS.includes(email.trim().toLowerCase());
}
