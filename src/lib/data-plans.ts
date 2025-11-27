export type DataPlan = {
  id: string;
  label: string;
  price: number;
};

export type Network = 'mtn' | 'airtel' | 'glo' | '9mobile';

export const networkProviders: {
  id: Network;
  name: string;
}[] = [
  { id: 'mtn', name: 'MTN' },
  { id: 'airtel', name: 'Airtel' },
  { id: 'glo', name: 'Glo' },
  { id: '9mobile', name: '9mobile' },
];

export const dataPlans: Record<Network, DataPlan[]> = {
  mtn: [
    { id: 'mtn-1gb', label: '1GB', price: 200 },
    { id: 'mtn-2gb', label: '2GB', price: 400 },
    { id: 'mtn-5gb', label: '5GB', price: 1000 },
    { id: 'mtn-10gb', label: '10GB', price: 2000 },
    { id: 'mtn-15gb', label: '15GB', price: 3000 },
    { id: 'mtn-20gb', label: '20GB', price: 4000 },
  ],
  airtel: [
    { id: 'airtel-750mb', label: '750MB', price: 250 },
    { id: 'airtel-1.5gb', label: '1.5GB', price: 500 },
    { id: 'airtel-3gb', label: '3GB', price: 700 },
    { id: 'airtel-6gb', label: '6GB', price: 1400 },
    { id: 'airtel-10gb', label: '10GB', price: 2500 },
    { id: 'airtel-20gb', label: '20GB', price: 4500 },
  ],
  glo: [
    { id: 'glo-1.5gb', label: '1.5GB', price: 200 },
    { id: 'glo-4gb', label: '4GB', price: 500 },
    { id: 'glo-10gb', label: '10GB', price: 1000 },
    { id: 'glo-15gb', label: '15GB', price: 1500 },
    { id: 'glo-25gb', label: '25GB', price: 2500 },
    { id: 'glo-50gb', label: '50GB', price: 4800 },
  ],
  '9mobile': [
    { id: '9mobile-1gb', label: '1GB', price: 200 },
    { id: '9mobile-2.5gb', label: '2.5GB', price: 450 },
    { id: '9mobile-7gb', label: '7GB', price: 1300 },
    { id: '9mobile-15gb', label: '15GB', price: 2800 },
    { id: '9mobile-40gb', label: '40GB', price: 5000 },
    { id: '9mobile-100gb', label: '100GB', price: 9500 },
  ],
};
