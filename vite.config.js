// Export a Promise-based CommonJS config so we can dynamically import
// ESM-only plugins (like @vitejs/plugin-vue) from a CJS environment.
// Vite supports configs that are a Promise resolving to the config object.

module.exports = (async () => {
  const { default: vue } = await import('@vitejs/plugin-vue')
  // return a plain config object; defineConfig is optional at runtime
  return {
    plugins: [vue()]
  }
})()
