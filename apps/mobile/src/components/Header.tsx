import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useAppTheme } from "../theme";

type HeaderProps = {
  title: string;
  subtitle?: string;
  onBackPress?: () => void;
  rightAccessory?: ReactNode;
};

export function Header({ title, subtitle, onBackPress, rightAccessory }: HeaderProps) {
  const { theme } = useAppTheme();

  return (
    <View style={styles.container}>
      {onBackPress ? (
        <Pressable accessibilityRole="button" onPress={onBackPress} style={[styles.backButton, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.backIcon, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.bold }]}>‹</Text>
        </Pressable>
      ) : null}
      <View style={styles.titleArea}>
        <Text style={[styles.title, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.bold }]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: theme.colors.muted, fontFamily: theme.typography.fontFamily.regular }]} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {rightAccessory ? <View style={styles.accessory}>{rightAccessory}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  backButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16
  },
  backIcon: {
    marginTop: -2,
    fontSize: 25,
    lineHeight: 28
  },
  titleArea: {
    flex: 1,
    minWidth: 0
  },
  title: {
    fontSize: 18,
    lineHeight: 22
  },
  subtitle: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 16
  },
  accessory: {
    marginLeft: "auto"
  }
});
