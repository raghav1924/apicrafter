export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface MockResourceField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'email' | 'uuid' | 'id';
}

export interface MockCollectionSchema {
  name: string;
  fields: MockResourceField[];
  seedCount?: number;
}

export interface ChaosConfig {
  delayMs: number;
  delayRange?: [number, number]; // e.g. [100, 500]
  errorRate: number;             // e.g. 0.2 (20% random failures)
  errorCodes: number[];          // [500, 503, 429]
}

export interface MockServerConfig {
  port: number;
  webPort: number;
  contractPath?: string;
  chaos: ChaosConfig;
}

export interface RouteMatch {
  collection: string;
  id?: string;
  isCollection: boolean;
}

