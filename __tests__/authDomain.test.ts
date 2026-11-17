import {
  AuthFailure,
  GENERIC_AUTH_MESSAGE,
  NETWORK_MESSAGE,
  messageFor,
  supabaseAuthMessage,
} from '../src/features/auth/domain/AuthFailure';
import {
  normalizeEmail,
  validateEmail,
  validateName,
  validatePassword,
} from '../src/features/auth/domain/validation';

describe('auth validation', () => {
  it('normalizes and validates emails', () => {
    expect(normalizeEmail('  Ana@Exemplo.COM ')).toBe('ana@exemplo.com');
    expect(validateEmail('')).toBe('Informe seu e-mail.');
    expect(validateEmail('ana@exemplo')).toBe('Este e-mail não parece válido.');
    expect(validateEmail('ana exemplo@x.com')).toBeDefined();
    expect(validateEmail(' ana@exemplo.com ')).toBeUndefined();
  });

  it('requires passwords of at least 8 characters', () => {
    expect(validatePassword('')).toBe('Informe sua senha.');
    expect(validatePassword('1234567')).toMatch(/pelo menos 8/);
    expect(validatePassword('12345678')).toBeUndefined();
  });

  it('requires a non-blank, reasonably short name', () => {
    expect(validateName('   ')).toBeDefined();
    expect(validateName('a'.repeat(61))).toBeDefined();
    expect(validateName(' Ana ')).toBeUndefined();
  });
});

describe('auth messages', () => {
  it('maps Supabase error codes to Portuguese', () => {
    expect(supabaseAuthMessage({ code: 'invalid_credentials' })).toBe(
      'E-mail ou senha incorretos.',
    );
    expect(supabaseAuthMessage({ code: 'email_exists' })).toBe(
      'Já existe uma conta com este e-mail.',
    );
  });

  it('treats fetch failures as connection problems', () => {
    expect(supabaseAuthMessage({ name: 'AuthRetryableFetchError' })).toBe(
      NETWORK_MESSAGE,
    );
  });

  it('never shows unknown server text', () => {
    expect(supabaseAuthMessage({ code: 'something_new' })).toBe(
      GENERIC_AUTH_MESSAGE,
    );
    expect(messageFor(new Error('raw english text'))).toBe(
      GENERIC_AUTH_MESSAGE,
    );
    expect(messageFor(new AuthFailure('Mensagem clara.'))).toBe(
      'Mensagem clara.',
    );
  });
});
