import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { createAdmissionsMiddleware, ensureAdmissionsWorkbook } from './server/admissions.mjs'

function admissionsApi() {
  return {
    name: 'guild-academy-admissions-api',
    configureServer(server: { middlewares: { use: (path: string, middleware: unknown) => void } }) {
      void ensureAdmissionsWorkbook()
      server.middlewares.use('/api/applications', createAdmissionsMiddleware())
    },
  }
}

export default defineConfig({
  plugins: [react(), admissionsApi()],
})
