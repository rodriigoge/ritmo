import type { ReactNode } from 'react';
import {
  AuthContext,
  type AuthState,
} from '../../src/features/auth/AuthProvider';
import type { AuthService } from '../../src/features/auth/AuthService';

export function createAuthService(
  overrides: Partial<AuthService> = {},
): jest.Mocked<AuthService> {
  return {
    getCurrentUser: jest.fn(async () => null),
    onUserChange: jest.fn(() => () => {}),
    signInWithEmail: jest.fn(async () => {}),
    signUpWithEmail: jest.fn(async () => ({ needsEmailConfirmation: true })),
    signInWithGoogle: jest.fn(async () => true),
    resendConfirmation: jest.fn(async () => {}),
    sendPasswordReset: jest.fn(async () => {}),
    exchangeLinkCode: jest.fn(async () => {}),
    updatePassword: jest.fn(async () => {}),
    signOut: jest.fn(async () => {}),
    ...overrides,
  } as jest.Mocked<AuthService>;
}

/** Provides a fixed auth state, for screens that only read it. */
export function TestAuth({
  children,
  service = createAuthService(),
  status = 'signed-in',
}: {
  children: ReactNode;
  service?: AuthService;
  status?: AuthState['status'];
}) {
  const value: AuthState = {
    ...service,
    status,
    user:
      status === 'signed-in'
        ? { id: 'user-1', email: 'ana@exemplo.com', name: 'Ana' }
        : null,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
