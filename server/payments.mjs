import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import ExcelJS from 'exceljs'
import { findApplication } from './admissions.mjs'

const DEFAULT_WORKBOOK_PATH = path.resolve(process.cwd(), 'data', 'guild-academy-payments.xlsx')
const SHEET_NAME = 'Payments'
const MOCK_MODE = (process.env.FLW_MODE || 'mock').toLowerCase() !== 'live'
const tokenUrl = process.env.FLW_V4_TOKEN_URL || 'https://idp.flutterwave.com/realms/flutterwave/protocol/openid-connect/token'
const baseUrl = (process.env.FLW_V4_BASE_URL || 'https://developersandbox-api.flutterwave.com').replace(/\/$/, '')
const mockSessionSecret = crypto.randomBytes(32).toString('hex')

const tuitionByProgramme = new Map([
  ['Software Engineering', { slug: 'software-engineering', amount: 360000 }],
  ['AI Development', { slug: 'ai-development', amount: 300000 }],
  ['DevOps & Infrastructure Engineering', { slug: 'devops-infrastructure', amount: 330000 }],
  ['Cybersecurity', { slug: 'cybersecurity', amount: 330000 }],
  ['Blockchain Security', { slug: 'blockchain-security', amount: 390000 }],
  ['Smart Contract Security', { slug: 'smart-contract-security', amount: 375000 }],
])

const columns = [
  { header: 'Payment Reference', key: 'reference', width: 38 },
  { header: 'Application ID', key: 'applicationId', width: 39 },
  { header: 'Created At', key: 'createdAt', width: 22 },
  { header: 'Updated At', key: 'updatedAt', width: 22 },
  { header: 'Applicant', key: 'name', width: 28 },
  { header: 'Email', key: 'email', width: 32 },
  { header: 'Programme', key: 'programme', width: 34 },
  { header: 'Amount', key: 'amount', width: 16 },
  { header: 'Currency', key: 'currency', width: 12 },
  { header: 'Method', key: 'method', width: 20 },
  { header: 'Status', key: 'status', width: 18 },
  { header: 'Next Action', key: 'nextAction', width: 24 },
  { header: 'Flutterwave Charge ID', key: 'chargeId', width: 28 },
  { header: 'Flutterwave Customer ID', key: 'customerId', width: 29 },
  { header: 'Flutterwave Payment Method ID', key: 'paymentMethodId', width: 34 },
  { header: 'Provider Note', key: 'providerNote', width: 55 },
]

let writeQueue = Promise.resolve()
let oauthCache = { token: '', expiresAt: 0 }

function configurationError() {
  if (MOCK_MODE) return null
  const required = ['FLW_V4_CLIENT_ID', 'FLW_V4_CLIENT_SECRET', 'FLW_V4_ENCRYPTION_KEY', 'FLW_V4_WEBHOOK_SECRET_HASH', 'FLW_PAYMENT_SESSION_SECRET', 'PUBLIC_APP_URL', 'FLW_VA_BANK_CODE']
  const missing = required.filter(name => !process.env[name])
  if (missing.length) return `Live payments are not configured. Missing: ${missing.join(', ')}.`
  if (!process.env.PUBLIC_APP_URL.startsWith('https://')) return 'PUBLIC_APP_URL must use HTTPS in live payment mode.'
  return null
}

function styleWorksheet(worksheet) {
  worksheet.columns = columns
  worksheet.views = [{ state: 'frozen', ySplit: 1 }]
  worksheet.autoFilter = { from: 'A1', to: 'P1' }
  worksheet.getRow(1).height = 28
  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFF8F6EE' }, size: 11 }
  worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF09151C' } }
  worksheet.getRow(1).eachCell(cell => { cell.border = { bottom: { style: 'medium', color: { argb: 'FF01E400' } } } })
}

