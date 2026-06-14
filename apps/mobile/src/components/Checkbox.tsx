import { Pressable, StyleSheet, Text, type PressableProps } from "react-native";

import { useAppTheme } from "../theme";

type CheckboxProps = Omit<PressableProps, "children"> & {
  checked: boolean;
  label?: string;
};

export function Checkbox({ checked, label, disabled, ...pressableProps }: CheckboxProps) {
  const { theme } = useAppTheme();
  const isDisabled = Boolean(disabled);

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled: isDisabled }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.container,
        {
          opacity: isDisabled ? 0.48 : pressed ? 0.76 : 1
        }
      ]}
      {...pressableProps}
    >
      <Text
        style={[
          styles.box,
          {
            backgroundColor: checked ? theme.colors.primary : "transparent",
            borderColor: checked ? theme.colors.primary : theme.colors.border,
            color: checked ? theme.colors.onPrimary : theme.colors.text,
            fontFamily: theme.typography.fontFamily.bold
          }
        ]}
      >
        {checked ? "✓" : ""}
      </Text>
      {label ? <Text style={[styles.label, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.medium }]}>{label}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  box: {
    width: 22,
    height: 22,
    overflow: "hidden",
    borderRadius: 11,
    borderWidth: 1,
    fontSize: 13,
    lineHeight: 21,
    textAlign: "center"
  },
  label: {
    flex: 1,
    fontSize: 14,
    lineHeight: 18
  }
});
