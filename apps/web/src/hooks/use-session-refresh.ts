'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { AUTH_CONSTANTS } from '@multi-shop/shared';

export function useSessionRefresh() {
  const { data: session, update } = useSession();
  const refreshTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!session) {
      return;
    }

    // Calculate time until session expires
    const expiresAt = new Date(session.expires);
    const now = new Date();
    const timeUntilExpiry = expiresAt.getTime() - now.getTime();

    // Refresh session 5 minutes before expiry
    const refreshTime = Math.max(timeUntilExpiry - (5 * 60 * 1000), 0);

    // Clear existing timeout
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    // Set timeout to refresh session
    refreshTimeoutRef.current = setTimeout(async () => {
      try {
        console.log('Refreshing session...');
        await update();
      } catch (error) {
        console.error('Failed to refresh session:', error);
      }
    }, refreshTime);

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [session, update]);

  // Return session status
  return {
    session,
    isLoading: !session && typeof session !== 'undefined',
    isExpired: session ? new Date(session.expires) <= new Date() : false
  };
}