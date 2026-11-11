import http from 'node:http';
import { URL } from 'node:url';
import { ChaosConfig, MockServerConfig, RouteMatch } from '../core/types.js';
import { MemoryStore } from '../core/store.js';
import { log } from '../utils/logger.js';

export class MockServer {
  private server: http.Server | null = null;
  private store: MemoryStore;
  private chaos: ChaosConfig;

  constructor(private config: MockServerConfig, store?: MemoryStore) {
    this.store = store || new MemoryStore();
    this.chaos = config.chaos;
  }

  public getStore(): MemoryStore {
    return this.store;
  }

  public getChaos(): ChaosConfig {
    return this.chaos;
  }

  public updateChaos(newChaos: Partial<ChaosConfig>): void {
    this.chaos = { ...this.chaos, ...newChaos };
  }

  public start(): Promise<number> {
    return new Promise((resolve, reject) => {
      this.server = http.createServer(async (req, res) => {
        const startTime = Date.now();
        const parsedUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
        const pathname = parsedUrl.pathname;
        const method = (req.method || 'GET').toUpperCase();

        // Global CORS Headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

        if (method === 'OPTIONS') {
          res.writeHead(204);
          res.end();
          return;
        }

        // Apply Chaos Delay
        await this.applyDelay();

        // Apply Chaos Random Error
        if (this.shouldTriggerChaosError()) {
          const errorCode = this.chaos.errorCodes[Math.floor(Math.random() * this.chaos.errorCodes.length)] || 500;
          res.writeHead(errorCode, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            error: 'Injected Chaos Error',
            code: errorCode,
            simulatedBy: 'ApiCrafter',
          }));
          log.request(method, pathname, errorCode, Date.now() - startTime);
          return;
        }

        const route = this.matchRoute(pathname);

        if (!route) {
          // Check for health endpoint
          if (pathname === '/' || pathname === '/api') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              service: 'ApiCrafter Mock Engine',
              version: '1.0.0',
              author: 'Jatin Sharma (https://jatinsh.netlify.app/)',
              collections: this.store.getCollections().map(c => `/api/${c}`),
            }));
            log.request(method, pathname, 200, Date.now() - startTime);
            return;
          }

          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: `Endpoint not found: ${pathname}` }));
          log.request(method, pathname, 404, Date.now() - startTime);
          return;
        }

        // REST CRUD Handlers
        if (method === 'GET') {
          if (route.id) {
            const item = this.store.getById(route.collection, route.id);
            if (!item) {
              res.writeHead(404, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: `Item ${route.id} not found in ${route.collection}` }));
              log.request(method, pathname, 404, Date.now() - startTime);
              return;
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(item));
            log.request(method, pathname, 200, Date.now() - startTime);
            return;
          }

          // List collection with query filters
          let items = this.store.getAll(route.collection) || [];
          // Simple query filtering: ?status=active or ?search=term
          for (const [key, val] of parsedUrl.searchParams.entries()) {
            if (key === 'limit') {
              items = items.slice(0, parseInt(val, 10));
            } else if (key === 'search') {
              items = items.filter(it => JSON.stringify(it).toLowerCase().includes(val.toLowerCase()));
            } else {
              items = items.filter(it => String(it[key]) === String(val));
            }
          }

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(items));
          log.request(method, pathname, 200, Date.now() - startTime);
          return;
        }

        if (method === 'POST') {
          const body = await this.readJsonBody(req);
          const created = this.store.create(route.collection, body);
          res.writeHead(201, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(created));
          log.request(method, pathname, 201, Date.now() - startTime);
          return;
        }

        if (method === 'PUT' || method === 'PATCH') {
          if (!route.id) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Missing resource ID in path' }));
            return;
          }
          const body = await this.readJsonBody(req);
          const updated = this.store.update(route.collection, route.id, body);
          if (!updated) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: `Item ${route.id} not found` }));
            return;
          }
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(updated));
          log.request(method, pathname, 200, Date.now() - startTime);
          return;
        }

        if (method === 'DELETE') {
          if (!route.id) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Missing resource ID in path' }));
            return;
          }
          const deleted = this.store.delete(route.collection, route.id);
          if (!deleted) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: `Item ${route.id} not found` }));
            return;
          }
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, deletedId: route.id }));
          log.request(method, pathname, 200, Date.now() - startTime);
          return;
        }

        res.writeHead(405, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: `Method ${method} not allowed` }));
      });

      this.server.listen(this.config.port, () => {
        resolve(this.config.port);
      });

      this.server.on('error', (err: any) => reject(err));
    });
  }

  private matchRoute(pathname: string): RouteMatch | null {
    // Normalizes "/api/users/123" or "/users/123"
    const cleaned = pathname.replace(/^\/api\/?/, '/').replace(/^\//, '');
    const segments = cleaned.split('/').filter(Boolean);

    if (segments.length === 0) return null;

    const collection = segments[0];
    const available = this.store.getCollections();

    if (!available.includes(collection)) {
      return null;
    }

    return {
      collection,
      id: segments[1],
      isCollection: segments.length === 1,
    };
  }

  private async applyDelay(): Promise<void> {
    let delay = this.chaos.delayMs;
    if (this.chaos.delayRange) {
      const [min, max] = this.chaos.delayRange;
      delay = Math.floor(Math.random() * (max - min + 1)) + min;
    }
    if (delay > 0) {
      await new Promise(r => setTimeout(r, delay));
    }
  }

  private shouldTriggerChaosError(): boolean {
    if (this.chaos.errorRate <= 0) return false;
    return Math.random() < this.chaos.errorRate;
  }

  private readJsonBody(req: http.IncomingMessage): Promise<Record<string, any>> {
    return new Promise((resolve) => {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        try {
          resolve(JSON.parse(body || '{}'));
        } catch {
          resolve({});
        }
      });
    });
  }
}
