import { useEffect, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Icon, ThemeToggle } from './components'

type Method = 'card' | 'virtual_account' | 'ussd' | 'opay' | 'mobile_money'
type Session = {
  sessionToken: string
  applicant: { name: string; programme: string }
  price: { amount: number; currency: string }
  mode: 'mock' | 'live'
  mobileMoneyPrices: Record<string, number>
}
type PaymentResult = {
  reference: string
  status: string
  method: Method
  amount: number
  currency: string
  nextAction: string
  note?: string
  redirectUrl?: string
  bankAccount?: { bankName?: string; accountName?: string; accountNumber?: string; expiresAt?: string }
}
type Bank = { code: string; name: string }

const methods: Array<{ id: Method; index: string; title: string; detail: string }> = [
  { id: 'card', index: '01', title: 'Card', detail: 'Visa, Mastercard and Verve' },
  { id: 'virtual_account', index: '02', title: 'Bank transfer', detail: 'One-time virtual account' },
  { id: 'ussd', index: '03', title: 'USSD', detail: 'Pay from a supported Nigerian bank' },
  { id: 'opay', index: '04', title: 'OPay', detail: 'Approve from your OPay account' },
  { id: 'mobile_money', index: '05', title: 'Mobile money', detail: 'Supported regional wallets' },
]

const mobileNetworks: Record<string, string[]> = {
  GHS: ['MTN', 'VODAFONE', 'AIRTELTIGO'],
  KES: ['MPESA'],
  UGX: ['MTN', 'AIRTEL'],
  RWF: ['MTN', 'AIRTEL'],
  XAF: ['MTN', 'ORANGE'],
  XOF: ['MTN', 'ORANGE', 'MOOV'],
}

const countryCodeByCurrency: Record<string, string> = { GHS: '233', KES: '254', UGX: '256', RWF: '250', XAF: '237', XOF: '225' }

function money(amount: number, currency: string) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount)
}

