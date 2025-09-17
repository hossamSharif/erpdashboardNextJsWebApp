import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../../../api/src/server/routers';

export const trpc = createTRPCReact<AppRouter>();

function getBaseUrl() {
  // In development, use the local development server
  if (__DEV__) {
    // For Android emulator, use 10.0.2.2
    // For iOS simulator and physical devices, use your local machine's IP
    return 'http://10.0.2.2:3000'; // Android emulator default
    // return 'http://192.168.1.100:3000'; // Use your actual IP for physical devices
  }

  // In production, use the deployed API URL
  return 'https://your-app-domain.vercel.app';
}

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
      headers() {
        return {
          'Content-Type': 'application/json',
        };
      },
    }),
  ],
});