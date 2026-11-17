import { useRouter } from 'expo-router';
import { DeleteAccountScreen } from '../../../src/features/profile/components/DeleteAccountScreen';

export default function DeleteAccountRoute() {
  const router = useRouter();
  return <DeleteAccountScreen onBack={() => router.back()} />;
}
