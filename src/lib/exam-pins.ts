
export type ExamPin = {
  id: string;
  label: string;
  price: number;
};

export type ExamPinProviderId = 'waec' | 'neco';

export const examPinProviders: {
  id: ExamPinProviderId;
  name: string;
}[] = [
  { id: 'waec', name: 'WAEC' },
  { id: 'neco', name: 'NECO' },
];
