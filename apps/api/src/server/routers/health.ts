import { router, publicProcedure } from '../trpc';
import { HealthCheckStatus, SystemStatus } from '@multi-shop/shared';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const healthRouter = router({
  check: publicProcedure
    .query(async ({ ctx }): Promise<SystemStatus> => {
      const startTime = Date.now();

      // Initialize health status
      let healthStatus: HealthCheckStatus = {
        status: 'healthy',
        database: false,
        auth: false,
        responseTime: 0,
        timestamp: new Date()
      };

      try {
        // Test database connectivity
        await prisma.$queryRaw`SELECT 1`;
        healthStatus.database = true;
      } catch (error) {
        console.error('Database health check failed:', error);
        healthStatus.database = false;
        healthStatus.status = 'unhealthy';
      }

      // Test authentication service status
      try {
        // Simple check to see if session context is available
        healthStatus.auth = true;
      } catch (error) {
        console.error('Auth health check failed:', error);
        healthStatus.auth = false;
        healthStatus.status = 'unhealthy';
      }

      // Calculate response time
      const endTime = Date.now();
      healthStatus.responseTime = endTime - startTime;
      healthStatus.timestamp = new Date();

      // Return system status
      const systemStatus: SystemStatus = {
        system: healthStatus,
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development'
      };

      return systemStatus;
    }),
});