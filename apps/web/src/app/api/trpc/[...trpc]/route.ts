import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '../../../../../api/src/server/routers';
import { createContext } from '../../../../../api/src/server/trpc';

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: createContext as any,
  });

export { handler as GET, handler as POST };