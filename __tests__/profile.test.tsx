import { fireEvent, render, screen } from '@testing-library/react-native';
import HomeScreen from '../app/(app)/index';
import { AuthFailure } from '../src/features/auth/domain/AuthFailure';
import { HabitsProvider } from '../src/features/habits/hooks/useHabits';
import { DeleteAccountScreen } from '../src/features/profile/components/DeleteAccountScreen';
import { EditProfileScreen } from '../src/features/profile/components/EditProfileScreen';
import { ProfileScreen } from '../src/features/profile/components/ProfileScreen';
import { InMemoryHabitRepository } from './support/InMemoryHabitRepository';
import { createAuthService, TestAuth } from './support/TestAuth';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }) }));

const PHOTO = 'https://lh3.googleusercontent.com/a/photo=s256-c';

describe('Home header', () => {
  beforeEach(() => {
    mockPush.mockClear();
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 10, 17, 12));
  });
  afterEach(() => jest.useRealTimers());

  async function renderHome(
    repository: InMemoryHabitRepository,
    photo?: string,
  ) {
    await render(
      <TestAuth avatarUrl={photo ?? null}>
        <HabitsProvider repository={repository}>
          <HomeScreen />
        </HabitsProvider>
      </TestAuth>,
    );
  }

  it('greets the user and opens the profile from the avatar', async () => {
    await renderHome(new InMemoryHabitRepository());
    expect(await screen.findByText('Olá, Ana')).toBeOnTheScreen();
    expect(
      screen.getByText('A', { includeHiddenElements: true }),
    ).toBeOnTheScreen();
    expect(
      screen.queryByTestId('user-avatar-photo', {
        includeHiddenElements: true,
      }),
    ).toBeNull();
    await fireEvent.press(screen.getByRole('button', { name: 'Perfil' }));
    expect(mockPush).toHaveBeenCalledWith('/profile');
  });

  it('shows the Google photo when there is one', async () => {
    await renderHome(new InMemoryHabitRepository(), PHOTO);
    expect(
      await screen.findByTestId('user-avatar-photo', {
        includeHiddenElements: true,
      }),
    ).toHaveProp('source', { uri: PHOTO });
  });

  it('shows Pingo with an invitation when there are no habits', async () => {
    await renderHome(new InMemoryHabitRepository());
    expect(
      await screen.findByRole('header', { name: 'Nenhum hábito ainda' }),
    ).toBeOnTheScreen();
    expect(screen.getByText(/Comece com algo pequeno/)).toBeOnTheScreen();
    expect(screen.queryByRole('progressbar')).toBeNull();
  });

  it('summarizes how many habits were done today', async () => {
    const repository = new InMemoryHabitRepository();
    const water = await repository.create({ name: 'Beber água' });
    await repository.create({ name: 'Ler' });
    await repository.toggleCompletion(water.id, '2026-11-17');
    await renderHome(repository);
    expect(
      await screen.findByLabelText('1 de 2 hábitos feitos hoje'),
    ).toBeOnTheScreen();
  });
});

describe('Profile', () => {
  it('shows the user and routes to each option', async () => {
    const onEditProfile = jest.fn();
    const onDeleteAccount = jest.fn();
    await render(
      <TestAuth>
        <ProfileScreen
          onBack={jest.fn()}
          onEditProfile={onEditProfile}
          onDeleteAccount={onDeleteAccount}
        />
      </TestAuth>,
    );
    expect(screen.getByText('Ana')).toBeOnTheScreen();
    expect(screen.getByText('ana@exemplo.com')).toBeOnTheScreen();
    await fireEvent.press(
      screen.getByRole('button', { name: 'Editar perfil' }),
    );
    expect(onEditProfile).toHaveBeenCalled();
    await fireEvent.press(
      screen.getByRole('button', { name: 'Excluir conta' }),
    );
    expect(onDeleteAccount).toHaveBeenCalled();
  });

  it('signs out, and shows the error when it fails', async () => {
    const service = createAuthService({
      signOut: jest
        .fn()
        .mockRejectedValueOnce(new AuthFailure('Sem conexão.'))
        .mockResolvedValueOnce(undefined),
    });
    await render(
      <TestAuth service={service}>
        <ProfileScreen
          onBack={jest.fn()}
          onEditProfile={jest.fn()}
          onDeleteAccount={jest.fn()}
        />
      </TestAuth>,
    );
    const button = screen.getByRole('button', { name: 'Sair da conta' });
    await fireEvent.press(button);
    expect(await screen.findByRole('alert')).toHaveTextContent('Sem conexão.');
    await fireEvent.press(button);
    expect(service.signOut).toHaveBeenCalledTimes(2);
  });

  it('saves a new trimmed name', async () => {
    const service = createAuthService();
    const onSaved = jest.fn();
    await render(
      <TestAuth service={service}>
        <EditProfileScreen onBack={jest.fn()} onSaved={onSaved} />
      </TestAuth>,
    );
    const save = screen.getByRole('button', { name: 'Salvar' });
    expect(save).toBeDisabled();

    await fireEvent.changeText(screen.getByLabelText('Nome'), '   ');
    await fireEvent.press(save);
    expect(screen.getByText('Informe como podemos te chamar.')).toBeTruthy();
    expect(service.updateProfile).not.toHaveBeenCalled();

    await fireEvent.changeText(screen.getByLabelText('Nome'), ' Ana Lima ');
    await fireEvent.press(save);
    expect(service.updateProfile).toHaveBeenCalledWith({ name: ' Ana Lima ' });
    expect(onSaved).toHaveBeenCalled();
    expect(screen.getByLabelText('E-mail')).toHaveDisplayValue(
      'ana@exemplo.com',
    );
  });

  it('deletes the account only from the explicit button', async () => {
    const service = createAuthService({
      deleteAccount: jest
        .fn()
        .mockRejectedValueOnce(
          new AuthFailure(
            'Não foi possível excluir sua conta agora. Tente novamente.',
          ),
        )
        .mockResolvedValueOnce(undefined),
    });
    const onBack = jest.fn();
    await render(
      <TestAuth service={service}>
        <DeleteAccountScreen onBack={onBack} />
      </TestAuth>,
    );
    await fireEvent.press(
      screen.getByRole('button', { name: 'Manter minha conta' }),
    );
    expect(onBack).toHaveBeenCalled();
    expect(service.deleteAccount).not.toHaveBeenCalled();

    const destroy = screen.getByRole('button', {
      name: 'Excluir minha conta',
    });
    await fireEvent.press(destroy);
    expect(await screen.findByRole('alert')).toHaveTextContent(
      /Não foi possível excluir sua conta agora/,
    );
    await fireEvent.press(destroy);
    expect(service.deleteAccount).toHaveBeenCalledTimes(2);
  });
});
