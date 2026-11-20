import { useRouter } from 'expo-router';
import { useState } from 'react';
import { HabitFormSheet } from '../../src/features/habits/components/HabitFormSheet';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconButton } from '../../src/design-system/components/IconButton/IconButton';
import { makeStyles } from '../../src/design-system/theme/ThemeProvider';
import { controls } from '../../src/design-system/tokens/controls';
import { radius } from '../../src/design-system/tokens/radius';
import { spacing } from '../../src/design-system/tokens/spacing';
import {
  fontFamilies,
  typography,
} from '../../src/design-system/tokens/typography';
import { HabitCard } from '../../src/features/habits/components/HabitCard';
import { useHomeLayout } from '../../src/features/habits/homeLayout/HomeLayoutProvider';
import { HabitListSkeleton } from '../../src/features/habits/components/HabitListSkeleton';
import { HabitDragHandle } from '../../src/features/habits/components/HabitDragHandle';
import { ReorderableList } from '../../src/design-system/components/ReorderableList/ReorderableList';
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
  const styles = useStyles();
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
    moveHabit,
    orderError,
  } = useHabits();
  const { user } = useAuth();
  const { layout } = useHomeLayout();
  const [creating, setCreating] = useState(false);
  const firstName = user?.name.trim().split(/\s+/)[0];
  return (
    <SafeAreaView style={styles.screen}>
      <View
        style={styles.body}
        accessibilityElementsHidden={creating}
        importantForAccessibility={creating ? 'no-hide-descendants' : 'auto'}
      >
        <ReorderableList
          data={habits}
          keyExtractor={(habit) => habit.id}
          onMove={moveHabit}
          gap={spacing.md}
          renderItem={({ item, index, dragHandleProps }) => (
            <HabitCard
              variant={layout}
              dragHandle={
                habits.length > 1 ? (
                  <HabitDragHandle
                    name={item.name}
                    index={index}
                    count={habits.length}
                    dragHandleProps={dragHandleProps}
                    onMove={moveHabit}
                  />
                ) : undefined
              }
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
          contentContainerStyle={styles.content}
          empty={
            loading ? (
              <HabitListSkeleton layout={layout} />
            ) : !error ? (
              <EmptyHabits />
            ) : null
          }
          header={
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
              {orderError && (
                <Text accessibilityRole="alert" style={styles.orderError}>
                  {orderError}
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
const useStyles = makeStyles((colors) => ({
  screen: { flex: 1, backgroundColor: colors.canvas },
  body: { flex: 1 },
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
  orderError: { ...typography.body, color: colors.danger },
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
}));
