import { StyleSheet, Text, View } from "react-native";

import { useAppTheme } from "../theme";
import { Button } from "./Button";

type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  onActionPress?: () => void;
};

export function EmptyState({ title, description, actionLabel, onActionPress }: EmptyStateProps) {
  const { theme } = useAppTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.orbitOuter, { borderColor: theme.colors.secondary }]}>
        <View style={[styles.orbitMiddle, { borderColor: theme.colors.secondary }]}>
          <View style={[styles.orbitCore, { backgroundColor: theme.colors.secondary }]} />
        </View>
      </View>
      <Text style={[styles.title, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.bold }]}>{title}</Text>
      <Text style={[styles.description, { color: theme.colors.muted, fontFamily: theme.typography.fontFamily.regular }]}>{description}</Text>
      {actionLabel && onActionPress ? <Button title={actionLabel} fullWidth={false} onPress={onActionPress} style={styles.action} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24
  },
  orbitOuter: {
    width: 164,
    height: 164,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 82,
    borderWidth: StyleSheet.hairlineWidth,
    borderStyle: "dashed"
  },
  orbitMiddle: {
    width: 100,
    height: 100,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 50,
    borderWidth: StyleSheet.hairlineWidth,
    borderStyle: "dashed"
  },
  orbitCore: {
    width: 42,
    height: 42,
    borderRadius: 21
  },
  title: {
    marginTop: 28,
    fontSize: 18,
    lineHeight: 22,
    textAlign: "center"
  },
  description: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center"
  },
  action: {
    marginTop: 24,
    minWidth: 128
  }
});
