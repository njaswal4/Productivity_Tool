import dns from 'dns'
import { defineConfig, loadEnv } from 'vite'
import redwood from '@redwoodjs/vite'

// So that Vite will load on localhost instead of `127.0.0.1`.
// See: https://vitejs.dev/config/server-options.html#server-host.
dns.setDefaultResultOrder('verbatim')

export default defineConfig(({ mode }) => {
  // Load env file from root directory
  const env = loadEnv(mode, process.cwd(), '')

  // Convert env keys to import.meta.env format
  const envWithPrefix = {}
  for (const key in env) {
    envWithPrefix[`import.meta.env.${key}`] = JSON.stringify(env[key])
  }

  return {
    plugins: [redwood()],
    define: envWithPrefix,
  }
})