async function loadWorkbook(workbookPath) {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'Guild Academy Payments'
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

export async function ensurePaymentsWorkbook(options = {}) {
  const workbookPath = options.workbookPath || process.env.PAYMENTS_WORKBOOK_PATH || DEFAULT_WORKBOOK_PATH
  const { workbook } = await loadWorkbook(workbookPath)
  await writeWorkbook(workbook, workbookPath)
  return workbookPath
}

function workbookOperation(operation) {
  writeQueue = writeQueue.catch(() => undefined).then(operation)
  return writeQueue
}

async function upsertPayment(payment, options = {}) {
  const workbookPath = options.workbookPath || process.env.PAYMENTS_WORKBOOK_PATH || DEFAULT_WORKBOOK_PATH
  return workbookOperation(async () => {
    const { workbook, worksheet } = await loadWorkbook(workbookPath)
    const rows = worksheet.getRows(2, Math.max(worksheet.rowCount - 1, 0)) || []
    let row = rows.find(candidate => String(candidate.getCell('reference').value || '') === payment.reference)
    if (!row) row = worksheet.addRow({ ...payment, createdAt: payment.createdAt || new Date(), updatedAt: new Date() })
    else Object.entries({ ...payment, updatedAt: new Date() }).forEach(([key, value]) => row.getCell(key).value = value)
    row.height = 36
    row.alignment = { vertical: 'top', wrapText: true }
    row.getCell('createdAt').numFmt = 'yyyy-mm-dd hh:mm:ss'
    row.getCell('updatedAt').numFmt = 'yyyy-mm-dd hh:mm:ss'
    row.getCell('amount').numFmt = '#,##0.00'
    await writeWorkbook(workbook, workbookPath)
    return payment
  })
}

async function findPayment(reference, options = {}) {
  const workbookPath = options.workbookPath || process.env.PAYMENTS_WORKBOOK_PATH || DEFAULT_WORKBOOK_PATH
  const { worksheet } = await loadWorkbook(workbookPath)
  const rows = worksheet.getRows(2, Math.max(worksheet.rowCount - 1, 0)) || []
  const row = rows.find(candidate => String(candidate.getCell('reference').value || '') === reference)
  if (!row) return null
  return Object.fromEntries(columns.map(column => [column.key, row.getCell(column.key).value instanceof Date ? row.getCell(column.key).value.toISOString() : row.getCell(column.key).value]))
}

function base64url(input) {
  return Buffer.from(input).toString('base64url')
}

function sessionSecret() {
  return process.env.FLW_PAYMENT_SESSION_SECRET || mockSessionSecret
}

function createSession(payload) {
  const body = base64url(JSON.stringify({ ...payload, expiresAt: Date.now() + 30 * 60 * 1000 }))
  const signature = crypto.createHmac('sha256', sessionSecret()).update(body).digest('base64url')
  return `${body}.${signature}`
}

function verifySession(token) {
  if (typeof token !== 'string') throw new Error('Your payment session is missing. Start again with your application reference.')
  const [body, signature] = token.split('.')
  if (!body || !signature) throw new Error('Your payment session is invalid.')
  const expected = crypto.createHmac('sha256', sessionSecret()).update(body).digest()
  const received = Buffer.from(signature, 'base64url')
  if (expected.length !== received.length || !crypto.timingSafeEqual(expected, received)) throw new Error('Your payment session is invalid.')
  const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'))
  if (!payload.expiresAt || payload.expiresAt < Date.now()) throw new Error('Your payment session has expired. Verify your application again.')
  return payload
}

function paymentReference(applicationId, method) {
  return `GA-${method.toUpperCase().replaceAll('_', '-')}-${applicationId.slice(0, 8)}-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`
}

function splitName(name) {
  const parts = name.trim().split(/\s+/)
  return { first: parts[0] || 'Guild', last: parts.slice(1).join(' ') || 'Applicant' }
}

function customerPayload(session, phone, requestedCountryCode = '234') {
  const parsedPhone = String(phone || '').replace(/\D/g, '')
  const countryCode = /^\d{1,4}$/.test(String(requestedCountryCode)) ? String(requestedCountryCode) : '234'
  return {
    email: session.email,
    name: splitName(session.name),
    ...(parsedPhone ? { phone: { country_code: countryCode, number: parsedPhone.replace(new RegExp(`^${countryCode}`), '').replace(/^0/, '') } } : {}),
    meta: { application_id: session.applicationId, programme: session.programme },
  }
}

async function accessToken() {
  const configError = configurationError()
  if (configError) throw new Error(configError)
  if (oauthCache.token && oauthCache.expiresAt > Date.now() + 30_000) return oauthCache.token
  const body = new URLSearchParams({
    client_id: process.env.FLW_V4_CLIENT_ID,
    client_secret: process.env.FLW_V4_CLIENT_SECRET,
    grant_type: 'client_credentials',
  })
  const response = await fetch(tokenUrl, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body })
  const result = await response.json()
  if (!response.ok || !result.access_token) throw new Error('Flutterwave authentication failed. Check the private server configuration.')
  oauthCache = { token: result.access_token, expiresAt: Date.now() + Math.max(60, Number(result.expires_in || 600) - 30) * 1000 }
  return oauthCache.token
}

