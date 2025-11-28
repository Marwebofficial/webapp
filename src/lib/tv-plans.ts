
export type TvPlan = {
  id: string;
  label: string;
  price: number;
};

export type TvProviderId = 'dstv' | 'gotv' | 'startimes';

export const tvProviders: {
  id: TvProviderId;
  name: string;
}[] = [
  { id: 'dstv', name: 'DStv' },
  { id: 'gotv', name: 'GOtv' },
  { id: 'startimes', name: 'StarTimes' },
];

export const tvPlans: Record<TvProviderId, TvPlan[]> = {
  dstv: [
    { id: 'dstv-padi', label: 'Padi', price: 2950 },
    { id: 'dstv-yanga', label: 'Yanga', price: 5100 },
    { id: 'dstv-confam', label: 'Confam', price: 9300 },
    { id: 'dstv-compact', label: 'Compact', price: 15700 },
    { id: 'dstv-compact-plus', label: 'Compact Plus', price: 25000 },
    { id: 'dstv-premium', label: 'Premium', price: 37000 },
  ],
  gotv: [
    { id: 'gotv-smallie', label: 'Smallie', price: 1300 },
    { id: 'gotv-jinja', label: 'Jinja', price: 2700 },
    { id: 'gotv-jolli', label: 'Jolli', price: 3950 },
    { id: 'gotv-max', label: 'Max', price: 5700 },
    { id: 'gotv-supa', label: 'Supa', price: 7600 },
  ],
  startimes: [
    { id: 'startimes-nova', label: 'Nova (Daily)', price: 90 },
    { id: 'startimes-basic', label: 'Basic (Daily)', price: 160 },
    { id: 'startimes-smart', label: 'Smart (Daily)', price: 200 },
    { id: 'startimes-nova-w', label: 'Nova (Weekly)', price: 300 },
    { id: 'startimes-basic-w', label: 'Basic (Weekly)', price: 600 },
    { id: 'startimes-smart-w', label: 'Smart (Weekly)', price: 700 },
    { id: 'startimes-nova-m', label: 'Nova (Monthly)', price: 900 },
    { id: 'startimes-basic-m', label: 'Basic (Monthly)', price: 1850 },
    { id: 'startimes-smart-m', label: 'Smart (Monthly)', price: 2600 },
  ],
};
