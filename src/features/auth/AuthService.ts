export type AuthUser = { id: string; email: string; name: string };

export type SignUpInput = { name: string; email: string; password: string };

/** Everything the screens need from the auth backend. Every method throws
 * AuthFailure with user-facing copy when something goes wrong. */
export interface AuthService {
  getCurrentUser(): Promise<AuthUser | null>;
  onUserChange(listener: (user: AuthUser | null) => void): () => void;
  signInWithEmail(email: string, password: string): Promise<void>;
  /** Resolves with whether the user still has to confirm their email. */
  signUpWithEmail(
    input: SignUpInput,
  ): Promise<{ needsEmailConfirmation: boolean }>;
  /** Resolves false when the user closes the Google account picker. */
  signInWithGoogle(): Promise<boolean>;
  resendConfirmation(email: string): Promise<void>;
  sendPasswordReset(email: string): Promise<void>;
  /** Finishes an email link (confirmation or password reset). */
  exchangeLinkCode(code: string): Promise<void>;
  updatePassword(password: string): Promise<void>;
  signOut(): Promise<void>;
}
