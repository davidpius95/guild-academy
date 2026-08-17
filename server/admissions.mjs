import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import ExcelJS from 'exceljs'

const DEFAULT_WORKBOOK_PATH = path.resolve(process.cwd(), 'data', 'guild-academy-applications.xlsx')
const SHEET_NAME = 'Applications'

const programmeDirectory = new Map([
  ['software-engineering', ['Software Engineering', 'GA/SE-01']],
  ['ai-development', ['AI Development', 'GA/AI-01']],
  ['devops-infrastructure', ['DevOps & Infrastructure Engineering', 'GA/DI-01']],
  ['cybersecurity', ['Cybersecurity', 'GA/CY-01']],
  ['blockchain-security', ['Blockchain Security', 'GA/BS-01']],
  ['smart-contract-security', ['Smart Contract Security', 'GA/SC-06']],
])

const columns = [
  { header: 'Submission ID', key: 'submissionId', width: 39 },
  { header: 'Submitted At', key: 'submittedAt', width: 22 },
  { header: 'Programme', key: 'programme', width: 34 },
  { header: 'Programme Code', key: 'programmeCode', width: 18 },
  { header: 'Full Name', key: 'name', width: 28 },
  { header: 'Email', key: 'email', width: 32 },
  { header: 'City / Country', key: 'location', width: 26 },
  { header: 'Current Experience', key: 'experience', width: 30 },
  { header: 'Weekly Availability', key: 'hours', width: 23 },
  { header: 'Portfolio URL', key: 'portfolio', width: 38 },
  { header: 'Motivation', key: 'motivation', width: 60 },
  { header: 'Consent Recorded', key: 'consent', width: 20 },
  { header: 'Review Status', key: 'status', width: 18 },
]

let writeQueue = Promise.resolve()

function cleanText(value, field, maxLength, required = true) {
  const text = typeof value === 'string' ? value.trim() : ''
  if (required && !text) throw new Error(`${field} is required.`)
  if (text.length > maxLength) throw new Error(`${field} is too long.`)
  return /^[=+\-@]/.test(text) ? `'${text}` : text
}

