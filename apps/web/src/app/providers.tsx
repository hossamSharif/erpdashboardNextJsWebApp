'use client';

import { SessionProvider } from 'next-auth/react';
import { trpc } from '../utils/trpc';
import { I18nProvider } from '../components/providers/i18n-provider';
import { RTLProvider } from '../components/layout/rtl-provider';

interface ProvidersProps {
  children: React.ReactNode;
}

function ProvidersInner({ children }: ProvidersProps) {
  return (
    <I18nProvider>
      <RTLProvider>
        <SessionProvider>
          {children}
        </SessionProvider>
      </RTLProvider>
    </I18nProvider>
  );
}

export const Providers = trpc.withTRPC(ProvidersInner);