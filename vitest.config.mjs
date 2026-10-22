import react from '@vitejs/plugin-react-swc';

export default {
  plugins: [react()],
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: ['./src/test/test-setup.ts'],
  },
};
