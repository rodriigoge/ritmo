import { useState } from 'react';
import { Button } from '../../../design-system/components/Button/Button';
import { TextField } from '../../../design-system/components/TextField/TextField';
import { useAuth } from '../AuthProvider';
import { messageFor } from '../domain/AuthFailure';
import { normalizeEmail, validateEmail } from '../domain/validation';
import { AuthScaffold, FormMessage } from './AuthScaffold';
import { CheckEmail } from './CheckEmail';

export function ForgotPasswordScreen({ onBack }: { onBack: () => void }) {
  const auth = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string>();
  const [formError, setFormError] = useState<string>();
  const [sending, setSending] = useState(false);
  const [sentTo, setSentTo] = useState<string>();

  async function submit() {
    const invalid = validateEmail(email);
    setError(invalid);
    setFormError(undefined);
    if (invalid) return;
    setSending(true);
    try {
      await auth.sendPasswordReset(email);
      setSentTo(normalizeEmail(email));
    } catch (failure) {
      setFormError(messageFor(failure));
    } finally {
      setSending(false);
    }
  }

  if (sentTo) {
    return (
      <CheckEmail
        description={`Se existir uma conta com ${sentTo}, você vai receber um link para criar uma nova senha. Abra-o neste celular.`}
        onResend={() => auth.sendPasswordReset(sentTo)}
        onBack={onBack}
      />
    );
  }

  return (
    <AuthScaffold
      scene="mail"
      title="Esqueceu a senha?"
      subtitle="Informe seu e-mail e enviaremos um link para você criar uma nova."
      onBack={onBack}
    >
      <TextField
        label="E-mail"
        value={email}
        onChangeText={setEmail}
        error={error}
        placeholder="voce@email.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        textContentType="emailAddress"
        returnKeyType="send"
        onSubmitEditing={submit}
        disabled={sending}
        autoFocus
      />
      <FormMessage message={formError} />
      <Button
        shape="pill"
        label="Enviar link"
        loading={sending}
        onPress={submit}
      />
    </AuthScaffold>
  );
}
