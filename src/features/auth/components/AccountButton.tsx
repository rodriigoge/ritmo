import { Alert, Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../../../design-system/tokens/colors';
import { controls } from '../../../design-system/tokens/controls';
import { fontFamilies } from '../../../design-system/tokens/typography';
import { useAuth } from '../AuthProvider';
import { messageFor } from '../domain/AuthFailure';

const SIZE = 40;

/** Avatar with the user's initial; opens the account actions. */
export function AccountButton() {
  const { user, signOut } = useAuth();
  if (!user) return null;
  const initial = (user.name || user.email).trim().charAt(0).toUpperCase();

  function openAccount() {
    if (!user) return;
    Alert.alert(user.name, user.email, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair da conta',
        style: 'destructive',
        onPress: () => {
          signOut().catch((error) =>
            Alert.alert('Não foi possível sair', messageFor(error)),
          );
        },
      },
    ]);
  }

  return (
    <Pressable
      onPress={openAccount}
      accessibilityRole="button"
      accessibilityLabel="Conta"
      accessibilityHint="Mostra sua conta e a opção de sair"
      hitSlop={(controls.minTouchTarget - SIZE) / 2}
      style={({ pressed }) => [styles.avatar, pressed && styles.pressed]}
    >
      <Text style={styles.initial}>{initial}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {
    fontFamily: fontFamilies.bold,
    fontSize: 17,
    color: colors.onAction,
  },
  pressed: { opacity: controls.pressedOpacity },
});