async function flutterwave(pathname, { method = 'GET', body, idempotencyKey } = {}) {
  const token = await accessToken()
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-Trace-Id': crypto.randomUUID(),
  }
  if (idempotencyKey) headers['X-Idempotency-Key'] = idempotencyKey
  const response = await fetch(`${baseUrl}${pathname}`, { method, headers, ...(body ? { body: JSON.stringify(body) } : {}) })
  const result = await response.json().catch(() => ({}))
  if (!response.ok) {
    const message = result?.error?.message || result?.message || 'Flutterwave could not process this request.'
    throw new Error(message)
  }
  return result
}

function encryptionKey() {
  const key = Buffer.from(process.env.FLW_V4_ENCRYPTION_KEY || '', 'base64')
  if (key.length !== 32) throw new Error('The Flutterwave v4 encryption key must be a valid 32-byte base64 AES key.')
  return key
}

function encrypt(value, nonce) {
  const cipher = crypto.createCipheriv('aes-256-gcm', encryptionKey(), Buffer.from(nonce, 'utf8'))
  const ciphertext = Buffer.concat([cipher.update(String(value), 'utf8'), cipher.final(), cipher.getAuthTag()])
  return ciphertext.toString('base64')
}

function encryptedCard(card) {
  const number = String(card?.number || '').replace(/\D/g, '')
  const month = String(card?.expiryMonth || '').padStart(2, '0')
  const year = String(card?.expiryYear || '').replace(/^20/, '')
  const cvv = String(card?.cvv || '').replace(/\D/g, '')
  if (number.length < 13 || number.length > 19 || !/^\d+$/.test(number)) throw new Error('Enter a valid card number.')
  if (!/^(0[1-9]|1[0-2])$/.test(month) || !/^\d{2}$/.test(year)) throw new Error('Enter a valid card expiry date.')
  if (!/^\d{3,4}$/.test(cvv)) throw new Error('Enter a valid card security code.')
  const nonce = crypto.randomBytes(9).toString('base64url').slice(0, 12)
  return {
    nonce,
    encrypted_card_number: encrypt(number, nonce),
    encrypted_expiry_month: encrypt(month, nonce),
    encrypted_expiry_year: encrypt(year, nonce),
    encrypted_cvv: encrypt(cvv, nonce),
  }
}

function normalizeAction(data) {
  const next = data?.next_action || {}
  let type = next.type || 'pending'
  if (type === 'authorize') type = next.authorization?.type === 'pin' ? 'requires_pin' : next.authorization?.type === 'otp' ? 'requires_otp' : 'requires_additional_fields'
  const redirectUrl = next.redirect_url?.url || (type === 'redirect_url' ? next.redirect_url : '')
  const instructions = next.payment_instruction || next.payment_instructions || {}
  let safeRedirectUrl = ''
  if (typeof redirectUrl === 'string') {
    try {
      const parsed = new URL(redirectUrl, 'http://localhost')
      if (['http:', 'https:'].includes(parsed.protocol)) safeRedirectUrl = redirectUrl
    } catch { /* Ignore malformed provider redirect URLs. */ }
  }
  return { type, redirectUrl: safeRedirectUrl, note: instructions.note || data?.note || '' }
}

function publicPayment(payment, extra = {}) {
  return {
    reference: payment.reference,
    status: payment.status,
    method: payment.method,
    amount: Number(payment.amount),
    currency: payment.currency,
    nextAction: payment.nextAction,
    note: payment.providerNote || '',
    ...extra,
  }
}

