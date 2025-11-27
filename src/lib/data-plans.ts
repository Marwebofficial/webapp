export type DataPlan = {
  id: string;
  label: string;
  price: number;
  validity?: string;
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
    { id: 'mtn-500mb-1d', label: '500MB', price: 400, validity: '1 Day' },
    { id: 'mtn-1gb-1d', label: '1GB', price: 530, validity: '1 Day' },
    { id: 'mtn-1.5gb-2d', label: '1.5GB', price: 630, validity: '2 Days' },
    { id: 'mtn-3.2gb-2d', label: '3.2GB', price: 1050, validity: '2 Days' },
    { id: 'mtn-1gb-7d', label: '1GB', price: 820, validity: '7 Days' },
    { id: 'mtn-3.5gb-30d', label: '3.5GB', price: 2700, validity: '30 Days' },
    { id: 'mtn-10gb-30d', label: '10GB', price: 4600, validity: '30 Days' },
    { id: 'mtn-40gb-60d', label: '40GB', price: 9700, validity: '60 Days' },
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
    { id: 'glo-750mb-1d', label: '750MB', price: 270, validity: '1 Day' },
    { id: 'glo-1.5gb-1d', label: '1.5GB', price: 360, validity: '1 Day' },
    { id: 'glo-2.5gb-2d', label: '2.5GB', price: 570, validity: '2 Days' },
    { id: 'glo-10gb-30d', label: '10GB', price: 2700, validity: '30 Days' },
  ],
  '9mobile': [
    { id: '9mobile-500mb-30d', label: '500MB', price: 210, validity: '30 Days' },
    { id: '9mobile-1gb-30d', label: '1GB', price: 365, validity: '30 Days' },
    { id: '9mobile-1.5gb-30d', label: '1.5GB', price: 550, validity: '30 Days' },
    { id: '9mobile-2gb-30d', label: '2GB', price: 670, validity: '30 Days' },
    { id: '9mobile-3gb-30d', label: '3GB', price: 995, validity: '30 Days' },
    { id: '9mobile-4gb-30d', label: '4GB', price: 1400, validity: '30 Days' },
    { id: '9mobile-5gb-30d', label: '5GB', price: 1800, validity: '30 Days' },
    { id: '9mobile-10gb-30d', label: '10GB', price: 3500, validity: '30 Days' },
  ],
};
