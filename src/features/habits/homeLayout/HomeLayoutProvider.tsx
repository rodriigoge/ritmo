import Storage from 'expo-sqlite/kv-store';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

/** How habit cards look on the Home. */
export type HomeLayout = 'default' | 'minimal';

export const HOME_LAYOUT_LABELS: Record<HomeLayout, string> = {
  default: 'Padrão',
  minimal: 'Minimalista',
};

const LAYOUT_KEY = 'ritmo.homeLayout';

// Saved on the device, like the theme: it is a viewing preference.
function readHomeLayout(): HomeLayout {
  try {
    return Storage.getItemSync(LAYOUT_KEY) === 'minimal'
      ? 'minimal'
      : 'default';
  } catch {
    return 'default';
  }
}

function saveHomeLayout(layout: HomeLayout): void {
  try {
    Storage.setItemSync(LAYOUT_KEY, layout);
  } catch {
    // Not persisting only means the Home opens in the default layout.
  }
}

type HomeLayoutState = {
  layout: HomeLayout;
  setLayout: (layout: HomeLayout) => void;
};

// Without a provider (tests, previews) the Home uses the default layout.
const HomeLayoutContext = createContext<HomeLayoutState>({
  layout: 'default',
  setLayout: () => {},
});

export function HomeLayoutProvider({ children }: { children: ReactNode }) {
  const [layout, setStored] = useState<HomeLayout>(readHomeLayout);
  const setLayout = useCallback((next: HomeLayout) => {
    setStored(next);
    saveHomeLayout(next);
  }, []);
  const value = useMemo(() => ({ layout, setLayout }), [layout, setLayout]);
  return (
    <HomeLayoutContext.Provider value={value}>
      {children}
    </HomeLayoutContext.Provider>
  );
}

export function useHomeLayout(): HomeLayoutState {
  return useContext(HomeLayoutContext);
}
