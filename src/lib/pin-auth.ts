/** Username + 4-digit PIN sign-in, mapped onto email/password auth behind the scenes. */
export const normalizeUsername = (u: string) =>
  u.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9._-]/g, "");

export const usernameToEmail = (u: string) => `${normalizeUsername(u)}@cbrv.app`;

/** Auth requires 6+ characters, so the PIN is padded deterministically. */
export const pinToPassword = (pin: string) => `cbrv-pin-${pin}-club`;

export const isValidPin = (pin: string) => /^\d{4}$/.test(pin);

/** "Enrique Páez" -> "epaez": first initial + last surname. */
export const baseUsernameFromName = (fullName: string): string => {
  const parts = fullName.trim().split(/\s+/).map(normalizeUsername).filter(Boolean);
  const first = parts[0] ?? "";
  if (parts.length <= 1) return first;
  return first.charAt(0) + (parts[parts.length - 1] ?? "");
};
