/**
 * Standard API response interfaces conforming to CareerPulse API conventions.
 */

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: unknown[];
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    [key: string]: unknown;
  };
}

export interface HealthCheckResponse {
  status: 'ok' | 'degraded' | 'error';
  service: string;
  version?: string;
  timestamp: string;
  uptime: number;
  environment: string;
  database: 'connected' | 'connecting' | 'disconnected';
}
