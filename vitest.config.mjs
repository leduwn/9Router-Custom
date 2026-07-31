import { defineConfig } from 'vitest/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  test: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'open-sse': path.resolve(__dirname, './open-sse')
    }
  }
});
