import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../../design-system/components/Button/Button';
import { TopBar } from '../../../design-system/components/TopBar/TopBar';
import { colors } from '../../../design-system/tokens/colors';
import { spacing } from '../../../design-system/tokens/spacing';
import {
  fontFamilies,
  typography,
} from '../../../design-system/tokens/typography';
import { useAuth } from '../../auth/AuthProvider';
import { FormMessage } from '../../auth/components/AuthScaffold';
import { messageFor } from '../../auth/domain/AuthFailure';
import { PingoArt } from '../../onboarding/illustrations/PingoArt';

export function DeleteAccountScreen({ onBack }: { onBack: () => void }) {
  const { user, deleteAccount } = useAuth();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string>();

  async function confirm() {
    setError(undefined);
    setDeleting(true);
    try {
      // Once the account is gone the route guards send the user to sign in.
      await deleteAccount();
    } catch (failure) {
      setError(messageFor(failure));
      setDeleting(false);
    }
  }

  if (!user) return null;
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <TopBar title="Excluir conta" onBack={onBack} />
        <View style={styles.hero}>
          <PingoArt pose="wave" height={170} />
          <Text accessibilityRole="header" style={styles.title}>
            Já vai embora?
          </Text>
          <Text style={styles.body}>
            Ao excluir a conta {user.email}, todos os seus hábitos e o histórico
            de dias concluídos são apagados para sempre.
          </Text>
          <Text style={[styles.body, styles.strong]}>
            Isso não pode ser desfeito.
          </Text>
        </View>
        <View style={styles.footer}>
          <FormMessage message={error} />
          <Button
            label="Excluir minha conta"
            variant="danger"
            shape="pill"
            loading={deleting}
            onPress={confirm}
          />
          <Button
            label="Manter minha conta"
            variant="outline"
            shape="pill"
            disabled={deleting}
            onPress={onBack}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
  hero: { alignItems: 'center', gap: spacing.sm, marginTop: spacing.xl },
  title: {
    ...typography.title,
    fontFamily: fontFamilies.bold,
    color: colors.ink,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  body: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  strong: { fontFamily: fontFamilies.semibold, color: colors.ink },
  footer: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    gap: spacing.md,
    paddingTop: spacing.xxl,
  },
});
