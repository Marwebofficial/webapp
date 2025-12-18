export type DataPlan = {
  id: string;
  label: string;
  validity?: string;
  data_id?: string; // Adding the data_id field to the type
  provider?: string;
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
    { id: 'mtn-500mb-1d', label: '500MB', validity: '1 Day' },
    { id: 'mtn-1gb-1d', label: '1GB', validity: '1 Day' },
    { id: 'mtn-1.5gb-2d', label: '1.5GB', validity: '2 Days' },
    { id: 'mtn-3.2gb-2d', label: '3.2GB', validity: '2 Days' },
    { id: 'mtn-1gb-7d', label: '1GB', validity: '7 Days' },
    { id: 'mtn-3.5gb-30d', label: '3.5GB', validity: '30 Days' },
    { id: 'mtn-10gb-30d', label: '10GB', validity: '30 Days' },
    { id: 'mtn-40gb-60d', label: '40GB', validity: '60 Days' },
  ],
  airtel: [
    { id: 'airtel-1gb-3d', label: '1GB', validity: '3 Days' },
    { id: 'airtel-3gb-7d', label: '3GB', validity: '7 Days' },
    { id: 'airtel-7gb-7d', label: '7GB', validity: '7 Days' },
    { id: 'airtel-10gb-30d', label: '10GB', validity: '30 Days' },
  ],
  glo: [
    { id: 'glo-750mb-1d', label: '750MB', validity: '1 Day' },
    { id: 'glo-1.5gb-1d', label: '1.5GB', validity: '1 Day' },
    { id: 'glo-2.5gb-2d', label: '2.5GB', validity: '2 Days' },
    { id: 'glo-10gb-30d', label: '10GB', validity: '30 Days' },
  ],
  '9mobile': [
    { id: '9mobile-500mb-30d', label: '500MB', validity: '30 Days' },
    { id: '9mobile-1gb-30d', label: '1GB', validity: '30 Days' },
    { id: '9mobile-1.5gb-30d', label: '1.5GB', validity: '30 Days' },
    { id: '9mobile-2gb-30d', label: '2GB', validity: '30 Days' },
    { id: '9mobile-3gb-30d', label: '3GB', validity: '30 Days' },
    { id: '9mobile-4gb-30d', label: '4GB', validity: '30 Days' },
    { id: '9mobile-5gb-30d', label: '5GB', validity: '30 Days' },
    { id: '9mobile-10gb-30d', label: '10GB', validity: '30 Days' },
  ],
};
