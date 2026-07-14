import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The React plugin enables the automatic JSX runtime, so components that use
// JSX don't need to `import React`. Without it, Vite/esbuild emit classic
// `React.createElement` calls and the app crashes with "React is not defined".
export default defineConfig({
  plugins: [react()],
});
