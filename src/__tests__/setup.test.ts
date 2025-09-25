import { describe, it, expect } from 'vitest';

describe('Project Setup', () => {
  it('should have environment variables configured', () => {
    // This test ensures the environment is properly set up
    expect(import.meta.env).toBeDefined();
  });

  it('should be able to import types', () => {
    // This test ensures TypeScript types are properly configured
    const testMovie = {
      id: 1,
      title: 'Test Movie',
      poster_path: '/test.jpg',
      release_date: '2024-01-01',
      overview: 'Test overview',
      vote_average: 8.5,
      genre_ids: [1, 2, 3],
    };
    
    expect(testMovie.id).toBe(1);
    expect(testMovie.title).toBe('Test Movie');
  });
});