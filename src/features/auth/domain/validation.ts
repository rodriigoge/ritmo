export const MIN_PASSWORD_LENGTH = 8;
export const MAX_NAME_LENGTH = 60;

// Deliberately permissive: the server is the source of truth; this only
// catches obvious typos before a round trip.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function validateEmail(email: string): string | undefined {
  const value = normalizeEmail(email);
  if (!value) return 'Informe seu e-mail.';
  if (!EMAIL_PATTERN.test(value)) return 'Este e-mail não parece válido.';
  return undefined;
}

export function validatePassword(password: string): string | undefined {
  if (!password) return 'Informe sua senha.';
  if (password.length < MIN_PASSWORD_LENGTH)
    return `A senha precisa ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`;
  return undefined;
}

export function validateName(name: string): string | undefined {
  const value = name.trim();
  if (!value) return 'Informe como podemos te chamar.';
  if (value.length > MAX_NAME_LENGTH) return 'Use um nome mais curto.';
  return undefined;
}
