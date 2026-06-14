import type { PropsWithChildren } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

import { useAppTheme } from "../theme";

type CardProps = PropsWithChildren<{
  muted?: boolean;
  style?: StyleProp<ViewStyle>;
}>;

export function Card({ children, muted = false, style }: CardProps) {
  const { theme } = useAppTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: muted ? theme.colors.surfaceMuted : theme.colors.surface,
          shadowColor: theme.colors.shadow,
          borderColor: theme.colors.border
        },
        style
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 16,
    padding: 16,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 2
  }
});
