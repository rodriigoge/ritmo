import { StyleSheet, Text, View } from "react-native";

import { Screen } from "../components/Screen";
import { useAppTheme } from "../theme/AppThemeProvider";

export function TasksScreen() {
  const { theme } = useAppTheme();

  return (
    <Screen>
      <View style={styles.container}>
        <Text style={[styles.heading, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.bold }]}>Tarefas</Text>
        <Text style={[styles.body, { color: theme.colors.muted, fontFamily: theme.typography.fontFamily.regular }]}>
          Estrutura reservada para a evolução das próximas stories.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8
  },
  heading: {
    fontSize: 28,
    lineHeight: 34
  },
  body: {
    fontSize: 16,
    lineHeight: 24
  }
});
