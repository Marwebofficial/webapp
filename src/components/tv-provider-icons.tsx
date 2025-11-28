
import type { SVGProps } from 'react';

const DstvIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg" {...props}>
        <rect width="256" height="256" fill="none"/>
        <path d="M48,88a48,48,0,0,1,48-48h80a48,48,0,0,1,48,48v80a48,48,0,0,1-48,48H96a48,48,0,0,1-48-48Z" opacity="0.2"/>
        <path d="M48,88a48,48,0,0,1,48-48h80a48,48,0,0,1,48,48v80a48,48,0,0,1-48,48H96a48,48,0,0,1-48-48Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/>
        <path d="M152,104a24,24,0,0,1-24,24,23.8,23.8,0,0,1-17.4-8.3" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/>
        <path d="M152,152a24,24,0,0,1-24-24,23.8,23.8,0,0,1-17.4,8.3" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/>
        <line x1="128" y1="128" x2="152" y2="128" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/>
        <line x1="110.6" y1="144.3" x2="110.6" y2="111.7" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/>
    </svg>
);


const GotvIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.21 15.33c-.4.4-.92.6-1.54.6-1.3 0-2.31-1.01-2.31-2.31 0-.62.2-1.14.6-1.54.83-.83 2.2-.83 3.03 0 .4.4.6.92.6 1.54 0 1.3-1.01 2.31-2.31 2.31zm3.03-3.03c-.4-.4-.92-.6-1.54-.6-1.3 0-2.31-1.01-2.31-2.31 0-.62.2-1.14.6-1.54.83-.83 2.2-.83 3.03 0 .4.4.6.92.6 1.54 0 1.3-1.01 2.31-2.31 2.31zm3.03-3.03c-.4-.4-.92-.6-1.54-.6-1.3 0-2.31-1.01-2.31-2.31 0-.62.2-1.14.6-1.54C14.71 7.2 16.08 7.2 16.9 8c.4.4.6.92.6 1.54 0 1.3-1.01 2.31-2.31 2.31z" fill="currentColor"/>
    </svg>
);


const StartimesIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M12 2.1l2.45 5.5L20 8.1l-4.5 4.1L16.9 18 12 15.4 7.1 18l1.4-5.8L4 8.1l5.55-.5L12 2.1M12 5.27l-1.47 3.32-3.66.42 2.7 2.47-.8 3.63L12 13.3l3.23 1.81-.8-3.63 2.7-2.47-3.66-.42L12 5.27z" fill="currentColor"/>
        <path d="M0 0h24v24H0z" fill="none"/>
    </svg>
);


const icons = {
  dstv: DstvIcon,
  gotv: GotvIcon,
  startimes: StartimesIcon,
};

type TvProviderId = keyof typeof icons;

interface TvProviderIconProps extends SVGProps<SVGSVGElement> {
  provider: TvProviderId;
}

export const TvProviderIcon = ({ provider, ...props }: TvProviderIconProps) => {
  const IconComponent = icons[provider];
  if (!IconComponent) return null;
  return <IconComponent {...props} />;
};
