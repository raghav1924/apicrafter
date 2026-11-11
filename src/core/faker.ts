import { MockResourceField } from './types.js';

export class DataFaker {
  public static fakeField(field: MockResourceField, index: number): any {
    const name = field.name.toLowerCase();

    if (field.type === 'id') {
      return `id_${index + 1}`;
    }

    if (field.type === 'uuid') {
      return `usr_${Math.random().toString(36).substring(2, 10)}`;
    }

    if (field.type === 'email' || name.includes('email')) {
      const names = ['alex', 'jatin', 'sarah', 'dev', 'elena', 'sam', 'maya'];
      return `${names[index % names.length]}.${index + 1}@example.com`;
    }

    if (field.type === 'date' || name.includes('created') || name.includes('updated') || name.includes('date')) {
      return new Date(Date.now() - (index * 86400000)).toISOString();
    }

    if (field.type === 'number') {
      if (name.includes('price') || name.includes('amount')) return parseFloat((20 + (index * 14.5)).toFixed(2));
      if (name.includes('age')) return 22 + (index % 18);
      if (name.includes('count') || name.includes('stock')) return (index + 1) * 12;
      return index + 1;
    }

    if (field.type === 'boolean') {
      return index % 2 === 0;
    }

    // String heuristics based on property name
    if (name.includes('name') && !name.includes('user')) {
      const titles = ['Pro Plan', 'Enterprise Bundle', 'Developer Seat', 'Standard API Access', 'Cloud Runner'];
      return titles[index % titles.length];
    }
    if (name.includes('username') || name === 'user') {
      const users = ['jatin_dev', 'alex_builder', 'sarah_cloud', 'sam_fullstack'];
      return users[index % users.length];
    }
    if (name.includes('status')) {
      const statuses = ['active', 'pending', 'completed', 'verified'];
      return statuses[index % statuses.length];
    }
    if (name.includes('role')) {
      const roles = ['admin', 'developer', 'member', 'owner'];
      return roles[index % roles.length];
    }
    if (name.includes('title')) {
      return `Task Item #${index + 1}: Implement modern API contract`;
    }

    return `Sample ${field.name} ${index + 1}`;
  }

  public static seedCollection(name: string, fields: MockResourceField[], count = 5): Record<string, any>[] {
    const rows: Record<string, any>[] = [];
    for (let i = 0; i < count; i++) {
      const item: Record<string, any> = {
        id: `id_${i + 1}`,
      };
      for (const field of fields) {
        if (field.name !== 'id') {
          item[field.name] = this.fakeField(field, i);
        }
      }
      rows.push(item);
    }
    return rows;
  }
}
