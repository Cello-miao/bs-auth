// Export a Promise-based CommonJS config so we can dynamically import
// ESM-only plugins (like @vitejs/plugin-vue) from a CJS environment.
// Vite supports configs that are a Promise resolving to the config object.

module.exports = (async () => {
  const { default: vue } = await import('@vitejs/plugin-vue')
  // return a plain config object; defineConfig is optional at runtime
  return {
    plugins: [vue()],
    // Dev server proxy to avoid CORS in development. Requests to /api/*
    // will be forwarded to the backend at localhost:4000. This makes
    // the browser think it's same-origin and avoids preflight/CORS issues.
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:4000',
          changeOrigin: true,
          secure: false,
          // keep the /api prefix so backend endpoints like /api/users/sign_in still match
          rewrite: (path) => path
        }
      }
    }
  }
})()
