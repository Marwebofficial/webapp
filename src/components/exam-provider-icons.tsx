
import type { SVGProps } from 'react';

const WaecIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <rect width="24" height="24" rx="4" fill="#006633" />
        <path d="M6 8L10 16L14 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16 16L18 12L16 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);


const NecoIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <rect width="24" height="24" rx="4" fill="#0D47A1" />
        <path d="M6 16V8L10 16V8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" stroke="white" strokeWidth="2"/>
        <path d="M18 16C20.2091 16 22 14.2091 22 12C22 9.79086 20.2091 8 18 8C15.7909 8 14 9.79086 14 12C14 14.2091 15.7909 16 18 16Z" stroke="white" strokeWidth="2" transform="translate(-2, 0)"/>
    </svg>
);


const icons = {
  waec: WaecIcon,
  neco: NecoIcon,
};

type ExamProviderId = keyof typeof icons;

interface ExamProviderIconProps extends SVGProps<SVGSVGElement> {
  provider: ExamProviderId;
}

export const ExamProviderIcon = ({ provider, ...props }: ExamProviderIconProps) => {
  const IconComponent = icons[provider];
  if (!IconComponent) return null;
  return <IconComponent {...props} />;
};
