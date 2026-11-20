import { fireEvent, render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import {
  ThemeProvider,
  useTheme,
} from '../src/design-system/theme/ThemeProvider';
import { darkColors, lightColors } from '../src/design-system/tokens/colors';
import { ProfileScreen } from '../src/features/profile/components/ProfileScreen';
import { ThemeScreen } from '../src/features/profile/components/ThemeScreen';
import { TestAuth } from './support/TestAuth';

const mockStore = new Map<string, string>();
jest.mock('expo-sqlite/kv-store', () => ({
  __esModule: true,
  default: {
    getItemSync: (key: string) => mockStore.get(key) ?? null,
    setItemSync: (key: string, value: string) => mockStore.set(key, value),
  },
}));

function Probe() {
  const { scheme, colors } = useTheme();
  return (
    <Text testID="probe">
      {scheme}:{colors === darkColors ? 'dark' : 'light'}
    </Text>
  );
}

describe('Themes', () => {
  beforeEach(() => mockStore.clear());

  it('switches to dark, saves the choice and restores it on the next launch', async () => {
    await render(
      <ThemeProvider>
        <ThemeScreen onBack={jest.fn()} />
        <Probe />
      </ThemeProvider>,
    );
    expect(screen.getByRole('radio', { name: 'Sistema' })).toBeChecked();
    expect(screen.getByTestId('probe')).toHaveTextContent('light:light');

    await fireEvent.press(screen.getByRole('radio', { name: 'Escuro' }));
    expect(screen.getByRole('radio', { name: 'Escuro' })).toBeChecked();
    expect(screen.getByTestId('probe')).toHaveTextContent('dark:dark');
    expect(mockStore.get('ritmo.theme')).toBe('dark');

    await screen.unmount();
    await render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('probe')).toHaveTextContent('dark:dark');
  });

  it('ignores a corrupted stored value', async () => {
    mockStore.set('ritmo.theme', 'roxo');
    await render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('probe')).toHaveTextContent('light:light');
  });

  it('keeps every palette role in both themes', () => {
    expect(Object.keys(darkColors).sort()).toEqual(
      Object.keys(lightColors).sort(),
    );
  });
});

describe('Profile data options', () => {
  it('shows the theme, export and import options', async () => {
    const onTheme = jest.fn();
    const onExport = jest.fn();
    const onImport = jest.fn();
    await render(
      <TestAuth>
        <ProfileScreen
          onBack={jest.fn()}
          onEditProfile={jest.fn()}
          onDeleteAccount={jest.fn()}
          onTheme={onTheme}
          onHomeLayout={jest.fn()}
          onNotifications={jest.fn()}
          onExport={onExport}
          onImport={onImport}
          dataMessage={{
            tone: 'info',
            text: 'Importação concluída: 2 dias adicionados.',
          }}
        />
      </TestAuth>,
    );
    await fireEvent.press(
      screen.getByRole('button', { name: 'Temas, Sistema' }),
    );
    await fireEvent.press(
      screen.getByRole('button', { name: 'Exportar hábitos, JSON ou CSV' }),
    );
    await fireEvent.press(
      screen.getByRole('button', { name: 'Importar hábitos' }),
    );
    expect(onTheme).toHaveBeenCalled();
    expect(onExport).toHaveBeenCalled();
    expect(onImport).toHaveBeenCalled();
    expect(
      screen.getByText('Importação concluída: 2 dias adicionados.'),
    ).toBeOnTheScreen();
  });
});
