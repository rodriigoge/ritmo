import { useRouter } from 'expo-router';
import { NotificationsScreen } from '../../../src/features/reminders/NotificationsScreen';

export default function NotificationsRoute() {
  const router = useRouter();
  return <NotificationsScreen onBack={() => router.back()} />;
}
