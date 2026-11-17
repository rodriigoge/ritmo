import { useRef, useState } from 'react';
import type { TextInput } from 'react-native';
import { Button } from '../../../design-system/components/Button/Button';
import {
  FloatingSheet,
  type FloatingSheetHandle,
} from '../../../design-system/components/FloatingSheet/FloatingSheet';
import { TextField } from '../../../design-system/components/TextField/TextField';
import {
  MAX_HABIT_NAME_LENGTH,
  normalizeHabitName,
} from '../domain/HabitInput';

const COPY = {
  create: {
    title: 'Novo hábito',
    description:
      'Dê um nome curto ao que você quer repetir. Depois é só marcar cada dia com um toque.',
    action: 'Criar hábito',
    busy: 'Criando…',
    failure: 'Não foi possível criar o hábito. Tente novamente.',
  },
  edit: {
    title: 'Editar hábito',
    description: 'Mude o nome quando quiser. Seu histórico continua o mesmo.',
    action: 'Salvar',
    busy: 'Salvando…',
    failure: 'Não foi possível salvar o hábito. Tente novamente.',
  },
} as const;

/** Floating card used to create or rename a habit. */
export function HabitFormSheet({
  onSave,
  mode = 'create',
  initialName = '',
  onClose,
}: {
  mode?: 'create' | 'edit';
  initialName?: string;
  onSave: (name: string) => Promise<void>;
  onClose: () => void;
}) {
  const copy = COPY[mode];
  const [name, setName] = useState(initialName);
  const [error, setError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  const sending = useRef(false);
  const input = useRef<TextInput>(null);
  const sheet = useRef<FloatingSheetHandle>(null);
  const valid =
    name.trim().length > 0 && name.trim().length <= MAX_HABIT_NAME_LENGTH;

  async function submit() {
    if (!valid || sending.current) return;
    sending.current = true;
    setSubmitting(true);
    setError(undefined);
    try {
      await onSave(normalizeHabitName(name));
      sheet.current?.close();
    } catch {
      setError(copy.failure);
    } finally {
      sending.current = false;
      setSubmitting(false);
    }
  }

  return (
    <FloatingSheet
      ref={sheet}
      title={copy.title}
      description={copy.description}
      busy={submitting}
      onClose={onClose}
      onShow={() => input.current?.focus()}
    >
      <TextField
        ref={input}
        accessibilityLabel="Nome do hábito"
        placeholder="Ex.: Beber 2 litros de água"
        value={name}
        onChangeText={(value) => {
          setName(value);
          setError(undefined);
        }}
        autoFocus
        maxLength={MAX_HABIT_NAME_LENGTH}
        returnKeyType="done"
        onSubmitEditing={() => {
          void submit();
        }}
        disabled={submitting}
        error={error}
      />
      <Button
        label={submitting ? copy.busy : copy.action}
        disabled={!valid || submitting}
        onPress={() => {
          void submit();
        }}
      />
    </FloatingSheet>
  );
}
