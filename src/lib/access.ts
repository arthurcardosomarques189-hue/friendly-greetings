export const MONTHLY_PRICE_CENTS = 5000;
export const MONTHLY_PRICE_LABEL = 'R$ 50,00';
export const usernameEmail = (username: string) => `${username.trim().toLowerCase()}@cineverse.local`;
export function hasActiveAccess(subscription: { blocked: boolean; expires_at: string | null } | null | undefined, now = Date.now()) {
  return Boolean(subscription && !subscription.blocked && subscription.expires_at && Date.parse(subscription.expires_at) > now);
}
export function canManageCustomers(role: string | undefined) { return role === 'admin'; }