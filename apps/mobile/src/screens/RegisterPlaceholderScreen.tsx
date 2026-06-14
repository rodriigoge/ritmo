import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { RootStackParamList } from "../navigation/routes";
import { useAppTheme } from "../theme";

type RegisterPlaceholderScreenProps = NativeStackScreenProps<RootStackParamList, "Register">;

export function RegisterPlaceholderScreen({ navigation }: RegisterPlaceholderScreenProps) {
  const { theme } = useAppTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <View style={styles.container}>
        <Text style={[styles.title, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.bold }]}>Criar conta</Text>
        <Text style={[styles.description, { color: theme.colors.muted, fontFamily: theme.typography.fontFamily.regular }]}>
          A tela de cadastro será implementada na próxima história.
        </Text>
        <Pressable accessibilityRole="button" onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={[styles.backText, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.bold }]}>Voltar para login</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32
  },
  title: {
    fontSize: 32,
    lineHeight: 38,
    textAlign: "center"
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    marginTop: 12
  },
  backButton: {
    minHeight: 44,
    justifyContent: "center",
    marginTop: 28
  },
  backText: {
    fontSize: 15,
    lineHeight: 20
  }
});
