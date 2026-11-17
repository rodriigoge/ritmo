import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Button } from '../../../design-system/components/Button/Button';
import { TextField } from '../../../design-system/components/TextField/TextField';
import { colors } from '../../../design-system/tokens/colors';
import { useAuth } from '../AuthProvider';
import { messageFor } from '../domain/AuthFailure';
import { MIN_PASSWORD_LENGTH, validatePassword } from '../domain/validation';
import { AuthScaffold, FormMessage } from './AuthScaffold';

const INVALID_LINK =
  'Este link é inválido ou expirou. Peça um novo e abra-o neste celular.';

type LinkState =
  | { phase: 'verifying' }
  | { phase: 'ready' }
  | { phase: 'invalid'; message: string };

/** Exchanges the ?code=… from an email link for a session, exactly once. */
function useEmailLinkSession(code?: string, linkError?: string) {
  const { exchangeLinkCode } = useAuth();
  const started = useRef(false);
  const [state, setState] = useState<LinkState>(() =>
    code && !linkError
      ? { phase: 'verifying' }
      : { phase: 'invalid', message: linkError || INVALID_LINK },
  );

  useEffect(() => {
    if (!code || linkError || started.current) return;
    started.current = true;
    exchangeLinkCode(code)
      .then(() => setState({ phase: 'ready' }))
      .catch((error) =>
        setState({ phase: 'invalid', message: messageFor(error) }),
      );
  }, [code, linkError, exchangeLinkCode]);

  return state;
}

function Verifying({ title }: { title: string }) {
  return (
    <AuthScaffold scene="mail" title={title} subtitle="Só um instante…">
      <View style={styles.center}>
        <ActivityIndicator color={colors.ink} />
      </View>
    </AuthScaffold>
  );
}

/** Landing for the sign-up confirmation link. */
export function EmailConfirmationScreen({
  code,
  linkError,
  onConfirmed,
  onSignIn,
}: {
  code?: string;
  linkError?: string;
  onConfirmed: () => void;
  onSignIn: () => void;
}) {
  const { status } = useAuth();
  const link = useEmailLinkSession(code, linkError);

  // Leave only once the new session reached the router's guards.
  useEffect(() => {
    if (link.phase === 'ready' && status === 'signed-in') onConfirmed();
  }, [link.phase, status, onConfirmed]);

  if (link.phase === 'invalid') {
    return (
      <AuthScaffold
        scene="mail"
        title="Não deu para confirmar"
        subtitle={link.message}
      >
        <Button shape="pill" label="Ir para o login" onPress={onSignIn} />
      </AuthScaffold>
    );
  }
  return <Verifying title="Confirmando seu e-mail" />;
}

/** Landing for the password reset link: verifies it, then asks for a new password. */
export function ResetPasswordScreen({
  code,
  linkError,
  onDone,
  onRequestNewLink,
}: {
  code?: string;
  linkError?: string;
  onDone: () => void;
  onRequestNewLink: () => void;
}) {
  const auth = useAuth();
  const link = useEmailLinkSession(code, linkError);
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [errors, setErrors] = useState<{
    password?: string;
    confirmation?: string;
  }>({});
  const [formError, setFormError] = useState<string>();
  const [saving, setSaving] = useState(false);

  if (link.phase === 'verifying')
    return <Verifying title="Verificando o link" />;
  if (link.phase === 'invalid') {
    return (
      <AuthScaffold scene="mail" title="Link inválido" subtitle={link.message}>
        <Button
          shape="pill"
          label="Pedir um novo link"
          onPress={onRequestNewLink}
        />
      </AuthScaffold>
    );
  }

  async function submit() {
    const next = {
      password: validatePassword(password),
      confirmation:
        confirmation === password ? undefined : 'As senhas não são iguais.',
    };
    setErrors(next);
    setFormError(undefined);
    if (next.password || next.confirmation) return;
    setSaving(true);
    try {
      await auth.updatePassword(password);
      onDone();
    } catch (error) {
      setFormError(messageFor(error));
      setSaving(false);
    }
  }

  return (
    <AuthScaffold
      scene="hello"
      title="Crie uma nova senha"
      subtitle="Escolha uma senha que você não usa em outros lugares."
    >
      <TextField
        label="Nova senha"
        value={password}
        onChangeText={setPassword}
        error={errors.password}
        placeholder={`Mínimo de ${MIN_PASSWORD_LENGTH} caracteres`}
        secureTextEntry
        autoCapitalize="none"
        autoComplete="new-password"
        textContentType="newPassword"
        disabled={saving}
      />
      <TextField
        label="Confirme a nova senha"
        value={confirmation}
        onChangeText={setConfirmation}
        error={errors.confirmation}
        secureTextEntry
        autoCapitalize="none"
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="go"
        onSubmitEditing={submit}
        disabled={saving}
      />
      <FormMessage message={formError} />
      <Button
        shape="pill"
        label="Salvar nova senha"
        loading={saving}
        onPress={submit}
      />
    </AuthScaffold>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', paddingVertical: 24 },
});
