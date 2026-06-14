import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useMemo, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "../components/Button";
import type { RootStackParamList } from "../navigation/routes";
import { productColors, useAppTheme } from "../theme";

type LoginScreenProps = NativeStackScreenProps<RootStackParamList, "Login">;

type LoginErrors = {
  email?: string;
  password?: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateLogin(email: string, password: string): LoginErrors {
  const errors: LoginErrors = {};
  const trimmedEmail = email.trim();

  if (!trimmedEmail) {
    errors.email = "Informe seu e-mail.";
  } else if (!EMAIL_PATTERN.test(trimmedEmail)) {
    errors.email = "Digite um e-mail válido.";
  }

  if (!password) {
    errors.password = "Informe sua senha.";
  }

  return errors;
}

export function LoginScreen({ navigation }: LoginScreenProps) {
  const { theme } = useAppTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const errors = useMemo(() => (submitted ? validateLogin(email, password) : {}), [email, password, submitted]);
  const hasErrors = Boolean(errors.email || errors.password);

  function enterApp() {
    navigation.replace("MainTabs");
  }

  function handleSubmit() {
    setSubmitted(true);

    if (Object.keys(validateLogin(email, password)).length > 0) {
      return;
    }

    enterApp();
  }

  function handleCreateAccount() {
    Alert.alert("Criar conta", "A tela de cadastro será adicionada em uma próxima história.");
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.keyboard}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <Text style={[styles.brand, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.bold }]}>Ritmo</Text>

            <View style={styles.form}>
              <View style={styles.field}>
                <Text style={[styles.label, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.bold }]}>E-mail</Text>
                <TextInput
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect={false}
                  inputMode="email"
                  keyboardType="email-address"
                  onChangeText={setEmail}
                  placeholder="seu@email.com"
                  placeholderTextColor={theme.colors.text}
                  returnKeyType="next"
                  selectionColor={theme.colors.primary}
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.colors.input,
                      borderColor: errors.email ? theme.colors.danger : theme.colors.input,
                      color: theme.colors.inputText,
                      fontFamily: theme.typography.fontFamily.regular
                    }
                  ]}
                  value={email}
                />
                {errors.email ? (
                  <Text style={[styles.errorText, { color: theme.colors.danger, fontFamily: theme.typography.fontFamily.regular }]}>
                    {errors.email}
                  </Text>
                ) : null}
              </View>

              <View style={styles.field}>
                <Text style={[styles.label, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.bold }]}>Senha</Text>
                <View
                  style={[
                    styles.passwordInput,
                    {
                      backgroundColor: theme.colors.input,
                      borderColor: errors.password ? theme.colors.danger : theme.colors.input
                    }
                  ]}
                >
                  <TextInput
                    onChangeText={setPassword}
                    placeholder="••••••••"
                    placeholderTextColor={theme.colors.text}
                    returnKeyType="done"
                    secureTextEntry={!showPassword}
                    selectionColor={theme.colors.primary}
                    style={[styles.passwordTextInput, { color: theme.colors.inputText, fontFamily: theme.typography.fontFamily.regular }]}
                    value={password}
                  />
                  <Pressable accessibilityRole="button" hitSlop={10} onPress={() => setShowPassword((visible) => !visible)}>
                    <Text style={[styles.showPassword, { color: theme.colors.muted, fontFamily: theme.typography.fontFamily.bold }]}>
                      {showPassword ? "Ocultar" : "Mostrar"}
                    </Text>
                  </Pressable>
                </View>
                {errors.password ? (
                  <Text style={[styles.errorText, { color: theme.colors.danger, fontFamily: theme.typography.fontFamily.regular }]}>
                    {errors.password}
                  </Text>
                ) : null}
              </View>
            </View>

            <Button disabled={submitted && hasErrors} onPress={handleSubmit} style={styles.primaryButton} title="Entrar" />

            <View style={styles.dividerRow}>
              <View style={[styles.divider, { backgroundColor: productColors.brown }]} />
              <Text style={[styles.dividerText, { color: theme.colors.muted, fontFamily: theme.typography.fontFamily.regular }]}>
                ou continue com
              </Text>
              <View style={[styles.divider, { backgroundColor: productColors.brown }]} />
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={enterApp}
              style={({ pressed }) => [
                styles.googleButton,
                {
                  backgroundColor: theme.colors.input,
                  borderColor: productColors.brown,
                  opacity: pressed ? 0.86 : 1
                }
              ]}
            >
              <Text style={[styles.googleMark, { fontFamily: theme.typography.fontFamily.bold }]}>G</Text>
              <Text style={[styles.googleText, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.bold }]}>Entrar com Google</Text>
            </Pressable>
          </View>

          <View style={styles.footer}>
            <Text style={[styles.footerMuted, { color: theme.colors.muted, fontFamily: theme.typography.fontFamily.regular }]}>Não tem conta?</Text>
            <Pressable accessibilityRole="link" hitSlop={8} onPress={handleCreateAccount}>
              <Text style={[styles.footerLink, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.bold }]}>Criar conta</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1
  },
  keyboard: {
    flex: 1
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 32,
    paddingTop: 108,
    paddingBottom: 32
  },
  content: {
    flex: 1
  },
  brand: {
    fontSize: 34,
    lineHeight: 40,
    textAlign: "center",
    marginBottom: 66
  },
  form: {
    marginBottom: 36
  },
  field: {
    marginBottom: 20
  },
  label: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10
  },
  input: {
    minHeight: 60,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 22,
    fontSize: 15,
    lineHeight: 20
  },
  passwordInput: {
    minHeight: 60,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 22,
    paddingRight: 22
  },
  passwordTextInput: {
    flex: 1,
    minHeight: 58,
    paddingVertical: 0,
    fontSize: 15,
    lineHeight: 20
  },
  showPassword: {
    fontSize: 14,
    lineHeight: 18
  },
  errorText: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 6
  },
  primaryButton: {
    minHeight: 60,
    borderRadius: 14
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 48,
    marginBottom: 42
  },
  divider: {
    flex: 1,
    height: 1
  },
  dividerText: {
    fontSize: 12,
    lineHeight: 16,
    marginHorizontal: 18
  },
  googleButton: {
    minHeight: 62,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18
  },
  googleMark: {
    color: "#4285F4",
    fontSize: 21,
    lineHeight: 24,
    marginRight: 16
  },
  googleText: {
    fontSize: 16,
    lineHeight: 20
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 36
  },
  footerMuted: {
    fontSize: 14,
    lineHeight: 18,
    marginRight: 4
  },
  footerLink: {
    fontSize: 14,
    lineHeight: 18
  }
});
