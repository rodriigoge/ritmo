import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../../design-system/components/Button/Button';
import { TextField } from '../../../design-system/components/TextField/TextField';
import { TopBar } from '../../../design-system/components/TopBar/TopBar';
import { colors } from '../../../design-system/tokens/colors';
import { spacing } from '../../../design-system/tokens/spacing';
import { typography } from '../../../design-system/tokens/typography';
import { useAuth } from '../../auth/AuthProvider';
import { FormMessage } from '../../auth/components/AuthScaffold';
import { UserAvatar } from '../../auth/components/UserAvatar';
import { messageFor } from '../../auth/domain/AuthFailure';
import { MAX_NAME_LENGTH, validateName } from '../../auth/domain/validation';

export function EditProfileScreen({
  onBack,
  onSaved,
}: {
  onBack: () => void;
  onSaved: () => void;
}) {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [nameError, setNameError] = useState<string>();
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);

  if (!user) return null;
  const unchanged = name.trim() === user.name;

  async function save() {
    const invalid = validateName(name);
    setNameError(invalid);
    setError(undefined);
    if (invalid) return;
    setSaving(true);
    try {
      await updateProfile({ name });
      onSaved();
    } catch (failure) {
      setError(messageFor(failure));
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <TopBar title="Editar perfil" onBack={onBack} />
          <View style={styles.avatar}>
            <UserAvatar user={{ ...user, name: name || user.name }} size={88} />
            {user.avatarUrl ? (
              <Text style={styles.note}>A foto vem da sua conta Google.</Text>
            ) : null}
          </View>
          <View style={styles.form}>
            <TextField
              label="Nome"
              value={name}
              onChangeText={(value) => {
                setName(value);
                if (nameError) setNameError(undefined);
              }}
              error={nameError}
              autoCapitalize="words"
              autoComplete="name"
              textContentType="name"
              maxLength={MAX_NAME_LENGTH}
              returnKeyType="done"
              onSubmitEditing={save}
            />
            <TextField
              label="E-mail"
              value={user.email}
              onChangeText={() => {}}
              disabled
              accessibilityHint="O e-mail da conta não pode ser alterado"
            />
          </View>
          <View style={styles.footer}>
            <FormMessage message={error} />
            <Button
              label="Salvar"
              shape="pill"
              loading={saving}
              disabled={unchanged}
              onPress={save}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  flex: { flex: 1 },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
  avatar: {
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  note: { ...typography.caption, color: colors.textSecondary },
  form: { gap: spacing.lg },
  footer: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    gap: spacing.md,
    paddingTop: spacing.xxl,
  },
});
