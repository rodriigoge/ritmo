import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../../design-system/tokens/colors';
import { controls } from '../../../design-system/tokens/controls';
import { fontFamilies } from '../../../design-system/tokens/typography';
import type { AuthUser } from '../AuthService';

/** The Google photo when there is one, otherwise the user's initial. */
export function UserAvatar({ user, size }: { user: AuthUser; size: number }) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const photo = user.avatarUrl && user.avatarUrl !== failedUrl;
  const initial = (user.name || user.email).trim().charAt(0).toUpperCase();
  const frame = { width: size, height: size, borderRadius: size / 2 };
  return (
    <View
      style={[styles.frame, frame]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {photo ? (
        <Image
          testID="user-avatar-photo"
          source={{ uri: user.avatarUrl! }}
          style={frame}
          onError={() => setFailedUrl(user.avatarUrl)}
        />
      ) : (
        <Text style={[styles.initial, { fontSize: size * 0.42 }]}>
          {initial}
        </Text>
      )}
    </View>
  );
}

const BUTTON_SIZE = 44;

/** Avatar in the top bar that opens the profile. */
export function ProfileButton({
  user,
  onPress,
}: {
  user: AuthUser;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Perfil"
      accessibilityHint="Abre seu perfil e as opções da conta"
      hitSlop={(controls.minTouchTarget - BUTTON_SIZE) / 2}
      style={({ pressed }) => pressed && styles.pressed}
    >
      <UserAvatar user={user} size={BUTTON_SIZE} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  frame: {
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  initial: { fontFamily: fontFamilies.bold, color: colors.onAction },
  pressed: { opacity: controls.pressedOpacity },
});
