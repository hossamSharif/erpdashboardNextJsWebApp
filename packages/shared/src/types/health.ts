export interface HealthCheckStatus {
  status: 'healthy' | 'unhealthy';
  database: boolean;
  auth: boolean;
  responseTime: number;
  timestamp: Date;
}

export interface SystemStatus {
  system: HealthCheckStatus;
  version: string;
  environment: string;
}