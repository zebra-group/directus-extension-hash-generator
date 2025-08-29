import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/__tests__/*.spec.ts'],
    // pool: 'threads',
    // poolOptions: {
    //   threads: {
    //     singleThread: true,
    //     maxThreads: 1,
    //     minThreads: 1,
    //   },
    // },
  },
});
