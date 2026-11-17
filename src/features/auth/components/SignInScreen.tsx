import { useRef, useState } from 'react';
import { StyleSheet, View, type TextInput } from 'react-native';
import { Button } from '../../../design-system/components/Button/Button';
import { TextField } from '../../../design-system/components/TextField/TextField';
import { useAuth } from '../AuthProvider';
import { messageFor } from '../domain/AuthFailure';
import { validateEmail } from '../domain/validation';
import {
  AuthScaffold,
  FooterPrompt,
  FormMessage,
  OrDivider,
  TextLink,
} from './AuthScaffold';
import { GoogleIcon } from './GoogleIcon';

type Pending = 'email' | 'google' | null;

export function SignInScreen({
  onCreateAccount,
  onForgotPassword,
}: {
  onCreateAccount: () => void;
  onForgotPassword: () => void;
}) {
  const auth = useAuth();
  const passwordRef = useRef<TextInput>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );
  const [formError, setFormError] = useState<string>();
  const [pending, setPending] = useState<Pending>(null);

  async function submit() {
    const next = {
      email: validateEmail(email),
      password: password ? undefined : 'Informe sua senha.',
    };
    setErrors(next);
    setFormError(undefined);
    if (next.email || next.password) return;
    setPending('email');
    try {
      // On success the session changes and the router leaves this screen.
      await auth.signInWithEmail(email, password);
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

  return (
    <AuthScaffold
      scene="hello"
      title="Que bom te ver de novo"
      subtitle="Entre para continuar no seu ritmo."
      footer={
        <FooterPrompt
          prompt="Ainda não tem conta?"
          action="Criar conta"
          onPress={onCreateAccount}
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
        secureTextEntry
        autoCapitalize="none"
        autoComplete="current-password"
        textContentType="password"
        returnKeyType="go"
        onSubmitEditing={submit}
        disabled={pending !== null}
      />
      <View style={styles.forgot}>
        <TextLink
          label="Esqueci minha senha"
          onPress={onForgotPassword}
          disabled={pending !== null}
        />
      </View>
      <FormMessage message={formError} />
      <Button
        shape="pill"
        label="Entrar"
        loading={pending === 'email'}
        disabled={pending === 'google'}
        onPress={submit}
      />
    </AuthScaffold>
  );
}

const styles = StyleSheet.create({
  forgot: { alignItems: 'flex-end' },
});
