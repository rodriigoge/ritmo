import { useRouter } from 'expo-router';
import { EditProfileScreen } from '../../../src/features/profile/components/EditProfileScreen';

export default function EditProfileRoute() {
  const router = useRouter();
  return (
    <EditProfileScreen
      onBack={() => router.back()}
      onSaved={() => router.back()}
    />
  );
}
