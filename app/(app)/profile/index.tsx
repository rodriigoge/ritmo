import { useRouter } from 'expo-router';
import { ProfileScreen } from '../../../src/features/profile/components/ProfileScreen';

export default function ProfileRoute() {
  const router = useRouter();
  return (
    <ProfileScreen
      onBack={() => router.back()}
      onEditProfile={() => router.push('/profile/edit')}
      onDeleteAccount={() => router.push('/profile/delete')}
    />
  );
}