function validateApplication(input) {
  if (!input || typeof input !== 'object') throw new Error('Application data is missing.')
  const programme = cleanText(input.programme, 'Programme', 80)
  const programmeRecord = programmeDirectory.get(programme)
  if (!programmeRecord) throw new Error('Select a valid Guild Academy programme.')

  const email = cleanText(input.email, 'Email', 254).toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Enter a valid email address.')

  const portfolio = cleanText(input.portfolio, 'Portfolio URL', 1000, false)
  if (portfolio) {
    try {
      const url = new URL(portfolio.replace(/^'/, ''))
      if (!['http:', 'https:'].includes(url.protocol)) throw new Error()
    } catch {
      throw new Error('Portfolio URL must begin with http:// or https://.')
    }
  }

  if (input.consent !== true) throw new Error('Consent is required before submission.')

  const requestedId = typeof input.submissionId === 'string' ? input.submissionId : ''
  const submissionId = /^[0-9a-f-]{36}$/i.test(requestedId) ? requestedId : crypto.randomUUID()

  return {
    submissionId,
    submittedAt: new Date(),
    programme: programmeRecord[0],
    programmeCode: programmeRecord[1],
    name: cleanText(input.name, 'Full name', 160),
    email,
    location: cleanText(input.location, 'City and country', 180),
    experience: cleanText(input.experience, 'Current experience', 160),
    hours: cleanText(input.hours, 'Weekly availability', 100),
    portfolio,
    motivation: cleanText(input.motivation, 'Motivation', 5000),
    consent: 'Yes',
    status: 'New',
  }
}

function styleWorksheet(worksheet) {
  worksheet.columns = columns
  worksheet.views = [{ state: 'frozen', ySplit: 1 }]
  worksheet.autoFilter = { from: 'A1', to: 'M1' }
  worksheet.pageSetup = { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 }
  worksheet.getRow(1).height = 28
  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFF8F6EE' }, size: 11 }
  worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF09151C' } }
  worksheet.getRow(1).alignment = { vertical: 'middle' }
  worksheet.getRow(1).eachCell(cell => {
    cell.border = { bottom: { style: 'medium', color: { argb: 'FF01E400' } } }
  })
}

async function loadWorkbook(workbookPath) {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'Guild Academy Admissions'
  workbook.lastModifiedBy = 'Guild Academy Admissions'
  workbook.created = new Date()
  workbook.modified = new Date()

  try {
    await fs.access(workbookPath)
    await workbook.xlsx.readFile(workbookPath)
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error
  }

  let worksheet = workbook.getWorksheet(SHEET_NAME)
  if (!worksheet) worksheet = workbook.addWorksheet(SHEET_NAME, { properties: { tabColor: { argb: 'FF01E400' } } })
  styleWorksheet(worksheet)
  return { workbook, worksheet }
}

async function writeWorkbook(workbook, workbookPath) {
  await fs.mkdir(path.dirname(workbookPath), { recursive: true })
  const temporaryPath = `${workbookPath}.${crypto.randomUUID()}.tmp`
  await workbook.xlsx.writeFile(temporaryPath)
  await fs.rename(temporaryPath, workbookPath)
}

export async function ensureAdmissionsWorkbook(options = {}) {
  const workbookPath = options.workbookPath || process.env.ADMISSIONS_WORKBOOK_PATH || DEFAULT_WORKBOOK_PATH
  const { workbook } = await loadWorkbook(workbookPath)
  await writeWorkbook(workbook, workbookPath)
  return workbookPath
}

export function saveApplication(input, options = {}) {
  const workbookPath = options.workbookPath || process.env.ADMISSIONS_WORKBOOK_PATH || DEFAULT_WORKBOOK_PATH
  const application = validateApplication(input)

  const operation = async () => {
    const { workbook, worksheet } = await loadWorkbook(workbookPath)
    const duplicate = worksheet.getColumn('submissionId').values.some(value => value === application.submissionId)
    if (duplicate) return { submissionId: application.submissionId, duplicate: true, workbookPath }

    const row = worksheet.addRow(application)
    row.height = 42
    row.alignment = { vertical: 'top', wrapText: true }
    row.getCell('submittedAt').numFmt = 'yyyy-mm-dd hh:mm:ss'
    row.getCell('portfolio').font = application.portfolio ? { color: { argb: 'FF154D68' }, underline: true } : {}
    if (row.number % 2 === 0) row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F2' } }

    await writeWorkbook(workbook, workbookPath)
    return { submissionId: application.submissionId, duplicate: false, workbookPath }
  }

  writeQueue = writeQueue.catch(() => undefined).then(operation)
  return writeQueue
}

function readJsonBody(request, limit = 64 * 1024) {
  return new Promise((resolve, reject) => {
    let body = ''
    request.setEncoding('utf8')
    request.on('data', chunk => {
      body += chunk
      if (body.length > limit) reject(new Error('Application payload is too large.'))
    })
    request.on('end', () => {
      try { resolve(JSON.parse(body || '{}')) } catch { reject(new Error('Application data is not valid JSON.')) }
    })
    request.on('error', reject)
  })
}

export function createAdmissionsMiddleware(options = {}) {
  return async function admissionsMiddleware(request, response, next) {
    if (request.method !== 'POST') {
      if (next) return next()
      response.writeHead(405, { Allow: 'POST', 'Content-Type': 'application/json' })
      response.end(JSON.stringify({ error: 'Method not allowed.' }))
      return
    }

    try {
      const input = await readJsonBody(request)
      const result = await saveApplication(input, options)
      response.writeHead(result.duplicate ? 200 : 201, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' })
      response.end(JSON.stringify({ submissionId: result.submissionId, duplicate: result.duplicate }))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'The application could not be recorded.'
      response.writeHead(400, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' })
      response.end(JSON.stringify({ error: message }))
    }
  }
}
