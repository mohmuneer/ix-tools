'use client';

import { ThemeProvider } from 'next-themes';
import { TooltipProvider } from '@/components/ui/tooltip';
import { TranslationProvider } from '@/components/i18n/translation-provider';
import { BrandingProvider } from '@/components/branding/branding-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <TooltipProvider delay={0}>
        <TranslationProvider>
          <BrandingProvider>
            {children}
          </BrandingProvider>
        </TranslationProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}
