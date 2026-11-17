import { useState } from 'react';
import { Button } from '../../../design-system/components/Button/Button';
import { messageFor } from '../domain/AuthFailure';
import { AuthScaffold, FormMessage, TextLink } from './AuthScaffold';

/** Shown after an email with a link was sent; lets the user resend it. */
export function CheckEmail({
  description,
  onResend,
  onBack,
  backLabel = 'Voltar para o login',
}: {
  description: string;
  onResend: () => Promise<void>;
  onBack: () => void;
  backLabel?: string;
}) {
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<{
    tone: 'error' | 'info';
    message: string;
  }>();

  async function resend() {
    setSending(true);
    setStatus(undefined);
    try {
      await onResend();
      setStatus({ tone: 'info', message: 'Enviamos um novo e-mail.' });
    } catch (error) {
      setStatus({ tone: 'error', message: messageFor(error) });
    } finally {
      setSending(false);
    }
  }

  return (
    <AuthScaffold
      scene="mail"
      title="Confira seu e-mail"
      subtitle={description}
      footer={<TextLink label={backLabel} onPress={onBack} />}
    >
      <FormMessage message={status?.message} tone={status?.tone} />
      <Button
        variant="outline"
        shape="pill"
        label="Reenviar e-mail"
        loading={sending}
        onPress={resend}
      />
    </AuthScaffold>
  );
}
