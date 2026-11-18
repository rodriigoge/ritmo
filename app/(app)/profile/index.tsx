import { useRouter } from 'expo-router';
import { useHabitTransfer } from '../../../src/features/habits/transfer/useHabitTransfer';
import { ProfileScreen } from '../../../src/features/profile/components/ProfileScreen';

export default function ProfileRoute() {
  const router = useRouter();
  const transfer = useHabitTransfer();
  return (
    <>
      <ProfileScreen
        onBack={() => router.back()}
        onEditProfile={() => router.push('/profile/edit')}
        onDeleteAccount={() => router.push('/profile/delete')}
        onTheme={() => router.push('/profile/theme')}
        onNotifications={() => router.push('/profile/notifications')}
        onExport={transfer.startExport}
        onImport={() => {
          void transfer.startImport();
        }}
        dataBusy={transfer.working}
        dataMessage={transfer.message}
      />
      {transfer.sheets}
    </>
  );
}
