import { vi } from 'vitest';

// Mock CSS and SCSS imports globally to prevent errors in JSDOM environment
vi.mock('*.css', () => ({ default: '' }));
vi.mock('*.scss', () => ({ default: '' }));

// Mock all Vue components to return an empty object,
// preventing Vitest from processing their style blocks in JSDOM.
vi.mock('*.vue', () => ({ default: {} }));
