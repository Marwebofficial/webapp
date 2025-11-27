import type { SVGProps } from 'react';

const MtnIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <rect width="100" height="100" rx="20" fill="#FFCC00" />
        <path d="M25 75V25L50 58.3333L75 25V75H62.5V41.6667L50 60.4167L37.5 41.6667V75H25Z" fill="#0053A0" />
    </svg>
);

const AirtelIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <rect width="100" height="100" rx="20" fill="#E40000"/>
        <path d="M50 25C36.1929 25 25 36.1929 25 50C25 58.0191 27.8892 65.0451 32.7507 69.4319L50 43.3333L67.2493 69.4319C72.1108 65.0451 75 58.0191 75 50C75 36.1929 63.8071 25 50 25ZM50 31.25C57.5964 31.25 63.75 37.4036 63.75 45V45C63.75 48.0125 62.1531 50.7292 59.7708 52.3438L50 37.5L40.2292 52.3438C37.8469 50.7292 36.25 48.0125 36.25 45V45C36.25 37.4036 42.4036 31.25 50 31.25Z" fill="white"/>
    </svg>
);


const GloIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <rect width="100" height="100" rx="20" fill="#4CAF50" />
        <path d="M50 25C36.1929 25 25 36.1929 25 50C25 63.8071 36.1929 75 50 75C63.8071 75 75 63.8071 75 50C75 36.1929 63.8071 25 50 25ZM50 68.75C40.7563 68.75 33.125 61.2437 31.25 52.5H43.75V58.75H56.25V52.5H68.75C66.875 61.2437 59.2437 68.75 50 68.75ZM68.75 47.5H31.25C33.125 38.7563 40.7563 31.25 50 31.25C59.2437 31.25 66.875 38.7563 68.75 47.5Z" fill="white"/>
    </svg>
);

const NineMobileIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path fillRule="evenodd" clipRule="evenodd" d="M11.64 18.23C13.88 18.23 16.03 17.65 17.93 16.59C17.16 14.61 15.7 12.98 13.79 11.93C15.7 10.88 17.16 9.25 17.93 7.27C16.03 6.21 13.88 5.63 11.64 5.63C9.4 5.63 7.25 6.21 5.35 7.27C6.12 9.25 7.58 10.88 9.49 11.93C7.58 12.98 6.12 14.61 5.35 16.59C7.25 17.65 9.4 18.23 11.64 18.23ZM11.64 21.84C5.21 21.84 0 16.63 0 10.2C0 3.77 5.21 -1.44 11.64 -1.44C18.07 -1.44 23.28 3.77 23.28 10.2C23.28 16.63 18.07 21.84 11.64 21.84Z" transform="translate(0 2.6)" fill="#231F20"/>
    </svg>
);

const icons = {
  mtn: MtnIcon,
  airtel: AirtelIcon,
  glo: GloIcon,
  '9mobile': NineMobileIcon,
};

type NetworkId = keyof typeof icons;

interface NetworkIconProps extends SVGProps<SVGSVGElement> {
  network: NetworkId;
}

export const NetworkIcon = ({ network, ...props }: NetworkIconProps) => {
  const IconComponent = icons[network];
  if (!IconComponent) return null;
  return <IconComponent {...props} />;
};