function mockResult(payment) {
  if (payment.method === 'virtual_account') return publicPayment(payment, {
    nextAction: 'payment_instruction',
    bankAccount: { bankName: 'Flutterwave Sandbox Bank', accountName: 'Guild Technologies / Guild Academy', accountNumber: '0000000000', expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString() },
    note: 'Mock mode: no money will move. Use this screen to review the transfer experience.',
  })
  if (payment.method === 'ussd') return publicPayment(payment, { nextAction: 'payment_instruction', note: 'Mock mode: dial *000*000# to review the USSD instruction flow.' })
  if (payment.method === 'opay') return publicPayment(payment, { nextAction: 'redirect_url', redirectUrl: `/pay?mock_return=1&reference=${encodeURIComponent(payment.reference)}`, note: 'Mock mode: continue to simulate the OPay approval return.' })
  if (payment.method === 'mobile_money') return publicPayment(payment, { nextAction: 'payment_instruction', note: 'Mock mode: approve the payment prompt on your mobile wallet.' })
  return publicPayment(payment, { nextAction: 'requires_pin', note: 'Mock mode: enter any 4-digit PIN to continue.' })
}

function mobileMoneyPrices() {
  try {
    const parsed = JSON.parse(process.env.FLW_MOBILE_MONEY_PRICES_JSON || '{}')
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

async function createCustomer(session, idempotencyKey, phone) {
  const result = await flutterwave('/customers', { method: 'POST', idempotencyKey, body: customerPayload(session, phone) })
  if (!result?.data?.id) throw new Error('Flutterwave did not return a customer ID.')
  return result.data.id
}

async function initiateLive(session, input, payment) {
  const returnUrl = `${process.env.PUBLIC_APP_URL.replace(/\/$/, '')}/pay?reference=${encodeURIComponent(payment.reference)}`
  if (input.method === 'virtual_account') {
    const customerId = await createCustomer(session, `${payment.reference}-customer`)
    const result = await flutterwave('/virtual-accounts', {
      method: 'POST', idempotencyKey: payment.reference,
      body: { reference: payment.reference, customer_id: customerId, expiry: 3600, amount: payment.amount, bank_code: process.env.FLW_VA_BANK_CODE, currency: payment.currency, account_type: 'dynamic', narration: `Guild Academy - ${session.name}`.slice(0, 45) },
    })
    const data = result.data || {}
    Object.assign(payment, { customerId, chargeId: '', status: 'pending', nextAction: 'payment_instruction', providerNote: data.note || 'Transfer the exact amount to the temporary account.' })
    await upsertPayment(payment)
    return publicPayment(payment, { bankAccount: { bankName: data.account_bank_name, accountName: data.narration, accountNumber: data.account_number, expiresAt: data.account_expiration_datetime } })
  }

  const body = {
    amount: payment.amount,
    currency: payment.currency,
    reference: payment.reference,
    redirect_url: returnUrl,
    customer: customerPayload(session, input.phone, input.method === 'mobile_money' ? input.countryCode : '234'),
    meta: { application_id: session.applicationId, programme: session.programme },
  }
  if (input.method === 'card') body.payment_method = { type: 'card', card: encryptedCard(input.card) }
  if (input.method === 'ussd') {
    if (!/^\d{3,6}$/.test(String(input.bankCode || ''))) throw new Error('Select a supported bank for USSD.')
    body.payment_method = { type: 'ussd', ussd: { account_bank: input.bankCode } }
  }
  if (input.method === 'opay') body.payment_method = { type: 'opay' }
  if (input.method === 'mobile_money') {
    body.payment_method = { type: 'mobile_money', mobile_money: { country_code: input.countryCode, network: input.network, phone_number: String(input.phone || '').replace(/\D/g, '').replace(new RegExp(`^${input.countryCode}`), '') } }
  }
  const result = await flutterwave('/orchestration/direct-charges', { method: 'POST', idempotencyKey: payment.reference, body })
  const data = result.data || {}
  const action = normalizeAction(data)
  Object.assign(payment, { chargeId: data.id || '', customerId: typeof data.customer === 'string' ? data.customer : data.customer?.id || '', paymentMethodId: data.payment_method_details?.id || '', status: data.status || 'pending', nextAction: action.type, providerNote: action.note || result.message || '' })
  await upsertPayment(payment)
  return publicPayment(payment, { redirectUrl: action.redirectUrl })
}

async function initiatePayment(input) {
  const session = verifySession(input.sessionToken)
  const allowed = new Set(['card', 'virtual_account', 'ussd', 'opay', 'mobile_money'])
  if (!allowed.has(input.method)) throw new Error('Select a supported payment method.')
  let amount = session.amount
  let currency = 'NGN'
  if (input.method === 'mobile_money') {
    const configured = mobileMoneyPrices()?.[session.programmeSlug]?.[input.currency]
    if (!configured || !Number.isFinite(Number(configured)) || Number(configured) <= 0) throw new Error('Mobile money pricing is not configured for this programme and currency yet. Choose another payment method.')
    amount = Number(configured)
    currency = String(input.currency).toUpperCase()
  }
  const payment = {
    reference: paymentReference(session.applicationId, input.method), applicationId: session.applicationId, createdAt: new Date(), updatedAt: new Date(),
    name: session.name, email: session.email, programme: session.programme, amount, currency, method: input.method, status: 'pending', nextAction: 'pending', chargeId: '', customerId: '', paymentMethodId: '', providerNote: '',
  }
  await upsertPayment(payment)
  if (MOCK_MODE) {
    const result = mockResult(payment)
    await upsertPayment({ ...payment, nextAction: result.nextAction, providerNote: result.note })
    return result
  }
  return initiateLive(session, input, payment)
}

async function authorizePayment(input) {
  const session = verifySession(input.sessionToken)
  const payment = await findPayment(input.reference)
  if (!payment || payment.applicationId !== session.applicationId || payment.method !== 'card') throw new Error('Card payment was not found for this application.')
  if (MOCK_MODE) {
    if (input.type === 'pin' && /^\d{4,6}$/.test(String(input.value || ''))) {
      await upsertPayment({ ...payment, nextAction: 'requires_otp', providerNote: 'Mock mode: enter any 6-digit OTP to complete the flow.' })
      return publicPayment({ ...payment, nextAction: 'requires_otp', providerNote: 'Mock mode: enter any 6-digit OTP to complete the flow.' })
    }
    if (input.type === 'otp' && /^\d{6}$/.test(String(input.value || ''))) {
      await upsertPayment({ ...payment, status: 'succeeded', nextAction: 'complete', providerNote: 'Mock payment completed. No money moved.' })
      return publicPayment({ ...payment, status: 'succeeded', nextAction: 'complete', providerNote: 'Mock payment completed. No money moved.' })
    }
    throw new Error(input.type === 'pin' ? 'Enter a valid 4 to 6 digit PIN.' : 'Enter a valid 6 digit OTP.')
  }
  let authorization
  if (input.type === 'pin') {
    if (!/^\d{4,6}$/.test(String(input.value || ''))) throw new Error('Enter a valid card PIN.')
    const nonce = crypto.randomBytes(9).toString('base64url').slice(0, 12)
    authorization = { type: 'pin', pin: { nonce, encrypted_pin: encrypt(input.value, nonce) } }
  } else if (input.type === 'otp') {
    if (!/^\d{4,8}$/.test(String(input.value || ''))) throw new Error('Enter a valid OTP.')
    authorization = { type: 'otp', otp: { code: String(input.value) } }
  } else throw new Error('Unsupported card authorization step.')
  const result = await flutterwave(`/charges/${encodeURIComponent(payment.chargeId)}`, { method: 'PUT', body: { authorization } })
  const data = result.data || {}
  const action = normalizeAction(data)
  const updated = { ...payment, status: data.status || payment.status, nextAction: action.type, providerNote: action.note || result.message || payment.providerNote }
  await upsertPayment(updated)
  return publicPayment(updated, { redirectUrl: action.redirectUrl })
}

async function verifyRemotePayment(payment) {
  if (MOCK_MODE || !payment.chargeId) return payment
  const result = await flutterwave(`/charges/${encodeURIComponent(payment.chargeId)}`)
  const data = result.data || {}
  const remoteCustomer = typeof data.customer === 'string' ? data.customer : data.customer?.id
  const valid = data.reference === payment.reference && Number(data.amount) === Number(payment.amount) && data.currency === payment.currency && (!payment.customerId || !remoteCustomer || remoteCustomer === payment.customerId)
  if (!valid) throw new Error('Payment verification details do not match the original transaction.')
  const action = normalizeAction(data)
  const updated = { ...payment, status: data.status || payment.status, nextAction: action.type, providerNote: action.note || payment.providerNote }
  await upsertPayment(updated)
  return updated
}

async function paymentStatus(input) {
  const session = verifySession(input.sessionToken)
  const payment = await findPayment(input.reference)
  if (!payment || payment.applicationId !== session.applicationId) throw new Error('Payment was not found for this application.')
  return publicPayment(await verifyRemotePayment(payment))
}

function readRawBody(request, limit = 64 * 1024) {
  return new Promise((resolve, reject) => {
    const chunks = []
    let length = 0
    request.on('data', chunk => {
      length += chunk.length
      if (length > limit) reject(new Error('Request payload is too large.'))
      else chunks.push(chunk)
    })
    request.on('end', () => resolve(Buffer.concat(chunks)))
    request.on('error', reject)
  })
}

async function readJson(request) {
  const raw = await readRawBody(request)
  try { return { raw, body: JSON.parse(raw.toString('utf8') || '{}') } } catch { throw new Error('Request data is not valid JSON.') }
}

function send(response, status, payload) {
  response.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' })
  response.end(JSON.stringify(payload))
}

async function createPaymentSession(input) {
  const configError = configurationError()
  if (configError) throw new Error(configError)
  const application = await findApplication(input.applicationId, input.email)
  if (!application) throw new Error('We could not match that application reference and email address.')
  if (!MOCK_MODE && !['Offer', 'Accepted', 'Payment due'].includes(application.status)) throw new Error('Payment is not open for this application yet. Wait for an offer from the admissions team.')
  const tuition = tuitionByProgramme.get(application.programme)
  if (!tuition) throw new Error('Tuition is not configured for this programme.')
  const session = { applicationId: application.submissionId, email: application.email, name: application.name, programme: application.programme, programmeSlug: tuition.slug, amount: tuition.amount, currency: 'NGN' }
  const mobilePrices = mobileMoneyPrices()?.[tuition.slug] || {}
  return { sessionToken: createSession(session), applicant: { name: session.name, programme: session.programme }, price: { amount: session.amount, currency: session.currency }, mode: MOCK_MODE ? 'mock' : 'live', mobileMoneyPrices: mobilePrices }
}

async function banks() {
  if (MOCK_MODE) return [{ code: '044', name: 'Access Bank' }, { code: '058', name: 'GTBank' }, { code: '033', name: 'UBA' }, { code: '057', name: 'Zenith Bank' }]
  const result = await flutterwave('/banks?country=NG')
  return Array.isArray(result.data) ? result.data.map(bank => ({ code: bank.code, name: bank.name })) : []
}

async function handleWebhook(request, response) {
  if (MOCK_MODE) return send(response, 404, { error: 'Webhooks are disabled in mock mode.' })
  const { raw, body } = await readJson(request)
  const signature = request.headers['flutterwave-signature']
  const expected = crypto.createHmac('sha256', process.env.FLW_V4_WEBHOOK_SECRET_HASH).update(raw).digest()
  const received = Buffer.from(typeof signature === 'string' ? signature : '', 'base64')
  if (expected.length !== received.length || !crypto.timingSafeEqual(expected, received)) return send(response, 401, { error: 'Invalid webhook signature.' })
  if (body.type === 'charge.completed' && body.data?.reference) {
    const payment = await findPayment(body.data.reference)
    if (payment) await verifyRemotePayment({ ...payment, chargeId: body.data.id || payment.chargeId })
  }
  return send(response, 200, { received: true })
}

export function createPaymentsMiddleware() {
  return async function paymentsMiddleware(request, response, next) {
    const pathname = new URL(request.url || '/', 'http://localhost').pathname.replace(/^\/api\/payments/, '') || '/'
    try {
      if (pathname === '/webhook' && request.method === 'POST') return handleWebhook(request, response)
      if (pathname === '/banks' && request.method === 'GET') return send(response, 200, { banks: await banks(), mode: MOCK_MODE ? 'mock' : 'live' })
      if (request.method !== 'POST') {
        if (next) return next()
        return send(response, 405, { error: 'Method not allowed.' })
      }
      const { body } = await readJson(request)
      if (pathname === '/session') return send(response, 200, await createPaymentSession(body))
      if (pathname === '/initiate') return send(response, 201, await initiatePayment(body))
      if (pathname === '/authorize') return send(response, 200, await authorizePayment(body))
      if (pathname === '/status') return send(response, 200, await paymentStatus(body))
      if (next) return next()
      return send(response, 404, { error: 'Payment endpoint not found.' })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'The payment request could not be completed.'
      return send(response, 400, { error: message })
    }
  }
}
