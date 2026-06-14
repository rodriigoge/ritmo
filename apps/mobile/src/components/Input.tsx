import { StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native";

import { useAppTheme } from "../theme";

type InputProps = TextInputProps & {
  label: string;
  error?: string;
  helperText?: string;
};

export function Input({ label, error, helperText, style, ...textInputProps }: InputProps) {
  const { theme } = useAppTheme();
  const supportText = error ?? helperText;

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.bold }]}>{label}</Text>
      <TextInput
        placeholderTextColor={theme.colors.subtle}
        selectionColor={theme.colors.primary}
        style={[
          styles.input,
          {
            backgroundColor: theme.colors.input,
            borderColor: error ? theme.colors.danger : theme.colors.input,
            color: theme.colors.inputText,
            fontFamily: theme.typography.fontFamily.regular
          },
          style
        ]}
        {...textInputProps}
      />
      {supportText ? (
        <Text style={[styles.supportText, { color: error ? theme.colors.danger : theme.colors.muted, fontFamily: theme.typography.fontFamily.regular }]}>
          {supportText}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6
  },
  label: {
    fontSize: 11,
    lineHeight: 14
  },
  input: {
    minHeight: 48,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 14,
    lineHeight: 18
  },
  supportText: {
    fontSize: 12,
    lineHeight: 16
  }
});
