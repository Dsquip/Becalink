import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// En desarrollo local, Vite también atiende /api/asistente con la misma función
// que usa Vercel (api/asistente.js), para no necesitar el CLI de Vercel.
// La clave se lee de GEMINI_API_KEY (archivo .env.local o variable de entorno).
function apiLocal(env) {
  return {
    name: 'becalink-api-local',
    configureServer(server) {
      for (const [clave, valor] of Object.entries(env)) {
        if (clave.startsWith('GEMINI_')) process.env[clave] ??= valor
      }

      server.middlewares.use('/api/asistente', async (req, res, next) => {
        try {
          const { default: handler } = await server.ssrLoadModule('/api/asistente.js')
          await handler(req, res)
        } catch (error) {
          next(error)
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), apiLocal(env)],
  }
})
