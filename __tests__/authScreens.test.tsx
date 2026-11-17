import { act, fireEvent, render, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { Text } from 'react-native';
import { AuthProvider, useAuth } from '../src/features/auth/AuthProvider';
import type { AuthService, AuthUser } from '../src/features/auth/AuthService';
import { ResetPasswordScreen } from '../src/features/auth/components/EmailLinkScreens';
import { ForgotPasswordScreen } from '../src/features/auth/components/ForgotPasswordScreen';
import { SignInScreen } from '../src/features/auth/components/SignInScreen';
import { SignUpScreen } from '../src/features/auth/components/SignUpScreen';
import { AuthFailure } from '../src/features/auth/domain/AuthFailure';
import { TestAuth, createAuthService } from './support/TestAuth';

async function renderWith(service: AuthService, ui: ReactElement) {
  await render(
    <TestAuth service={service} status="signed-out">
      {ui}
    </TestAuth>,
  );
}

function type(label: string, value: string) {
  return fireEvent.changeText(screen.getByLabelText(label), value);
}

describe('Sign in', () => {
  it('validates before calling the server', async () => {
    const service = createAuthService();
    await renderWith(
      service,
      <SignInScreen onCreateAccount={jest.fn()} onForgotPassword={jest.fn()} />,
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Entrar' }));

    expect(screen.getByText('Informe seu e-mail.')).toBeTruthy();
    expect(screen.getByText('Informe sua senha.')).toBeTruthy();
    expect(service.signInWithEmail).not.toHaveBeenCalled();
  });

  it('signs in with email and shows server errors in Portuguese', async () => {
    const service = createAuthService({
      signInWithEmail: jest.fn(async () => {
        throw new AuthFailure('E-mail ou senha incorretos.');
      }),
    });
    await renderWith(
      service,
      <SignInScreen onCreateAccount={jest.fn()} onForgotPassword={jest.fn()} />,
    );

    await type('E-mail', 'ana@exemplo.com');
    await type('Senha', 'segredo123');
    await fireEvent.press(screen.getByRole('button', { name: 'Entrar' }));

    expect(service.signInWithEmail).toHaveBeenCalledWith(
      'ana@exemplo.com',
      'segredo123',
    );
    expect(screen.getByText('E-mail ou senha incorretos.')).toBeTruthy();
  });

  it('continues with Google and links to the other flows', async () => {
    const service = createAuthService();
    const onCreateAccount = jest.fn();
    const onForgotPassword = jest.fn();
    await renderWith(
      service,
      <SignInScreen
        onCreateAccount={onCreateAccount}
        onForgotPassword={onForgotPassword}
      />,
    );

    await fireEvent.press(
      screen.getByRole('button', { name: 'Continuar com Google' }),
    );
    expect(service.signInWithGoogle).toHaveBeenCalledTimes(1);

    await fireEvent.press(screen.getByRole('link', { name: 'Criar conta' }));
    await fireEvent.press(
      screen.getByRole('link', { name: 'Esqueci minha senha' }),
    );
    expect(onCreateAccount).toHaveBeenCalled();
    expect(onForgotPassword).toHaveBeenCalled();
  });
});

describe('Sign up', () => {
  it('creates the account and asks to confirm the email, with resend', async () => {
    const service = createAuthService();
    await renderWith(service, <SignUpScreen onSignIn={jest.fn()} />);

    await type('Nome', 'Ana');
    await type('E-mail', 'Ana@Exemplo.com');
    await type('Senha', 'segredo123');
    await fireEvent.press(screen.getByRole('button', { name: 'Criar conta' }));

    expect(service.signUpWithEmail).toHaveBeenCalledWith({
      name: 'Ana',
      email: 'Ana@Exemplo.com',
      password: 'segredo123',
    });
    expect(screen.getByText('Confira seu e-mail')).toBeTruthy();
    expect(screen.getByText(/ana@exemplo\.com/)).toBeTruthy();

    await fireEvent.press(
      screen.getByRole('button', { name: 'Reenviar e-mail' }),
    );
    expect(service.resendConfirmation).toHaveBeenCalledWith('ana@exemplo.com');
    expect(screen.getByText('Enviamos um novo e-mail.')).toBeTruthy();
  });

  it('rejects short passwords locally and shows duplicate accounts', async () => {
    const service = createAuthService({
      signUpWithEmail: jest.fn(async () => {
        throw new AuthFailure('Já existe uma conta com este e-mail.');
      }),
    });
    await renderWith(service, <SignUpScreen onSignIn={jest.fn()} />);

    await type('Nome', 'Ana');
    await type('E-mail', 'ana@exemplo.com');
    await type('Senha', 'curta');
    await fireEvent.press(screen.getByRole('button', { name: 'Criar conta' }));
    expect(screen.getByText(/pelo menos 8 caracteres/)).toBeTruthy();
    expect(service.signUpWithEmail).not.toHaveBeenCalled();

    await type('Senha', 'segredo123');
    await fireEvent.press(screen.getByRole('button', { name: 'Criar conta' }));
    expect(
      screen.getByText('Já existe uma conta com este e-mail.'),
    ).toBeTruthy();
  });
});

describe('Password recovery', () => {
  it('sends the reset link and confirms without revealing accounts', async () => {
    const service = createAuthService();
    await renderWith(service, <ForgotPasswordScreen onBack={jest.fn()} />);

    await type('E-mail', 'ana@exemplo.com');
    await fireEvent.press(screen.getByRole('button', { name: 'Enviar link' }));

    expect(service.sendPasswordReset).toHaveBeenCalledWith('ana@exemplo.com');
    expect(screen.getByText(/Se existir uma conta com/)).toBeTruthy();
  });

  it('exchanges the link code once and saves the new password', async () => {
    const service = createAuthService();
    const onDone = jest.fn();
    await renderWith(
      service,
      <ResetPasswordScreen
        code="abc"
        onDone={onDone}
        onRequestNewLink={jest.fn()}
      />,
    );

    expect(service.exchangeLinkCode).toHaveBeenCalledTimes(1);
    expect(service.exchangeLinkCode).toHaveBeenCalledWith('abc');

    await type('Nova senha', 'novasenha1');
    await type('Confirme a nova senha', 'outrasenha');
    await fireEvent.press(
      screen.getByRole('button', { name: 'Salvar nova senha' }),
    );
    expect(screen.getByText('As senhas não são iguais.')).toBeTruthy();

    await type('Confirme a nova senha', 'novasenha1');
    await fireEvent.press(
      screen.getByRole('button', { name: 'Salvar nova senha' }),
    );
    expect(service.updatePassword).toHaveBeenCalledWith('novasenha1');
    expect(onDone).toHaveBeenCalled();
  });

  it('explains an invalid link and offers a new one', async () => {
    const service = createAuthService({
      exchangeLinkCode: jest.fn(async () => {
        throw new AuthFailure('Este link expirou. Peça um novo.');
      }),
    });
    const onRequestNewLink = jest.fn();
    await renderWith(
      service,
      <ResetPasswordScreen
        code="expired"
        onDone={jest.fn()}
        onRequestNewLink={onRequestNewLink}
      />,
    );

    expect(screen.getByText('Este link expirou. Peça um novo.')).toBeTruthy();
    await fireEvent.press(
      screen.getByRole('button', { name: 'Pedir um novo link' }),
    );
    expect(onRequestNewLink).toHaveBeenCalled();
  });
});

describe('AuthProvider', () => {
  function Status() {
    const { status, user } = useAuth();
    return <Text>{`${status}:${user?.name ?? '-'}`}</Text>;
  }

  it('starts loading, then follows the session', async () => {
    let emit: (user: AuthUser | null) => void = () => {};
    const service = createAuthService({
      onUserChange: jest.fn((listener) => {
        emit = listener;
        return () => {};
      }),
    });

    await act(async () => {
      await render(
        <AuthProvider service={service}>
          <Status />
        </AuthProvider>,
      );
    });
    expect(screen.getByText('signed-out:-')).toBeTruthy();

    await act(async () =>
      emit({
        id: 'u1',
        email: 'ana@exemplo.com',
        name: 'Ana',
        avatarUrl: null,
      }),
    );
    expect(screen.getByText('signed-in:Ana')).toBeTruthy();

    await act(async () => emit(null));
    expect(screen.getByText('signed-out:-')).toBeTruthy();
  });
});
