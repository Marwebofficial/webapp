'use client';

import { usePathname } from 'next/navigation';
import AboutSection from '@/components/about-section';

export function ConditionalAboutSection() {
  const pathname = usePathname();

  if (pathname !== '/') {
    return null;
  }

  return <AboutSection />;
}
