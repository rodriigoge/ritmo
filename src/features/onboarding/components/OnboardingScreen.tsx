import { useEffect, useState, type ReactNode } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Text,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../../design-system/components/Button/Button';
import { Logo } from '../../../design-system/components/Logo/Logo';
import { makeStyles, useColors } from '../../../design-system/theme/ThemeProvider';
import { controls } from '../../../design-system/tokens/controls';
import { spacing } from '../../../design-system/tokens/spacing';
import {
  fontFamilies,
  typography,
} from '../../../design-system/tokens/typography';
import {
  ILLUSTRATION_ASPECT_RATIO,
  OnboardingIllustration,
} from '../illustrations/OnboardingIllustration';
import { ONBOARDING_PAGES } from '../onboardingPages';

const MAX_ART_WIDTH = 340;
const DOT_SIZE = 8;
const ACTIVE_DOT_WIDTH = 28;

export function OnboardingScreen({
  onCreateAccount,
  onSignIn,
}: {
  onCreateAccount: () => void;
  onSignIn: () => void;
}) {
  const styles = useStyles();
  const colors = useColors();
  const { width, height } = useWindowDimensions();
  const [scrollX] = useState(() => new Animated.Value(0));
  const [index, setIndex] = useState(0);
  const [pageHeight, setPageHeight] = useState(0);
  const lastIndex = ONBOARDING_PAGES.length - 1;
  // Keep the copy and footer visible on short screens.
  const artWidth = Math.min(
    width - spacing.xl * 2,
    MAX_ART_WIDTH,
    height * 0.36 * ILLUSTRATION_ASPECT_RATIO,
  );

  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    {
      useNativeDriver: false,
      listener: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const page = Math.round(event.nativeEvent.contentOffset.x / width);
        setIndex(Math.max(0, Math.min(lastIndex, page)));
      },
    },
  );

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Logo height={24} />
      </View>

      <Animated.FlatList
        data={ONBOARDING_PAGES}
        keyExtractor={(page) => page.scene}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        getItemLayout={(_, itemIndex) => ({
          length: width,
          offset: width * itemIndex,
          index: itemIndex,
        })}
        onLayout={(event) => setPageHeight(event.nativeEvent.layout.height)}
        style={styles.list}
        renderItem={({ item, index: itemIndex }) => (
          <View
            style={[styles.page, { width, height: pageHeight || undefined }]}
            accessibilityElementsHidden={itemIndex !== index}
            importantForAccessibility={
              itemIndex === index ? 'auto' : 'no-hide-descendants'
            }
          >
            <View style={styles.art}>
              <FloatingArt>
                <OnboardingIllustration scene={item.scene} width={artWidth} />
              </FloatingArt>
            </View>
            <View style={styles.copy}>
              <Text accessibilityRole="header" style={styles.title}>
                {item.title}
              </Text>
              <Text style={styles.description}>{item.description}</Text>
            </View>
          </View>
        )}
      />

      <View style={styles.footer}>
        <View
          style={styles.dots}
          accessible
          accessibilityLabel={`Página ${index + 1} de ${ONBOARDING_PAGES.length}`}
        >
          {ONBOARDING_PAGES.map((page, dotIndex) => {
            const inputRange = [
              (dotIndex - 1) * width,
              dotIndex * width,
              (dotIndex + 1) * width,
            ];
            return (
              <Animated.View
                key={page.scene}
                style={[
                  styles.dot,
                  {
                    width: scrollX.interpolate({
                      inputRange,
                      outputRange: [DOT_SIZE, ACTIVE_DOT_WIDTH, DOT_SIZE],
                      extrapolate: 'clamp',
                    }),
                    backgroundColor: scrollX.interpolate({
                      inputRange,
                      outputRange: [
                        colors.inactive,
                        colors.ink,
                        colors.inactive,
                      ],
                      extrapolate: 'clamp',
                    }),
                  },
                ]}
              />
            );
          })}
        </View>
        <View style={styles.actions}>
          <Button shape="pill" label="Criar conta" onPress={onCreateAccount} />
          <Button
            variant="outline"
            shape="pill"
            label="Já tenho conta"
            onPress={onSignIn}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

// A slow bob keeps Pingo alive; skipped when the system asks for less motion.
function FloatingArt({ children }: { children: ReactNode }) {
  const [offset] = useState(() => new Animated.Value(0));
  useEffect(() => {
    let loop: Animated.CompositeAnimation | undefined;
    let cancelled = false;
    const step = (toValue: number) =>
      Animated.timing(offset, {
        toValue,
        duration: 1400,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      });
    AccessibilityInfo.isReduceMotionEnabled()
      .then((reduceMotion) => {
        if (cancelled || reduceMotion) return;
        loop = Animated.loop(Animated.sequence([step(-6), step(0)]));
        loop.start();
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      loop?.stop();
    };
  }, [offset]);
  return (
    <Animated.View style={{ transform: [{ translateY: offset }] }}>
      {children}
    </Animated.View>
  );
}

const useStyles = makeStyles((colors) => ({
  screen: { flex: 1, backgroundColor: colors.canvas },
  header: {
    height: controls.minTouchTarget,
    paddingHorizontal: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
  },
  list: { flex: 1 },
  page: { justifyContent: 'center', paddingBottom: spacing.lg },
  art: { alignItems: 'center', marginBottom: spacing.xxl },
  copy: {
    paddingHorizontal: spacing.xxl,
    gap: spacing.md,
    alignItems: 'center',
  },
  title: {
    ...typography.title,
    fontFamily: fontFamilies.bold,
    color: colors.ink,
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    gap: spacing.xl,
  },
  actions: { gap: spacing.md },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm - 2,
  },
  dot: { height: DOT_SIZE, borderRadius: DOT_SIZE / 2 },
}));
