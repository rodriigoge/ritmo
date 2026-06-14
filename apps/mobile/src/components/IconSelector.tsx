import { Pressable, StyleSheet, Text, View } from "react-native";

import { useAppTheme } from "../theme";

export type IconOption = {
  label: string;
  value: string;
};

export const defaultIconOptions: IconOption[] = [
  { label: "Run", value: "🏃" },
  { label: "Strength", value: "💪" },
  { label: "Books", value: "📚" },
  { label: "Music", value: "🎵" },
  { label: "Meditation", value: "🧘" },
  { label: "Medicine", value: "💊" },
  { label: "Water", value: "💧" },
  { label: "Writing", value: "✍️" },
  { label: "Fruit", value: "🍎" },
  { label: "Sleep", value: "😴" },
  { label: "No icon", value: "#" }
];

type IconSelectorProps = {
  value?: string;
  onChange: (value: string) => void;
  options?: IconOption[];
};

export function IconSelector({ value, onChange, options = defaultIconOptions }: IconSelectorProps) {
  const { theme } = useAppTheme();

  return (
    <View style={styles.grid}>
      {options.map((option) => {
        const selected = option.value === value;

        return (
          <Pressable
            accessibilityLabel={option.label}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            key={`${option.label}-${option.value}`}
            onPress={() => onChange(option.value)}
            style={({ pressed }) => [
              styles.option,
              {
                backgroundColor: theme.colors.surface,
                borderColor: selected ? theme.colors.primary : theme.colors.border,
                opacity: pressed ? 0.76 : 1
              }
            ]}
          >
            <Text style={[styles.icon, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.bold }]}>{option.value}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  option: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    borderWidth: 1
  },
  icon: {
    fontSize: 20,
    lineHeight: 24
  }
});
