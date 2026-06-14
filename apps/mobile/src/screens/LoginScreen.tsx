import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useMemo, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

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

function GoogleIcon() {
  return (
    <Svg accessibilityElementsHidden height={22} style={styles.googleIcon} viewBox="0 0 48 48" width={22}>
      <Path
        d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.223 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
        fill="#FFC107"
      />
      <Path
        d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
        fill="#FF3D00"
      />
      <Path
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
        fill="#4CAF50"
      />
      <Path
        d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
        fill="#1976D2"
      />
    </Svg>
  );
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
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboard}>
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
                  placeholderTextColor={theme.colors.subtle}
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
                    autoCapitalize="none"
                    autoCorrect={false}
                    onChangeText={setPassword}
                    placeholder="Digite sua senha"
                    placeholderTextColor={theme.colors.subtle}
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

            <Button
              disabled={submitted && hasErrors}
              onPress={handleSubmit}
              style={styles.primaryButton}
              title="Entrar"
              titleStyle={styles.primaryButtonText}
            />

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
              <GoogleIcon />
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
    fontSize: 16,
    lineHeight: 22
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
    height: 58,
    paddingVertical: 0,
    fontSize: 16,
    lineHeight: 22
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
  primaryButtonText: {
    fontSize: 18,
    lineHeight: 24
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
  googleIcon: {
    marginRight: 14
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
