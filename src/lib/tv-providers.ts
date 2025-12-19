
export const tvProviders = [
  { id: 'dstv', name: 'DStv' },
  { id: 'gotv', name: 'GOtv' },
  { id: 'startimes', name: 'Startimes' },
];

export const tvPlans = {
  dstv: [
    { id: 'dstv-padi', name: 'DStv Padi', amount: 1850 },
    { id: 'dstv-yanga', name: 'DStv Yanga', amount: 2500 },
    { id: 'dstv-confam', name: 'DStv Confam', amount: 4500 },
  ],
  gotv: [
    { id: 'gotv-smallie', name: 'GOtv Smallie', amount: 800 },
    { id: 'gotv-jinja', name: 'GOtv Jinja', amount: 1640 },
    { id: 'gotv-joll', name: 'GOtv Jolli', amount: 2460 },
  ],
  startimes: [
    { id: 'startimes-nova', name: 'Startimes Nova', amount: 900 },
    { id: 'startimes-basic', name: 'Startimes Basic', amount: 1700 },
    { id: 'startimes-smart', name: 'Startimes Smart', amount: 2200 },
  ],
};
