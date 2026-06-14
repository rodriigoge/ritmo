import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View, type PressableProps, type StyleProp, type ViewStyle } from "react-native";

import { useAppTheme } from "../theme";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = PressableProps & {
  title: string;
  variant?: ButtonVariant;
  leftAccessory?: ReactNode;
  rightAccessory?: ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Button({
  title,
  variant = "primary",
  leftAccessory,
  rightAccessory,
  loading = false,
  fullWidth = true,
  disabled,
  style,
  ...pressableProps
}: ButtonProps) {
  const { theme } = useAppTheme();
  const isDisabled = disabled || loading;
  const backgroundColor =
    variant === "primary" ? theme.colors.primary : variant === "secondary" ? theme.colors.surfaceElevated : "transparent";
  const borderColor = variant === "secondary" ? theme.colors.secondary : "transparent";
  const color = variant === "primary" ? theme.colors.onPrimary : theme.colors.text;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        {
          alignSelf: fullWidth ? "stretch" : "flex-start",
          backgroundColor,
          borderColor,
          opacity: isDisabled ? 0.56 : pressed ? 0.86 : 1
        },
        style
      ]}
      {...pressableProps}
    >
      {loading ? (
        <ActivityIndicator color={color} size="small" />
      ) : (
        <View style={styles.content}>
          {leftAccessory}
          <Text style={[styles.title, { color, fontFamily: theme.typography.fontFamily.bold }]} numberOfLines={1}>
            {title}
          </Text>
          {rightAccessory}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 18
  },
  content: {
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8
  },
  title: {
    flexShrink: 1,
    fontSize: 14,
    lineHeight: 18,
    textAlign: "center"
  }
});
