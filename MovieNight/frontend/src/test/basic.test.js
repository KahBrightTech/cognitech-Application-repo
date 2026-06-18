import { describe, it, expect } from 'vitest';

describe('Basic Tests', () => {
  it('should pass a simple test', () => {
    expect(true).toBe(true);
  });

  it('should perform basic math', () => {
    expect(2 + 2).toBe(4);
  });

  it('should validate strings', () => {
    const appName = 'MovieNight';
    expect(appName).toBe('MovieNight');
    expect(appName).toHaveLength(10);
  });

  it('should work with arrays', () => {
    const movies = ['Movie 1', 'Movie 2', 'Movie 3'];
    expect(movies).toHaveLength(3);
    expect(movies).toContain('Movie 1');
  });

  it('should work with objects', () => {
    const session = {
      id: 'ABC123',
      users: [],
      active: true
    };
    expect(session).toHaveProperty('id');
    expect(session.id).toBe('ABC123');
    expect(session.active).toBe(true);
  });
});
