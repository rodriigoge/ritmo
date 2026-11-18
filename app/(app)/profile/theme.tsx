import { useRouter } from 'expo-router';
import { ThemeScreen } from '../../../src/features/profile/components/ThemeScreen';

export default function ThemeRoute() {
  const router = useRouter();
  return <ThemeScreen onBack={() => router.back()} />;
}
