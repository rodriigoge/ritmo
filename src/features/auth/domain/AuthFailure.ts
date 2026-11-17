/** An auth problem with a message that is safe to show to the user. */
export class AuthFailure extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthFailure';
  }
}

export const GENERIC_AUTH_MESSAGE = 'Algo deu errado. Tente novamente.';

export function messageFor(error: unknown): string {
  return error instanceof AuthFailure ? error.message : GENERIC_AUTH_MESSAGE;
}

// Supabase Auth error codes → Portuguese copy. Unknown codes fall back to
// a generic message instead of leaking English server text.
const SUPABASE_MESSAGES: Record<string, string> = {
  invalid_credentials: 'E-mail ou senha incorretos.',
  email_not_confirmed:
    'Confirme seu e-mail antes de entrar. Procure o link na sua caixa de entrada.',
  user_already_exists: 'Já existe uma conta com este e-mail.',
  email_exists: 'Já existe uma conta com este e-mail.',
  identity_already_exists: 'Esta conta Google já está ligada a outro usuário.',
  weak_password: 'Senha fraca. Escolha uma senha mais difícil de adivinhar.',
  same_password: 'A nova senha precisa ser diferente da atual.',
  email_address_invalid: 'Este e-mail não parece válido.',
  validation_failed: 'Confira os dados informados.',
  over_email_send_rate_limit:
    'Muitos e-mails enviados. Aguarde alguns minutos e tente de novo.',
  over_request_rate_limit:
    'Muitas tentativas seguidas. Aguarde um pouco e tente de novo.',
  signup_disabled: 'Novos cadastros estão desativados no momento.',
  email_provider_disabled: 'Entrar com e-mail está desativado no momento.',
  provider_disabled: 'Este método de login está desativado no momento.',
  user_banned: 'Esta conta está bloqueada.',
  otp_expired: 'Este link expirou. Peça um novo.',
  flow_state_expired: 'Este link expirou. Peça um novo.',
  flow_state_not_found:
    'Este link não é mais válido. Abra-o no mesmo celular em que você o pediu ou peça um novo.',
  bad_code_verifier:
    'Este link não é mais válido. Abra-o no mesmo celular em que você o pediu ou peça um novo.',
  session_expired: 'Sua sessão expirou. Entre novamente.',
  session_not_found: 'Sua sessão expirou. Entre novamente.',
  unexpected_audience:
    'Login com Google não está configurado corretamente neste projeto.',
};

export const NETWORK_MESSAGE =
  'Sem conexão com o servidor. Verifique sua internet e tente novamente.';

export function supabaseAuthMessage(error: {
  code?: string;
  name?: string;
  status?: number;
}): string {
  if (error.name === 'AuthRetryableFetchError' || error.status === 0) {
    return NETWORK_MESSAGE;
  }
  return (error.code && SUPABASE_MESSAGES[error.code]) || GENERIC_AUTH_MESSAGE;
}
