import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
  },
  resolve: {
    alias: {
      '@sift/db': path.resolve(__dirname, 'packages/db/src/index.ts'),
      '@sift/config': path.resolve(__dirname, 'packages/config/src/index.ts'),
      '@sift/types': path.resolve(__dirname, 'packages/types/src/index.ts'),
      '@sift/validation': path.resolve(__dirname, 'packages/validation/src/index.ts'),
      '@sift/ai': path.resolve(__dirname, 'packages/ai/src/index.ts'),
      '@sift/research': path.resolve(__dirname, 'packages/research/src/index.ts'),
      '@sift/observability': path.resolve(__dirname, 'packages/observability/src/index.ts'),
    },
  },
});
