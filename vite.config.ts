import type { UserConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isGitHubPages = process.env.GITHUB_PAGES === 'true'
  const multiPageInput = {
    main: 'index.html',
    portfolio: 'portfolio/index.html',
    contact: 'contact/index.html',
  }
  let build: UserConfig['build'] = {
    rollupOptions: {
      input: multiPageInput,
    },
  }
  let esbuild: UserConfig['esbuild'], define: UserConfig['define']

  if (mode === 'development') {
    build = {
      ...build,
      minify: false,
      rollupOptions: {
        input: multiPageInput,
        output: {
          manualChunks: undefined,
        },
      },
    }

    esbuild = {
      jsxDev: true,
      keepNames: true,
      minifyIdentifiers: false,
    }

    define = {
      'process.env.NODE_ENV': '"development"',
      '__DEV__': 'true',
    }
  }

  return {
    plugins: [react()],
    base: isGitHubPages ? '/Crazy-Master-Xu/' : '/',
    build,
    esbuild,
    define,
    resolve: {
      alias: {
        '@': '/src',
      }
    },
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
  }
})
