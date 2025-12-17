'use client';

import { usePathname } from 'next/navigation';
import AboutSection from '@/components/about-section';

export function ConditionalAboutSection() {
  const pathname = usePathname();

  if (pathname.startsWith('/admin') || pathname.startsWith('/account')) {
    return null;
  }

  return <AboutSection />;
}
