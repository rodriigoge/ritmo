import { StyleSheet, Text, View } from "react-native";

import { Screen } from "../components/Screen";
import { useAppTheme } from "../theme/AppThemeProvider";

export function HomeScreen() {
  const { theme } = useAppTheme();

  return (
    <Screen>
      <View style={styles.container}>
        <Text style={[styles.title, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.bold }]}>Ritmo</Text>
        <Text style={[styles.subtitle, { color: theme.colors.muted, fontFamily: theme.typography.fontFamily.regular }]}>
          Acompanhe suas tarefas no seu tempo.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center"
  },
  title: {
    fontSize: 40,
    lineHeight: 46
  },
  subtitle: {
    fontSize: 18,
    lineHeight: 26,
    marginTop: 12
  }
});
