import { Pressable, StyleSheet, Text, View } from "react-native";

import { useAppTheme } from "../theme";

export type Frequency = "daily" | "weekly" | "monthly";

type FrequencyOption = {
  label: string;
  value: Frequency;
};

const frequencyOptions: FrequencyOption[] = [
  { label: "Diaria", value: "daily" },
  { label: "Semanal", value: "weekly" },
  { label: "Mensal", value: "monthly" }
];

type FrequencySelectorProps = {
  value: Frequency;
  onChange: (value: Frequency) => void;
  options?: FrequencyOption[];
};

export function FrequencySelector({ value, onChange, options = frequencyOptions }: FrequencySelectorProps) {
  const { theme } = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      {options.map((option) => {
        const selected = option.value === value;

        return (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected }}
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[
              styles.option,
              {
                backgroundColor: selected ? theme.colors.primary : "transparent"
              }
            ]}
          >
            <Text
              style={[
                styles.label,
                {
                  color: selected ? theme.colors.onPrimary : theme.colors.text,
                  fontFamily: selected ? theme.typography.fontFamily.bold : theme.typography.fontFamily.regular
                }
              ]}
              numberOfLines={1}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    padding: 4
  },
  option: {
    flex: 1,
    minHeight: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 7,
    paddingHorizontal: 8
  },
  label: {
    fontSize: 12,
    lineHeight: 16
  }
});
