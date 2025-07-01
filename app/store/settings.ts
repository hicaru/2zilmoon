import { Store } from 'react-stores';

export enum Themes {
  Light = 'light',
  Dark = 'dark',
}

interface SettingsState {
  theme: Themes;
}

const getInitialTheme = (): Themes => {
  if (typeof window !== 'undefined') {
    const savedTheme = window.localStorage.getItem('theme') as Themes;
    if (savedTheme && Object.values(Themes).includes(savedTheme)) {
      return savedTheme;
    }
    // Проверяем системную тему
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return Themes.Dark;
    }
  }
  return Themes.Light;
};

export const $settings = new Store<SettingsState>({
  theme: getInitialTheme(),
});

export function updateSettingsStore(newState: SettingsState) {
  $settings.setState(newState);
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('theme', newState.theme);
    document.documentElement.setAttribute('data-theme', newState.theme);
  }
}

export function initTheme() {
  if (typeof window !== 'undefined') {
    const theme = getInitialTheme();
    $settings.setState({ theme });
    document.documentElement.setAttribute('data-theme', theme);
  }
}

