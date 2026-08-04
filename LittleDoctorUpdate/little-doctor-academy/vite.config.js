import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// The React plugin enables the automatic JSX runtime, so components that use
// JSX don't need to `import React`. Without it, Vite/esbuild emit classic
// `React.createElement` calls and the app crashes with "React is not defined".
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  return {
    plugins: [react()],
    define: {
      'import.meta.env.COGNITO_USER_POOL_ID': JSON.stringify(env.COGNITO_USER_POOL_ID ?? ''),
      'import.meta.env.COGNITO_CLIENT_ID': JSON.stringify(env.COGNITO_CLIENT_ID ?? ''),
      'import.meta.env.COGNITO_REGION': JSON.stringify(env.COGNITO_REGION ?? 'us-east-1'),
    },
  };
});
