import { Store } from 'react-stores';

interface NetState {
  net: string;
}

export const $net = new Store<NetState>({
  net: 'mainnet',
});
