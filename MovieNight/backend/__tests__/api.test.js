const { v4: uuidv4 } = require('uuid');

describe('Session Management', () => {
  test('UUID generation should create unique IDs', () => {
    const id1 = uuidv4();
    const id2 = uuidv4();
    
    expect(id1).not.toBe(id2);
    expect(id1).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
  });

  test('Session ID should be uppercase and 6 characters', () => {
    const fullId = uuidv4();
    const sessionId = fullId.substring(0, 6).toUpperCase();
    
    expect(sessionId).toHaveLength(6);
    expect(sessionId).toMatch(/^[0-9A-F]{6}$/);
  });
});

describe('Data Structures', () => {
  test('Map should store and retrieve session data', () => {
    const sessions = new Map();
    const testSession = {
      id: 'ABC123',
      hostName: 'Test User',
      users: [],
      movies: []
    };
    
    sessions.set('ABC123', testSession);
    
    expect(sessions.has('ABC123')).toBe(true);
    expect(sessions.get('ABC123')).toEqual(testSession);
    expect(sessions.size).toBe(1);
  });

  test('Map should handle multiple sessions', () => {
    const sessions = new Map();
    
    sessions.set('ABC123', { id: 'ABC123', users: [] });
    sessions.set('DEF456', { id: 'DEF456', users: [] });
    
    expect(sessions.size).toBe(2);
    expect(sessions.has('ABC123')).toBe(true);
    expect(sessions.has('DEF456')).toBe(true);
  });
});
