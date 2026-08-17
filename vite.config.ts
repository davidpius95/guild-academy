import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { createAdmissionsMiddleware, ensureAdmissionsWorkbook } from './server/admissions.mjs'
import { createPaymentsMiddleware, ensurePaymentsWorkbook } from './server/payments.mjs'

function admissionsApi() {
  return {
    name: 'guild-academy-admissions-api',
    configureServer(server: { middlewares: { use: (path: string, middleware: unknown) => void } }) {
      void ensureAdmissionsWorkbook()
      server.middlewares.use('/api/applications', createAdmissionsMiddleware())
    },
  }
}

function paymentsApi() {
  return {
    name: 'guild-academy-payments-api',
    configureServer(server: { middlewares: { use: (middleware: unknown) => void } }) {
      void ensurePaymentsWorkbook()
      server.middlewares.use(createPaymentsMiddleware())
    },
  }
}

export default defineConfig({
  plugins: [react(), admissionsApi(), paymentsApi()],
})
