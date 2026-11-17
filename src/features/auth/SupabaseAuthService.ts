import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { isAuthError, type User } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import { supabase } from '../../shared/supabase/client';
import type { AuthService, AuthUser, SignUpInput } from './AuthService';
import {
  AuthFailure,
  GENERIC_AUTH_MESSAGE,
  NETWORK_MESSAGE,
  supabaseAuthMessage,
} from './domain/AuthFailure';
import { normalizeEmail } from './domain/validation';

const googleWebClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const googleIosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

GoogleSignin.configure({
  // The ID token's audience is the web client, which Supabase verifies.
  webClientId: googleWebClientId,
  iosClientId: googleIosClientId || undefined,
});

// Email links open the app through its scheme (ritmo://…) and land on these
// routes. Both URLs must be listed in Supabase > Auth > URL Configuration.
const confirmationRedirect = () => Linking.createURL('auth/callback');
const passwordResetRedirect = () => Linking.createURL('reset-password');

function toAuthUser(user: User | null | undefined): AuthUser | null {
  if (!user) return null;
  const metadata = user.user_metadata ?? {};
  const email = user.email ?? '';
  const name =
    (typeof metadata.full_name === 'string' && metadata.full_name) ||
    (typeof metadata.name === 'string' && metadata.name) ||
    email.split('@')[0];
  return { id: user.id, email, name, avatarUrl: avatarFrom(metadata) };
}

function avatarFrom(metadata: Record<string, unknown>): string | null {
  const url =
    (typeof metadata.avatar_url === 'string' && metadata.avatar_url) ||
    (typeof metadata.picture === 'string' && metadata.picture) ||
    null;
  if (!url?.startsWith('https://')) return null;
  // Google serves a 96px photo by default; ask for one sharp on the profile.
  return url.replace(/=s\d+-c$/, '=s256-c');
}

function toFailure(error: unknown): AuthFailure {
  if (error instanceof AuthFailure) return error;
  if (isAuthError(error)) return new AuthFailure(supabaseAuthMessage(error));
  if (error instanceof TypeError) return new AuthFailure(NETWORK_MESSAGE);
  return new AuthFailure(GENERIC_AUTH_MESSAGE);
}

function googleFailure(error: unknown): AuthFailure | null {
  if (!isErrorWithCode(error)) return null;
  switch (error.code) {
    case statusCodes.IN_PROGRESS:
      return new AuthFailure('O login com Google já está em andamento.');
    case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
      return new AuthFailure(
        'Atualize o Google Play Services para entrar com Google.',
      );
    // Android reports a misconfigured OAuth client (package name, SHA-1
    // or web client ID) as DEVELOPER_ERROR, code 10.
    case '10':
    case 'DEVELOPER_ERROR':
      return new AuthFailure(
        'Login com Google não está configurado corretamente neste projeto.',
      );
    default:
      return null;
  }
}

export const supabaseAuthService: AuthService = {
  async getCurrentUser() {
    const { data, error } = await supabase.auth.getSession();
    if (error) return null;
    return toAuthUser(data.session?.user);
  },

  onUserChange(listener) {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      listener(toAuthUser(session?.user));
    });
    return () => data.subscription.unsubscribe();
  },

  async signInWithEmail(email, password) {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: normalizeEmail(email),
        password,
      });
      if (error) throw error;
    } catch (error) {
      throw toFailure(error);
    }
  },

  async signUpWithEmail({ name, email, password }: SignUpInput) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: normalizeEmail(email),
        password,
        options: {
          data: { full_name: name.trim() },
          emailRedirectTo: confirmationRedirect(),
        },
      });
      if (error) throw error;
      // With email confirmation on, Supabase answers an existing address
      // with a user that has no identities instead of an error.
      if (data.user && data.user.identities?.length === 0) {
        throw new AuthFailure('Já existe uma conta com este e-mail.');
      }
      return { needsEmailConfirmation: !data.session };
    } catch (error) {
      throw toFailure(error);
    }
  },

  async signInWithGoogle() {
    if (!googleWebClientId) {
      throw new AuthFailure(
        'Login com Google não está configurado: defina EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID.',
      );
    }
    try {
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
      const response = await GoogleSignin.signIn();
      if (!isSuccessResponse(response)) return false;
      const idToken = response.data.idToken;
      if (!idToken) {
        throw new AuthFailure(
          'O Google não retornou uma identificação válida. Tente novamente.',
        );
      }
      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken,
      });
      if (error) throw error;
      return true;
    } catch (error) {
      if (
        isErrorWithCode(error) &&
        error.code === statusCodes.SIGN_IN_CANCELLED
      ) {
        return false;
      }
      throw googleFailure(error) ?? toFailure(error);
    }
  },

  async resendConfirmation(email) {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: normalizeEmail(email),
        options: { emailRedirectTo: confirmationRedirect() },
      });
      if (error) throw error;
    } catch (error) {
      throw toFailure(error);
    }
  },

  async sendPasswordReset(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        normalizeEmail(email),
        { redirectTo: passwordResetRedirect() },
      );
      if (error) throw error;
    } catch (error) {
      throw toFailure(error);
    }
  },

  async exchangeLinkCode(code) {
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) throw error;
    } catch (error) {
      throw toFailure(error);
    }
  },

  async updatePassword(password) {
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
    } catch (error) {
      throw toFailure(error);
    }
  },

  async updateProfile({ name }) {
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: name.trim() },
      });
      if (error) throw error;
    } catch (error) {
      throw toFailure(error);
    }
  },

  async deleteAccount() {
    try {
      const { error } = await supabase.rpc('delete_own_account');
      if (error) {
        throw new AuthFailure(
          'Não foi possível excluir sua conta agora. Tente novamente.',
        );
      }
    } catch (error) {
      throw toFailure(error);
    }
    // The user no longer exists on the server, so only the local session
    // is left to clear.
    await supabase.auth.signOut({ scope: 'local' }).catch(() => {});
    await GoogleSignin.signOut().catch(() => {});
  },

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      throw toFailure(error);
    } finally {
      // Forget the chosen Google account so the picker shows next time.
      await GoogleSignin.signOut().catch(() => {});
    }
  },
};
