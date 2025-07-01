import { Store } from 'react-stores';

export enum Themes {
  Light = 'light',
  Dark = 'dark',
}

interface SettingsState {
  theme: Themes;
}

export const $settings = new Store<SettingsState>({
  theme: Themes.Light,
});

export function updateSettingsStore(newState: SettingsState) {
  $settings.setState(newState);
}
