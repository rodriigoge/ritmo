import { useRef, useState } from 'react';
import { Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Button } from '../../../design-system/components/Button/Button';
import {
  FloatingSheet,
  type FloatingSheetHandle,
} from '../../../design-system/components/FloatingSheet/FloatingSheet';
import { makeStyles } from '../../../design-system/theme/ThemeProvider';
import { spacing } from '../../../design-system/tokens/spacing';
import { typography } from '../../../design-system/tokens/typography';

export function DeleteHabitConfirmation({
  name,
  onDelete,
  onCancel,
  onDeleted,
}: {
  name: string;
  onDelete: () => Promise<void>;
  onCancel: () => void;
  onDeleted: () => void;
}) {
  const styles = useStyles();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const sending = useRef(false);
  const sheet = useRef<FloatingSheetHandle>(null);

  async function confirm() {
    if (sending.current) return;
    sending.current = true;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setPending(true);
    setError(undefined);
    try {
      await onDelete();
      onDeleted();
    } catch {
      setError('Não foi possível excluir o hábito. Tente novamente.');
    } finally {
      sending.current = false;
      setPending(false);
    }
  }

  return (
    <FloatingSheet
      ref={sheet}
      title={`Excluir ${name}?`}
      description="Todo o histórico deste hábito será apagado. Isso não pode ser desfeito."
      busy={pending}
      onClose={onCancel}
    >
      {error && (
        <Text
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
          style={styles.error}
        >
          {error}
        </Text>
      )}
      <View style={styles.actions}>
        <Button
          label={pending ? 'Excluindo…' : 'Excluir hábito'}
          variant="danger"
          disabled={pending}
          onPress={() => {
            void confirm();
          }}
        />
        <Button
          label="Manter hábito"
          variant="outline"
          disabled={pending}
          onPress={() => sheet.current?.close()}
        />
      </View>
    </FloatingSheet>
  );
}

const useStyles = makeStyles((colors) => ({
  actions: { gap: spacing.sm },
  error: { ...typography.body, color: colors.danger },
}));
