import { useRouter } from 'expo-router';
import { useState } from 'react';
import { HabitFormSheet } from '../../src/features/habits/components/HabitFormSheet';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconButton } from '../../src/design-system/components/IconButton/IconButton';
import { colors } from '../../src/design-system/tokens/colors';
import { controls } from '../../src/design-system/tokens/controls';
import { radius } from '../../src/design-system/tokens/radius';
import { spacing } from '../../src/design-system/tokens/spacing';
import {
  fontFamilies,
  typography,
} from '../../src/design-system/tokens/typography';
import { HabitCard } from '../../src/features/habits/components/HabitCard';
import { useHabits } from '../../src/features/habits/hooks/useHabits';
import { Button } from '../../src/design-system/components/Button/Button';
import { formatLocalDate } from '../../src/shared/date/dateUtils';
import { TopBar } from '../../src/design-system/components/TopBar/TopBar';
import { useAuth } from '../../src/features/auth/AuthProvider';
import { ProfileButton } from '../../src/features/auth/components/UserAvatar';
import {
  CreateHabitHint,
  EmptyHabits,
} from '../../src/features/habits/components/EmptyHabits';

export default function Home() {
  const router = useRouter();
  const {
    habits,
    loading,
    error,
    today,
    refresh,
    createHabit,
    toggleDay,
    completionError,
    recordFeedback,
  } = useHabits();
  const { user } = useAuth();
  const [creating, setCreating] = useState(false);
  const doneToday = habits.filter((habit) =>
    habit.completedDates.includes(today),
  ).length;
  const firstName = user?.name.trim().split(/\s+/)[0];
  return (
    <SafeAreaView style={styles.screen}>
      <View
        style={styles.body}
        accessibilityElementsHidden={creating}
        importantForAccessibility={creating ? 'no-hide-descendants' : 'auto'}
      >
        <FlatList
          data={habits}
          keyExtractor={(habit) => habit.id}
          renderItem={({ item }) => (
            <HabitCard
              onPress={() =>
                router.push({
                  pathname: '/habit/[id]',
                  params: { id: item.id },
                })
              }
              habit={item}
              today={today}
              onToggleDay={(date) => toggleDay(item.id, date)}
              error={
                completionError?.habitId === item.id
                  ? completionError.message
                  : undefined
              }
              recordId={
                recordFeedback?.habitId === item.id
                  ? recordFeedback.id
                  : undefined
              }
            />
          )}
          ItemSeparatorComponent={HabitSpacing}
          contentContainerStyle={styles.content}
          ListEmptyComponent={!loading && !error ? <EmptyHabits /> : null}
          ListHeaderComponent={
            <View style={styles.header}>
              <TopBar
                align="start"
                title="Meus hábitos"
                right={
                  user ? (
                    <ProfileButton
                      user={user}
                      onPress={() => router.push('/profile')}
                    />
                  ) : null
                }
              />
              <View style={styles.intro}>
                {firstName ? (
                  <Text style={styles.greeting}>Olá, {firstName}</Text>
                ) : null}
                <Text style={styles.date}>
                  {formatLocalDate(today, { day: 'numeric', month: 'long' })}
                </Text>
              </View>
              {habits.length > 0 && (
                <TodayProgress done={doneToday} total={habits.length} />
              )}
              {loading && (
                <Text style={styles.date} accessibilityLiveRegion="polite">
                  Carregando hábitos…
                </Text>
              )}
              {error && (
                <View>
                  <Text accessibilityRole="alert" style={styles.date}>
                    {error}
                  </Text>
                  <Button label="Tentar novamente" onPress={refresh} />
                </View>
              )}
            </View>
          }
        />
        {!loading && !error && habits.length === 0 && (
          <View style={styles.hint}>
            <CreateHabitHint />
          </View>
        )}
        <View style={styles.action}>
          <IconButton
            variant="floating"
            accessibilityLabel="Criar hábito"
            onPress={() => setCreating(true)}
            disabled={loading || Boolean(error)}
            renderIcon={({ color, size }) => (
              <View style={{ width: size, height: size }}>
                <View
                  style={[styles.plusHorizontal, { backgroundColor: color }]}
                />
                <View
                  style={[styles.plusVertical, { backgroundColor: color }]}
                />
              </View>
            )}
          />
        </View>
      </View>
      {creating && (
        <HabitFormSheet
          onSave={createHabit}
          onClose={() => setCreating(false)}
        />
      )}
    </SafeAreaView>
  );
}
function TodayProgress({ done, total }: { done: number; total: number }) {
  const label =
    done === total
      ? 'Tudo feito hoje. Bom ritmo!'
      : `${done} de ${total} ${total === 1 ? 'hábito feito' : 'hábitos feitos'} hoje`;
  return (
    <View
      style={styles.progress}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: total, now: done }}
    >
      <Text style={styles.progressLabel}>{label}</Text>
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${Math.round((done / total) * 100)}%` },
          ]}
        />
      </View>
    </View>
  );
}
function HabitSpacing() {
  return <View style={styles.habitSpacing} />;
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  body: { flex: 1 },
  habitSpacing: { height: spacing.md },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl * 2 },
  header: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  intro: { gap: 2, marginTop: spacing.md },
  greeting: {
    ...typography.title,
    fontFamily: fontFamilies.bold,
    color: colors.ink,
    letterSpacing: -0.4,
  },
  date: { ...typography.body, color: colors.textSecondary },
  progress: {
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 20,
    padding: spacing.lg,
    gap: spacing.md,
  },
  progressLabel: {
    ...typography.body,
    fontFamily: fontFamilies.semibold,
    color: colors.ink,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.chip,
    overflow: 'hidden',
  },
  progressFill: { height: 8, borderRadius: 4, backgroundColor: colors.ink },
  // Ends just above the left half of the floating button.
  hint: {
    position: 'absolute',
    right: spacing.lg + controls.minTouchTarget / 2,
    bottom: spacing.lg + controls.minTouchTarget + spacing.xs,
  },
  action: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    borderRadius: radius.round,
    backgroundColor: colors.floatingAction,
  },
  plusHorizontal: {
    position: 'absolute',
    top: (controls.floatingIconSize - controls.floatingIconStrokeWidth) / 2,
    width: controls.floatingIconSize,
    height: controls.floatingIconStrokeWidth,
    borderRadius: controls.floatingIconStrokeWidth / 2,
  },
  plusVertical: {
    position: 'absolute',
    left: (controls.floatingIconSize - controls.floatingIconStrokeWidth) / 2,
    width: controls.floatingIconStrokeWidth,
    height: controls.floatingIconSize,
    borderRadius: controls.floatingIconStrokeWidth / 2,
  },
});
