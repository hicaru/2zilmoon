import createStore from 'react-stores';

export type Tx = {
  hash: string;
  confirmed: boolean;
  error: boolean;
};

export type Txs = {
  transactions: Tx[];
};

const initState: Txs = {
  transactions: [],
};

export const $transactions = createStore(initState);

export function updateTransactions(key: string, transactions: Tx[]) {
  const state = $transactions.state;
  state.transactions = transactions;
  $transactions.setState(state);
  window.localStorage.setItem(key, JSON.stringify(state));
}
