import test, { describe, it } from 'node:test';
import assert from 'node:assert';
import { MemoryStore } from '../core/store.js';
import { TypeScriptTypeGenerator } from '../core/codegen.js';

describe('TypeScriptTypeGenerator', () => {
  it('generates valid typescript interface definitions', () => {
    const store = new MemoryStore();
    const tsCode = TypeScriptTypeGenerator.generate(store);

    assert.ok(tsCode.includes('export interface User {'), 'Should contain User interface');
    assert.ok(tsCode.includes('export interface Product {'), 'Should contain Product interface');
    assert.ok(tsCode.includes('export interface Order {'), 'Should contain Order interface');
    assert.ok(tsCode.includes('id: string;'), 'Should map id to string');
    assert.ok(tsCode.includes('price: number;'), 'Should map price to number');
  });
});
