import { useRouter } from 'expo-router';
import { HomeLayoutScreen } from '../../../src/features/profile/components/HomeLayoutScreen';

export default function HomeLayoutRoute() {
  const router = useRouter();
  return <HomeLayoutScreen onBack={() => router.back()} />;
}
