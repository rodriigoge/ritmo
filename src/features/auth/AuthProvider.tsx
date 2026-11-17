import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { AuthService, AuthUser } from './AuthService';

export type AuthState = AuthService & {
  status: 'loading' | 'signed-in' | 'signed-out';
  user: AuthUser | null;
};

export const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({
  service,
  children,
}: {
  service: AuthService;
  children: ReactNode;
}) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    // Subscribe first so a change during the initial read is not missed.
    const unsubscribe = service.onUserChange((next) => {
      if (!active) return;
      setUser(next);
      setReady(true);
    });
    service
      .getCurrentUser()
      .then((current) => {
        if (!active) return;
        setUser(current);
        setReady(true);
      })
      .catch(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
      unsubscribe();
    };
  }, [service]);

  const value = useMemo<AuthState>(
    () => ({
      ...service,
      status: !ready ? 'loading' : user ? 'signed-in' : 'signed-out',
      user,
    }),
    [service, ready, user],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider.');
  return value;
}
