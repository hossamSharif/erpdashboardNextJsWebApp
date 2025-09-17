import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createCaller } from '../../../../api/src/server/routers';
import { createContext } from '../../../../api/src/server/trpc';

// Mock Prisma
vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn(() => ({
    $queryRaw: vi.fn()
  }))
}));

describe('Health Check API', () => {
  let caller: ReturnType<typeof createCaller>;

  beforeEach(async () => {
    // Create a mock context
    const ctx = await createContext({
      req: {} as any,
      res: {} as any
    });

    caller = createCaller(ctx);
  });

  it('should return healthy status when all systems operational', async () => {
    const result = await caller.health.check();

    expect(result.system.status).toBe('healthy');
    expect(result.system.database).toBe(true);
    expect(result.system.auth).toBe(true);
    expect(result.system.responseTime).toBeGreaterThan(0);
    expect(result.system.timestamp).toBeInstanceOf(Date);
    expect(result.version).toBeDefined();
    expect(result.environment).toBeDefined();
  });

  it('should return unhealthy status when database fails', async () => {
    // Mock database failure
    const { PrismaClient } = await import('@prisma/client');
    const mockPrisma = new PrismaClient();
    vi.mocked(mockPrisma.$queryRaw).mockRejectedValue(new Error('Database connection failed'));

    const result = await caller.health.check();

    expect(result.system.status).toBe('unhealthy');
    expect(result.system.database).toBe(false);
  });

  it('should measure response time accurately', async () => {
    const result = await caller.health.check();

    expect(result.system.responseTime).toBeGreaterThanOrEqual(0);
    expect(result.system.responseTime).toBeLessThan(1000); // Should be fast
  });
});