import test, { describe, it } from 'node:test';
import assert from 'node:assert';
import { MemoryStore } from '../core/store.js';

describe('MemoryStore CRUD & State Management', () => {
  it('initializes with default collections (users, products, orders)', () => {
    const store = new MemoryStore();
    const collections = store.getCollections();
    assert.ok(collections.includes('users'));
    assert.ok(collections.includes('products'));
    assert.ok(collections.includes('orders'));
  });

  it('creates and retrieves a single item', () => {
    const store = new MemoryStore();
    const newItem = store.create('users', {
      name: 'Alice Dev',
      email: 'alice@example.com',
      role: 'engineer',
    });

    assert.ok(newItem.id, 'Inserted item should have an assigned id');
    assert.strictEqual(newItem.name, 'Alice Dev');

    const fetched = store.getById('users', newItem.id);
    assert.ok(fetched);
    assert.strictEqual(fetched?.email, 'alice@example.com');
  });

  it('updates an existing item with partial fields', () => {
    const store = new MemoryStore();
    const users = store.getAll('users') || [];
    assert.ok(users.length > 0);
    const target = users[0];

    const updated = store.update('users', target.id, { name: 'Updated Name 99' });
    assert.ok(updated);
    assert.strictEqual(updated?.name, 'Updated Name 99');
    assert.strictEqual(updated?.id, target.id);
  });

  it('deletes an item and decreases count', () => {
    const store = new MemoryStore();
    const usersBefore = store.getAll('users') || [];
    assert.ok(usersBefore.length > 0);
    const beforeCount = usersBefore.length;
    const target = usersBefore[0];

    const deleted = store.delete('users', target.id);
    assert.strictEqual(deleted, true);

    const usersAfter = store.getAll('users') || [];
    assert.strictEqual(usersAfter.length, beforeCount - 1);
    assert.strictEqual(store.getById('users', target.id), null);
  });

  it('resets collections back to initial default seed state', () => {
    const store = new MemoryStore();
    store.create('users', { name: 'Temp' });
    store.reset();
    const users = store.getAll('users') || [];
    assert.strictEqual(users.length, 5);
  });

  it('returns null when querying non-existent collection or missing ID', () => {
    const store = new MemoryStore();
    assert.strictEqual(store.getAll('ghost_collection'), null);
    assert.strictEqual(store.getById('users', 'non_existent_id'), null);
  });

  it('allows dynamic registration of new custom collections', () => {
    const store = new MemoryStore();
    store.registerCollection({
      name: 'invoices',
      fields: [
        { name: 'id', type: 'id' },
        { name: 'amount', type: 'number' },
        { name: 'status', type: 'string' },
      ],
      seedCount: 3,
    });
    const invoices = store.getAll('invoices');
    assert.ok(invoices);
    assert.strictEqual(invoices?.length, 3);
  });
});
