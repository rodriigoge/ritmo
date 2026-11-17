import { useRef, useState } from 'react';
import type { TextInput } from 'react-native';
import { Button } from '../../../design-system/components/Button/Button';
import { TextField } from '../../../design-system/components/TextField/TextField';
import { useAuth } from '../AuthProvider';
import { messageFor } from '../domain/AuthFailure';
import {
  MAX_NAME_LENGTH,
  MIN_PASSWORD_LENGTH,
  normalizeEmail,
  validateEmail,
  validateName,
  validatePassword,
} from '../domain/validation';
import {
  AuthScaffold,
  FooterPrompt,
  FormMessage,
  OrDivider,
} from './AuthScaffold';
import { CheckEmail } from './CheckEmail';
import { GoogleIcon } from './GoogleIcon';

type Pending = 'email' | 'google' | null;

export function SignUpScreen({ onSignIn }: { onSignIn: () => void }) {
  const auth = useAuth();
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
  }>({});
  const [formError, setFormError] = useState<string>();
  const [pending, setPending] = useState<Pending>(null);
  const [confirmationSentTo, setConfirmationSentTo] = useState<string>();

  async function submit() {
    const next = {
      name: validateName(name),
      email: validateEmail(email),
      password: validatePassword(password),
    };
    setErrors(next);
    setFormError(undefined);
    if (next.name || next.email || next.password) return;
    setPending('email');
    try {
      const { needsEmailConfirmation } = await auth.signUpWithEmail({
        name,
        email,
        password,
      });
      // Without confirmation the session starts and the router moves on.
      if (needsEmailConfirmation) setConfirmationSentTo(normalizeEmail(email));
    } catch (error) {
      setFormError(messageFor(error));
    } finally {
      setPending(null);
    }
  }

  async function continueWithGoogle() {
    setFormError(undefined);
    setPending('google');
    try {
      await auth.signInWithGoogle();
    } catch (error) {
      setFormError(messageFor(error));
    } finally {
      setPending(null);
    }
  }

  if (confirmationSentTo) {
    return (
      <CheckEmail
        description={`Enviamos um link de confirmação para ${confirmationSentTo}. Abra-o neste celular para ativar sua conta.`}
        onResend={() => auth.resendConfirmation(confirmationSentTo)}
        onBack={onSignIn}
      />
    );
  }

  return (
    <AuthScaffold
      scene="hello"
      title="Crie sua conta"
      subtitle="Seus hábitos ficam salvos com segurança e você pode entrar de qualquer celular."
      footer={
        <FooterPrompt
          prompt="Já tem uma conta?"
          action="Entrar"
          onPress={onSignIn}
        />
      }
    >
      <Button
        variant="outline"
        shape="pill"
        label="Continuar com Google"
        icon={<GoogleIcon />}
        loading={pending === 'google'}
        disabled={pending === 'email'}
        onPress={continueWithGoogle}
      />
      <OrDivider />
      <TextField
        label="Nome"
        value={name}
        onChangeText={setName}
        error={errors.name}
        placeholder="Como podemos te chamar?"
        autoCapitalize="words"
        autoComplete="name"
        textContentType="name"
        maxLength={MAX_NAME_LENGTH}
        returnKeyType="next"
        onSubmitEditing={() => emailRef.current?.focus()}
        disabled={pending !== null}
      />
      <TextField
        ref={emailRef}
        label="E-mail"
        value={email}
        onChangeText={setEmail}
        error={errors.email}
        placeholder="voce@email.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        textContentType="emailAddress"
        returnKeyType="next"
        onSubmitEditing={() => passwordRef.current?.focus()}
        disabled={pending !== null}
      />
      <TextField
        ref={passwordRef}
        label="Senha"
        value={password}
        onChangeText={setPassword}
        error={errors.password}
        placeholder={`Mínimo de ${MIN_PASSWORD_LENGTH} caracteres`}
        secureTextEntry
        autoCapitalize="none"
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="go"
        onSubmitEditing={submit}
        disabled={pending !== null}
      />
      <FormMessage message={formError} />
      <Button
        shape="pill"
        label="Criar conta"
        loading={pending === 'email'}
        disabled={pending === 'google'}
        onPress={submit}
      />
    </AuthScaffold>
  );
}
