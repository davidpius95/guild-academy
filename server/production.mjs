import fs from 'node:fs/promises'
import http from 'node:http'
import path from 'node:path'
import { createAdmissionsMiddleware, ensureAdmissionsWorkbook } from './admissions.mjs'
import { createPaymentsMiddleware, ensurePaymentsWorkbook } from './payments.mjs'

const port = Number(process.env.PORT || 4173)
const distDirectory = path.resolve(process.cwd(), 'dist')
const admissionsApi = createAdmissionsMiddleware()
const paymentsApi = createPaymentsMiddleware()
const contentTypes = new Map([
  ['.css', 'text/css; charset=utf-8'], ['.html', 'text/html; charset=utf-8'], ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'], ['.png', 'image/png'], ['.svg', 'image/svg+xml'], ['.webp', 'image/webp'],
])

await ensureAdmissionsWorkbook()
await ensurePaymentsWorkbook()

http.createServer(async (request, response) => {
  if (request.url?.split('?')[0] === '/api/applications') return admissionsApi(request, response)
  if (request.url?.split('?')[0]?.startsWith('/api/payments')) return paymentsApi(request, response)

  try {
    const pathname = decodeURIComponent(request.url?.split('?')[0] || '/')
    const requestedPath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '')
    const candidate = path.resolve(distDirectory, requestedPath)
    const safeCandidate = candidate.startsWith(`${distDirectory}${path.sep}`) ? candidate : path.join(distDirectory, 'index.html')
    let filePath = safeCandidate
    try { await fs.access(filePath) } catch { filePath = path.join(distDirectory, 'index.html') }
    const file = await fs.readFile(filePath)
    response.writeHead(200, { 'Content-Type': contentTypes.get(path.extname(filePath)) || 'application/octet-stream' })
    response.end(file)
  } catch {
    response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' })
    response.end('Unable to serve Guild Academy.')
  }
}).listen(port, '127.0.0.1', () => {
  console.log(`Guild Academy is running at http://127.0.0.1:${port}`)
})
