import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../../design-system/components/Button/Button';
import {
  PencilIcon,
  SignOutIcon,
  TrashIcon,
} from '../../../design-system/components/Icon/Icons';
import {
  OptionList,
  OptionRow,
} from '../../../design-system/components/OptionList/OptionList';
import { TopBar } from '../../../design-system/components/TopBar/TopBar';
import { colors } from '../../../design-system/tokens/colors';
import { spacing } from '../../../design-system/tokens/spacing';
import {
  fontFamilies,
  typography,
} from '../../../design-system/tokens/typography';
import { useAuth } from '../../auth/AuthProvider';
import { FormMessage } from '../../auth/components/AuthScaffold';
import { UserAvatar } from '../../auth/components/UserAvatar';
import { messageFor } from '../../auth/domain/AuthFailure';

export function ProfileScreen({
  onBack,
  onEditProfile,
  onDeleteAccount,
}: {
  onBack: () => void;
  onEditProfile: () => void;
  onDeleteAccount: () => void;
}) {
  const { user, signOut } = useAuth();
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState<string>();

  async function leave() {
    setError(undefined);
    setSigningOut(true);
    try {
      // Signing out flips the route guards, which leave this screen.
      await signOut();
    } catch (failure) {
      setError(messageFor(failure));
      setSigningOut(false);
    }
  }

  if (!user) return null;
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <TopBar title="Perfil" onBack={onBack} />
        <View style={styles.identity}>
          <UserAvatar user={user} size={104} />
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>

        <OptionList>
          <OptionRow
            label="Editar perfil"
            icon={<PencilIcon size={20} />}
            onPress={onEditProfile}
          />
          <OptionRow
            label="Excluir conta"
            tone="danger"
            icon={<TrashIcon size={20} color={colors.danger} />}
            onPress={onDeleteAccount}
          />
        </OptionList>

        <View style={styles.footer}>
          <FormMessage message={error} />
          <Button
            label="Sair da conta"
            variant="outline"
            shape="pill"
            loading={signingOut}
            icon={<SignOutIcon size={20} />}
            onPress={leave}
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
  identity: {
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xl,
    marginBottom: spacing.xxl,
  },
  name: {
    ...typography.title,
    fontFamily: fontFamilies.bold,
    color: colors.ink,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  email: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  footer: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    gap: spacing.md,
    paddingTop: spacing.xxl,
  },
});
