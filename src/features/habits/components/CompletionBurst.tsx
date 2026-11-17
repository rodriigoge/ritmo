import { useEffect } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  View,
  useAnimatedValue,
} from 'react-native';
import { colors } from '../../../design-system/tokens/colors';

// Confetti that bursts out of a day mark. Kept for the moments that matter
// (checking today, beating a record) so the reward stays special.

const CONFETTI_COLORS = [colors.ink, colors.accent, colors.brand, '#F2B33D'];

type Piece = {
  angle: number;
  distance: number;
  size: number;
  color: string;
  round: boolean;
  spin: number;
};

function pieces(count: number, reach: number): Piece[] {
  return Array.from({ length: count }, (_, index) => {
    // Even spread with a small, fixed wobble so it doesn't look mechanical.
    const wobble = ((index * 37) % 11) / 11 - 0.5;
    return {
      angle: (index / count) * Math.PI * 2 + wobble * 0.5,
      distance: reach * (0.75 + ((index * 53) % 7) / 24),
      size: index % 3 === 0 ? 6 : 5,
      color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
      round: index % 2 === 0,
      spin: (index % 2 === 0 ? 1 : -1) * (90 + ((index * 29) % 90)),
    };
  });
}

const SMALL = pieces(10, 22);
const BIG = pieces(16, 34);

/** Plays once every time `trigger` changes to a new positive number. */
export function CompletionBurst({
  trigger,
  big = false,
}: {
  trigger: number;
  big?: boolean;
}) {
  const progress = useAnimatedValue(0);

  useEffect(() => {
    if (trigger <= 0) return;
    progress.setValue(0);
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: big ? 520 : 420,
      // Fast launch, soft landing.
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [trigger, big, progress]);

  if (trigger <= 0) return null;
  return (
    <View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={styles.origin}
      testID="completion-burst"
    >
      {(big ? BIG : SMALL).map((piece, index) => (
        <Animated.View
          key={index}
          style={[
            styles.piece,
            {
              width: piece.size,
              height: piece.round ? piece.size : piece.size * 1.8,
              marginLeft: -piece.size / 2,
              marginTop: -piece.size / 2,
              borderRadius: piece.round ? piece.size / 2 : 1,
              backgroundColor: piece.color,
              opacity: progress.interpolate({
                inputRange: [0, 0.04, 0.65, 1],
                outputRange: [0, 1, 1, 0],
              }),
              transform: [
                {
                  translateX: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, Math.cos(piece.angle) * piece.distance],
                  }),
                },
                {
                  translateY: progress.interpolate({
                    inputRange: [0, 1],
                    // A touch of gravity at the end of the flight.
                    outputRange: [
                      0,
                      Math.sin(piece.angle) * piece.distance + 6,
                    ],
                  }),
                },
                {
                  rotate: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', `${piece.spin}deg`],
                  }),
                },
                {
                  scale: progress.interpolate({
                    inputRange: [0, 0.12, 1],
                    outputRange: [0.4, 1, 0.7],
                  }),
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  origin: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: 0,
    height: 0,
  },
  piece: { position: 'absolute' },
});
