import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useState } from 'react';
import {
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../design-system/components/Button/Button';
import { FloatingSheet } from '../../design-system/components/FloatingSheet/FloatingSheet';
import { ChevronRightIcon } from '../../design-system/components/Icon/Icons';
import { TopBar } from '../../design-system/components/TopBar/TopBar';
import {
  makeStyles,
  useColors,
  useTheme,
} from '../../design-system/theme/ThemeProvider';
import { controls } from '../../design-system/tokens/controls';
import { spacing } from '../../design-system/tokens/spacing';
import {
  fontFamilies,
  typography,
} from '../../design-system/tokens/typography';
import { useReminders } from './RemindersProvider';
import { formatReminderTime } from './reminderSettings';

function timeAsDate(hour: number, minute: number): Date {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date;
}

export function NotificationsScreen({ onBack }: { onBack: () => void }) {
  const styles = useStyles();
  const colors = useColors();
  const { scheme } = useTheme();
  const { settings, setEnabled, setTime } = useReminders();
  const [picking, setPicking] = useState(false);
  const [draft, setDraft] = useState(() =>
    timeAsDate(settings.hour, settings.minute),
  );
  const [denied, setDenied] = useState(false);
  const [busy, setBusy] = useState(false);
  const time = formatReminderTime(settings);

  async function toggle(enabled: boolean) {
    setBusy(true);
    try {
      const result = await setEnabled(enabled);
      setDenied(result === 'denied');
    } finally {
      setBusy(false);
    }
  }

  function openPicker() {
    setDraft(timeAsDate(settings.hour, settings.minute));
    setPicking(true);
  }

  // Android shows the system clock dialog and reports once.
  function onAndroidChange(event: DateTimePickerEvent, date?: Date) {
    setPicking(false);
    if (event.type === 'set' && date)
      void setTime(date.getHours(), date.getMinutes());
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <TopBar title="Notificações" onBack={onBack} />
        <View style={styles.intro}>
          <Text accessibilityRole="header" style={styles.title}>
            Um lembrete por dia
          </Text>
          <Text style={styles.body}>
            O Pingo te avisa no horário escolhido para você marcar seus hábitos.
            Só isso, nada mais.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Lembrete diário</Text>
            <Switch
              accessibilityLabel="Lembrete diário"
              value={settings.enabled}
              disabled={busy}
              onValueChange={(value) => {
                void toggle(value);
              }}
              trackColor={{ false: colors.inactive, true: colors.ink }}
              thumbColor={colors.canvas}
              ios_backgroundColor={colors.inactive}
            />
          </View>
          <View style={styles.rule} />
          <Pressable
            onPress={openPicker}
            disabled={!settings.enabled}
            accessibilityRole="button"
            accessibilityLabel={`Horário, ${time}`}
            accessibilityHint="Escolhe a hora do lembrete"
            accessibilityState={{ disabled: !settings.enabled }}
            style={({ pressed }) => [
              styles.row,
              !settings.enabled && styles.off,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.label}>Horário</Text>
            <View style={styles.valueRow}>
              <Text style={styles.time}>{time}</Text>
              <ChevronRightIcon size={18} color={colors.textMuted} />
            </View>
          </Pressable>
        </View>

        {denied && (
          <View style={styles.denied}>
            <Text accessibilityRole="alert" style={styles.deniedText}>
              As notificações do Ritmo estão bloqueadas neste celular. Libere
              nas configurações para receber o lembrete.
            </Text>
            <Button
              label="Abrir configurações"
              variant="outline"
              shape="pill"
              onPress={() => {
                void Linking.openSettings();
              }}
            />
          </View>
        )}

        <View
          style={[styles.preview, !settings.enabled && styles.off]}
          accessibilityLabel={`Prévia: Hora de marcar seus hábitos, às ${time}`}
          accessible
        >
          <Text style={styles.previewCaption}>PRÉVIA</Text>
          <View style={styles.previewCard}>
            <View style={styles.previewHeader}>
              <Text style={styles.previewApp}>Ritmo</Text>
              <Text style={styles.previewApp}>{time}</Text>
            </View>
            <Text style={styles.previewTitle}>Hora de marcar seus hábitos</Text>
            <Text style={styles.previewBody}>
              O Pingo está de olho no seu ritmo. Marque o que você já fez hoje.
            </Text>
          </View>
        </View>
      </ScrollView>

      {picking && Platform.OS === 'android' && (
        <DateTimePicker
          mode="time"
          is24Hour
          value={draft}
          onChange={onAndroidChange}
        />
      )}
      {picking && Platform.OS !== 'android' && (
        <FloatingSheet title="Horário" onClose={() => setPicking(false)}>
          <DateTimePicker
            mode="time"
            display="spinner"
            is24Hour
            value={draft}
            themeVariant={scheme}
            onChange={(_event, date) => {
              if (date) setDraft(date);
            }}
          />
          <Button
            label="Salvar"
            onPress={() => {
              setPicking(false);
              void setTime(draft.getHours(), draft.getMinutes());
            }}
          />
        </FloatingSheet>
      )}
    </SafeAreaView>
  );
}

const useStyles = makeStyles((colors) => ({
  screen: { flex: 1, backgroundColor: colors.canvas },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
    gap: spacing.xl,
  },
  intro: { gap: spacing.sm, marginTop: spacing.md },
  title: {
    ...typography.title,
    fontFamily: fontFamilies.bold,
    letterSpacing: -0.4,
    color: colors.ink,
  },
  body: { ...typography.body, color: colors.textSecondary },
  card: {
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 24,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
  },
  row: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  rule: { height: 1, backgroundColor: colors.cardBorder },
  label: {
    ...typography.body,
    fontFamily: fontFamilies.semibold,
    color: colors.ink,
    flexShrink: 1,
  },
  valueRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  time: {
    fontFamily: fontFamilies.bold,
    fontSize: 20,
    lineHeight: 26,
    color: colors.ink,
    fontVariant: ['tabular-nums'],
  },
  off: { opacity: controls.disabledOpacity },
  pressed: { opacity: controls.pressedOpacity },
  denied: { gap: spacing.md },
  deniedText: { ...typography.body, color: colors.danger },
  preview: { gap: spacing.sm },
  previewCaption: {
    ...typography.label,
    fontSize: 11,
    letterSpacing: 0.6,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  previewCard: {
    backgroundColor: colors.chip,
    borderRadius: 20,
    padding: spacing.lg,
    gap: 2,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  previewApp: { ...typography.caption, color: colors.textSecondary },
  previewTitle: {
    ...typography.body,
    fontFamily: fontFamilies.semibold,
    color: colors.ink,
  },
  previewBody: { ...typography.body, color: colors.textSecondary },
}));
