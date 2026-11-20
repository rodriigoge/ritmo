import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../../design-system/components/Button/Button';
import {
  BellIcon,
  ExportIcon,
  ImportIcon,
  LayoutIcon,
  PencilIcon,
  SignOutIcon,
  ThemeIcon,
  TrashIcon,
} from '../../../design-system/components/Icon/Icons';
import {
  OptionList,
  OptionRow,
} from '../../../design-system/components/OptionList/OptionList';
import { TopBar } from '../../../design-system/components/TopBar/TopBar';
import {
  makeStyles,
  useColors,
  useTheme,
} from '../../../design-system/theme/ThemeProvider';
import { THEME_LABELS } from './ThemeScreen';
import { useReminders } from '../../reminders/RemindersProvider';
import {
  HOME_LAYOUT_LABELS,
  useHomeLayout,
} from '../../habits/homeLayout/HomeLayoutProvider';
import { formatReminderTime } from '../../reminders/reminderSettings';
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
  onTheme,
  onHomeLayout,
  onNotifications,
  onExport,
  onImport,
  dataBusy = false,
  dataMessage,
}: {
  onBack: () => void;
  onEditProfile: () => void;
  onTheme: () => void;
  onHomeLayout: () => void;
  onNotifications: () => void;
  onDeleteAccount: () => void;
  onExport: () => void;
  onImport: () => void;
  /** True while the file picker or share sheet is being prepared. */
  dataBusy?: boolean;
  dataMessage?: { tone: 'error' | 'info'; text: string };
}) {
  const styles = useStyles();
  const colors = useColors();
  const { preference } = useTheme();
  const { settings: reminder } = useReminders();
  const { layout } = useHomeLayout();
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
            label="Temas"
            value={THEME_LABELS[preference]}
            icon={<ThemeIcon size={20} />}
            onPress={onTheme}
          />
          <OptionRow
            label="Layout da Home"
            value={HOME_LAYOUT_LABELS[layout]}
            icon={<LayoutIcon size={20} />}
            onPress={onHomeLayout}
          />
          <OptionRow
            label="Notificações"
            value={
              reminder.enabled ? formatReminderTime(reminder) : 'Desligadas'
            }
            icon={<BellIcon size={20} />}
            onPress={onNotifications}
          />
          <OptionRow
            label="Excluir conta"
            tone="danger"
            icon={<TrashIcon size={20} color={colors.danger} />}
            onPress={onDeleteAccount}
          />
        </OptionList>

        <Text accessibilityRole="header" style={styles.section}>
          Seus dados
        </Text>
        <OptionList>
          <OptionRow
            label="Exportar hábitos"
            value="JSON ou CSV"
            icon={<ExportIcon size={20} />}
            onPress={dataBusy ? () => {} : onExport}
          />
          <OptionRow
            label="Importar hábitos"
            icon={<ImportIcon size={20} />}
            onPress={dataBusy ? () => {} : onImport}
          />
        </OptionList>
        {dataMessage ? (
          <View style={styles.dataMessage}>
            <FormMessage message={dataMessage.text} tone={dataMessage.tone} />
          </View>
        ) : null}

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

const useStyles = makeStyles((colors) => ({
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
  section: {
    ...typography.label,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  dataMessage: { marginTop: spacing.md },
  footer: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    gap: spacing.md,
    paddingTop: spacing.xxl,
  },
}));
