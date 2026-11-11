import { MockCollectionSchema } from './types.js';
import { DataFaker } from './faker.js';

export class MemoryStore {
  private collections: Map<string, Record<string, any>[]> = new Map();
  private schemas: Map<string, MockCollectionSchema> = new Map();

  constructor() {
    this.initDefaults();
  }

  private initDefaults(): void {
    // 1. Users collection
    this.registerCollection({
      name: 'users',
      fields: [
        { name: 'id', type: 'id' },
        { name: 'name', type: 'string' },
        { name: 'email', type: 'email' },
        { name: 'role', type: 'string' },
        { name: 'created_at', type: 'date' },
      ],
      seedCount: 5,
    });

    // 2. Products collection
    this.registerCollection({
      name: 'products',
      fields: [
        { name: 'id', type: 'id' },
        { name: 'name', type: 'string' },
        { name: 'price', type: 'number' },
        { name: 'status', type: 'string' },
        { name: 'stock', type: 'number' },
      ],
      seedCount: 6,
    });

    // 3. Orders collection
    this.registerCollection({
      name: 'orders',
      fields: [
        { name: 'id', type: 'id' },
        { name: 'user_id', type: 'id' },
        { name: 'amount', type: 'number' },
        { name: 'status', type: 'string' },
        { name: 'created_at', type: 'date' },
      ],
      seedCount: 4,
    });
  }

  public registerCollection(schema: MockCollectionSchema): void {
    this.schemas.set(schema.name, schema);
    const initialRows = DataFaker.seedCollection(schema.name, schema.fields, schema.seedCount || 5);
    this.collections.set(schema.name, initialRows);
  }

  public getCollections(): string[] {
    return Array.from(this.collections.keys());
  }

  public getSchema(name: string): MockCollectionSchema | undefined {
    return this.schemas.get(name);
  }

  public getAll(collection: string): Record<string, any>[] | null {
    const list = this.collections.get(collection);
    return list ? [...list] : null;
  }

  public getById(collection: string, id: string): Record<string, any> | null {
    const list = this.collections.get(collection);
    if (!list) return null;
    return list.find(item => String(item.id) === String(id)) || null;
  }

  public create(collection: string, data: Record<string, any>): Record<string, any> {
    let list = this.collections.get(collection);
    if (!list) {
      list = [];
      this.collections.set(collection, list);
    }

    const newItem: Record<string, any> = {
      id: data.id || `id_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      created_at: new Date().toISOString(),
      ...data,
    };

    list.unshift(newItem);
    return newItem;
  }

  public update(collection: string, id: string, data: Record<string, any>): Record<string, any> | null {
    const list = this.collections.get(collection);
    if (!list) return null;

    const idx = list.findIndex(item => String(item.id) === String(id));
    if (idx === -1) return null;

    const updated = {
      ...list[idx],
      ...data,
      id: list[idx].id, // Protect ID
      updated_at: new Date().toISOString(),
    };

    list[idx] = updated;
    return updated;
  }

  public delete(collection: string, id: string): boolean {
    const list = this.collections.get(collection);
    if (!list) return false;

    const initialLen = list.length;
    const filtered = list.filter(item => String(item.id) !== String(id));
    this.collections.set(collection, filtered);

    return filtered.length < initialLen;
  }

  public reset(collection?: string): void {
    if (collection) {
      const schema = this.schemas.get(collection);
      if (schema) {
        this.collections.set(collection, DataFaker.seedCollection(schema.name, schema.fields, schema.seedCount || 5));
      }
    } else {
      this.collections.clear();
      this.initDefaults();
    }
  }
}