async function api<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(`/api/payments${path}`, {
    method: body ? 'POST' : 'GET',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
  const result = await response.json() as T & { error?: string }
  if (!response.ok) throw new Error(result.error || 'The payment service could not complete this request.')
  return result
}

function CheckoutBrand() {
  return <div className="standalone-brand-row payment-brand-row">
    <Link className="brand brand--light" to="/" aria-label="Guild Academy home"><img className="brand-logo" src="/brand/guild-academy-mark-transparent.png" alt=""/><span className="brand-name">Guild <b>Academy</b></span></Link>
    <ThemeToggle inverse/>
  </div>
}

export function PaymentPage() {
  const [searchParams] = useSearchParams()
  const [applicationId, setApplicationId] = useState(searchParams.get('application') || '')
  const [email, setEmail] = useState('')
  const [session, setSession] = useState<Session | null>(null)
  const [method, setMethod] = useState<Method>('card')
  const [banks, setBanks] = useState<Bank[]>([])
  const [bankCode, setBankCode] = useState('')
  const [card, setCard] = useState({ number: '', expiry: '', cvv: '' })
  const [phone, setPhone] = useState('')
  const [mobileCurrency, setMobileCurrency] = useState('')
  const [network, setNetwork] = useState('')
  const [result, setResult] = useState<PaymentResult | null>(null)
  const [authorization, setAuthorization] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const returnReference = searchParams.get('reference')

  useEffect(() => {
    if (method !== 'ussd' || banks.length) return
    api<{ banks: Bank[] }>('/banks').then(response => {
      setBanks(response.banks)
      setBankCode(response.banks[0]?.code || '')
    }).catch(caught => setError(caught instanceof Error ? caught.message : 'Supported banks could not be loaded.'))
  }, [banks.length, method])

  useEffect(() => {
    const firstCurrency = Object.keys(session?.mobileMoneyPrices || {})[0] || ''
    if (firstCurrency && !mobileCurrency) {
      setMobileCurrency(firstCurrency)
      setNetwork(mobileNetworks[firstCurrency]?.[0] || '')
    }
  }, [mobileCurrency, session])

  const verifyApplication = async (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const verified = await api<Session>('/session', { applicationId, email })
      setSession(verified)
      if (returnReference) {
        const payment = await api<PaymentResult>('/status', { sessionToken: verified.sessionToken, reference: returnReference })
        setResult(payment)
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Your application could not be verified.')
    } finally {
      setLoading(false)
    }
  }

  const initiate = async (event: FormEvent) => {
    event.preventDefault()
    if (!session) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const [expiryMonth = '', expiryYear = ''] = card.expiry.split('/').map(value => value.trim())
      const payment = await api<PaymentResult>('/initiate', {
        sessionToken: session.sessionToken,
        method,
        bankCode,
        phone,
        currency: mobileCurrency,
        countryCode: countryCodeByCurrency[mobileCurrency],
        network,
        card: { number: card.number, expiryMonth, expiryYear, cvv: card.cvv },
      })
      setCard({ number: '', expiry: '', cvv: '' })
      setResult(payment)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Payment could not be started.')
    } finally {
      setLoading(false)
    }
  }

  const authorize = async (event: FormEvent) => {
    event.preventDefault()
    if (!session || !result) return
    setLoading(true)
    setError('')
    try {
      const updated = await api<PaymentResult>('/authorize', { sessionToken: session.sessionToken, reference: result.reference, type: result.nextAction === 'requires_pin' ? 'pin' : 'otp', value: authorization })
      setAuthorization('')
      setResult(updated)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Card authorization could not be completed.')
    } finally {
      setLoading(false)
    }
  }

  const checkStatus = async () => {
    if (!session || !result) return
    setLoading(true)
    setError('')
    try { setResult(await api<PaymentResult>('/status', { sessionToken: session.sessionToken, reference: result.reference })) }
    catch (caught) { setError(caught instanceof Error ? caught.message : 'Payment status could not be checked.') }
    finally { setLoading(false) }
  }

  if (!session) return <main className="payment-shell payment-shell--verify">
    <section className="payment-intro"><CheckoutBrand/><div><span className="eyebrow eyebrow--light">Secure tuition checkout</span><h1>Match your<br/><em>application.</em></h1><p>Payment details become available only after your application reference and email match the admissions register.</p></div><small>FLUTTERWAVE V4 / SECURE SERVER FLOW</small></section>
    <section className="payment-verify-panel"><div className="payment-panel-head"><span>01 / VERIFICATION</span><Link to="/admissions">Exit checkout</Link></div><form onSubmit={verifyApplication}><h2>Find your application.</h2><p>Use the exact email address submitted with your application.</p><label>Application reference<input value={applicationId} onChange={event => setApplicationId(event.target.value)} required placeholder="00000000-0000-0000-0000-000000000000" autoComplete="off"/></label><label>Email address<input type="email" value={email} onChange={event => setEmail(event.target.value)} required placeholder="you@example.com" autoComplete="email"/></label>{error && <div className="payment-error" role="alert">{error}</div>}<button className="button" type="submit" disabled={loading}>{loading ? 'Checking…' : 'Continue to payment'} <Icon name="arrow" size={16}/></button></form><div className="payment-trust-note"><Icon name="shield"/><p><b>Your payment is matched server-side.</b><span>The browser cannot alter programme tuition or confirm a payment by itself.</span></p></div></section>
  </main>

  return <main className="payment-checkout">
    <aside className="payment-summary"><CheckoutBrand/><div><span className="eyebrow eyebrow--light">Guild Academy tuition</span><h1>{session.applicant.programme}</h1><dl><div><dt>Applicant</dt><dd>{session.applicant.name}</dd></div><div><dt>Payment</dt><dd>Full tuition</dd></div><div><dt>Amount due</dt><dd>{money(session.price.amount, session.price.currency)}</dd></div></dl>{session.mode === 'mock' && <div className="mode-banner"><b>Prototype mode</b><span>No money will move. The screens and records are for acceptance testing.</span></div>}<small>POWERED BY FLUTTERWAVE V4</small></div></aside>
    <section className="payment-workspace"><header><div><span>02 / PAYMENT METHOD</span><b>Choose how you want to pay</b></div><div><ThemeToggle/><button type="button" className="plain-button" onClick={() => { setSession(null); setResult(null) }}>Change application</button></div></header>
      <div className="payment-layout"><nav className="payment-methods" aria-label="Payment methods">{methods.map(item => <button key={item.id} className={method === item.id ? 'active' : ''} type="button" onClick={() => { setMethod(item.id); setResult(null); setError('') }}><span>{item.index}</span><b>{item.title}</b><small>{item.detail}</small><Icon name="chevron" size={16}/></button>)}</nav>
        <div className="payment-method-panel">
          {!result && <form onSubmit={initiate}>
            {method === 'card' && <><div className="method-heading"><span>CARD PAYMENT</span><h2>Pay securely<br/><em>with your card.</em></h2><p>Your card details are encrypted on the server and sent directly to Flutterwave. Guild Academy never writes them to its records.</p></div><label>Card number<input value={card.number} onChange={event => setCard(current => ({ ...current, number: event.target.value }))} required inputMode="numeric" autoComplete="cc-number" placeholder="0000 0000 0000 0000" maxLength={23}/></label><div className="payment-form-row"><label>Expiry<input value={card.expiry} onChange={event => setCard(current => ({ ...current, expiry: event.target.value }))} required inputMode="numeric" autoComplete="cc-exp" placeholder="MM / YY" maxLength={7}/></label><label>CVV<input type="password" value={card.cvv} onChange={event => setCard(current => ({ ...current, cvv: event.target.value }))} required inputMode="numeric" autoComplete="cc-csc" placeholder="•••" maxLength={4}/></label></div></>}
            {method === 'virtual_account' && <><div className="method-heading"><span>BANK TRANSFER</span><h2>Generate a<br/><em>one-time account.</em></h2><p>Flutterwave creates a temporary Nigerian bank account for this exact tuition amount. Transfer only the displayed amount before it expires.</p></div><div className="method-callout"><span>AMOUNT LOCKED</span><b>{money(session.price.amount, session.price.currency)}</b><small>The account is unique to this application and cannot be reused.</small></div></>}
            {method === 'ussd' && <><div className="method-heading"><span>USSD</span><h2>Pay without<br/><em>mobile data.</em></h2><p>Select your Nigerian bank. Flutterwave will return the bank-specific code and payment instruction.</p></div><label>Your bank<select value={bankCode} onChange={event => setBankCode(event.target.value)} required><option value="">Select a bank</option>{banks.map(bank => <option key={bank.code} value={bank.code}>{bank.name}</option>)}</select></label></>}
            {method === 'opay' && <><div className="method-heading"><span>OPAY</span><h2>Continue through<br/><em>your OPay account.</em></h2><p>Flutterwave will open the OPay authorization experience. You return here after approving or cancelling the payment.</p></div><div className="method-callout method-callout--opay"><span>OPAY CHECKOUT</span><b>{money(session.price.amount, session.price.currency)}</b><small>Keep this browser open while you approve the payment.</small></div></>}
            {method === 'mobile_money' && <><div className="method-heading"><span>MOBILE MONEY</span><h2>Pay from a<br/><em>supported wallet.</em></h2><p>Mobile money uses regional currencies and networks. Only prices configured and approved by Guild Academy are available.</p></div>{Object.keys(session.mobileMoneyPrices).length ? <><div className="payment-form-row"><label>Wallet currency<select value={mobileCurrency} onChange={event => { const currency = event.target.value; setMobileCurrency(currency); setNetwork(mobileNetworks[currency]?.[0] || '') }}>{Object.keys(session.mobileMoneyPrices).map(currency => <option key={currency}>{currency}</option>)}</select></label><label>Network<select value={network} onChange={event => setNetwork(event.target.value)} required>{(mobileNetworks[mobileCurrency] || []).map(item => <option key={item}>{item}</option>)}</select></label></div><label>Mobile wallet number<input value={phone} onChange={event => setPhone(event.target.value)} required inputMode="tel" autoComplete="tel" placeholder={`+${countryCodeByCurrency[mobileCurrency] || ''} …`}/></label></> : <div className="method-unavailable"><b>Regional pricing is not configured yet.</b><p>Use card, bank transfer, USSD or OPay for the published NGN tuition. Mobile money will open when a fixed local-currency price is approved.</p></div>}</>}
            {error && <div className="payment-error" role="alert">{error}</div>}
            {(method !== 'mobile_money' || Object.keys(session.mobileMoneyPrices).length > 0) && <button className="button payment-submit" type="submit" disabled={loading}>{loading ? 'Connecting securely…' : method === 'virtual_account' ? 'Generate account' : method === 'opay' ? 'Continue to OPay' : `Pay ${money(method === 'mobile_money' ? session.mobileMoneyPrices[mobileCurrency] || 0 : session.price.amount, method === 'mobile_money' ? mobileCurrency || 'NGN' : session.price.currency)}`} <Icon name="arrow" size={16}/></button>}
          </form>}

          {result && <section className={`payment-result payment-result--${result.status}`} aria-live="polite"><div className="result-status"><span><Icon name={result.status === 'succeeded' ? 'check' : 'clock'} size={22}/></span><div><small>{result.status === 'succeeded' ? 'PAYMENT CONFIRMED' : 'ACTION REQUIRED'}</small><h3>{result.status === 'succeeded' ? 'Payment complete.' : 'Complete your payment.'}</h3></div></div><dl><div><dt>Reference</dt><dd>{result.reference}</dd></div><div><dt>Amount</dt><dd>{money(result.amount, result.currency)}</dd></div><div><dt>Status</dt><dd>{result.status}</dd></div></dl>
            {result.bankAccount && <div className="bank-instruction"><span>{result.bankAccount.bankName}</span><strong>{result.bankAccount.accountNumber}</strong><b>{result.bankAccount.accountName}</b>{result.bankAccount.expiresAt && <small>Expires {new Date(result.bankAccount.expiresAt).toLocaleString()}</small>}<button type="button" onClick={() => navigator.clipboard.writeText(result.bankAccount?.accountNumber || '')}>Copy account number</button></div>}
            {error && <div className="payment-error" role="alert">{error}</div>}
            {(result.nextAction === 'requires_pin' || result.nextAction === 'requires_otp') && <form className="authorization-form" onSubmit={authorize}><label>{result.nextAction === 'requires_pin' ? 'Card PIN' : 'One-time password'}<input type="password" value={authorization} onChange={event => setAuthorization(event.target.value)} required inputMode="numeric" autoComplete="one-time-code" maxLength={result.nextAction === 'requires_pin' ? 6 : 8} placeholder={result.nextAction === 'requires_pin' ? '••••' : '000000'}/></label><button className="button" disabled={loading}>{loading ? 'Authorizing…' : 'Authorize payment'}</button></form>}
            {result.redirectUrl && <a className="button" href={result.redirectUrl}>Continue securely <Icon name="external" size={16}/></a>}
            {result.note && <p className="result-note">{result.note}</p>}
            {result.status !== 'succeeded' && <button className="button button--ghost-dark" type="button" onClick={checkStatus} disabled={loading}>{loading ? 'Checking…' : 'I have completed payment'}</button>}
          </section>}
        </div>
      </div>
    </section>
  </main>
}
