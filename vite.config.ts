import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import { resolve } from 'path'

const getConfig = ({ mode }: { mode: string }) => {
  const isPWA = mode === 'pwa'
  
  return defineConfig({
    root: resolve(__dirname, isPWA ? 'src/pwa' : 'src/web'),
  
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "@/common/styles/main" as *;`
        }
      }
    },
    
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '~pwa': resolve(__dirname, 'src/pwa'),
        '~web': resolve(__dirname, 'src/web')
      }
    },

    build: {
      outDir: `dist/${isPWA ? 'pwa' : 'web'}`,
      rollupOptions: {
        input: resolve(
          __dirname, 
          isPWA ? 'src/pwa/main.ts' : 'src/web/main.ts'
        )
      }
    },

    plugins: [
      vue(),
      isPWA && VitePWA({
        strategies: 'injectManifest',
        srcDir: 'src/pwa',
        filename: 'service-worker.ts',
        manifest: {
          name: 'Travel PWA',
          short_name: 'TravelPWA',
          theme_color: '#1976D2'
        }
      })
    ]
  })
}

export default getConfig