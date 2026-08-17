import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom'
import { ButtonLink, Icon, Metric, PageHero, ProgrammeCard, SectionHead, ThemeToggle } from './components'
import { alumniWins, communityEvents, ecosystemProofs, evidence, exploreNext, faqs, programmes, testimonials, type Evidence } from './data'

function CapabilityMap() {
  return <div className="capability-map" aria-label="Animated map connecting learning, practice, demonstrated work and enterprise readiness">
    <div className="map-grid"/><div className="map-orbit orbit-a"/><div className="map-orbit orbit-b"/>
    <div className="map-node node-core"><span>CAPABILITY</span><img src="/brand/guild-academy-mark-transparent.png" alt="Guild Academy"/></div>
    <div className="map-node node-learn"><i>01</i><b>Learn</b><span>fundamentals</span></div>
    <div className="map-node node-build"><i>02</i><b>Build</b><span>real systems</span></div>
    <div className="map-node node-proof"><i>03</i><b>Prove</b><span>your work</span></div>
    <div className="map-tag tag-a">04 / ENTERPRISE READY</div><div className="map-tag tag-b">LAB ACTIVE</div><div className="map-tag tag-c">OUTPUT VERIFIED</div>
    <svg className="map-lines" viewBox="0 0 620 540" aria-hidden="true"><path d="M308 267 155 134M312 269 480 132M310 273 472 410"/><circle cx="308" cy="267" r="94"/><path d="M155 134 480 132 472 410Z"/></svg>
  </div>
}

const learningSteps = [
  ['01', 'Learn', 'Build durable foundations before abstraction.'], ['02', 'Practise', 'Work in guided labs designed around real systems.'], ['03', 'Review', 'Read code, systems and evidence with a critical eye.'], ['04', 'Build', 'Turn concepts into functioning technical work.'], ['05', 'Test', 'Break assumptions safely and document what happens.'], ['06', 'Write', 'Communicate reasoning, findings and trade-offs clearly.'], ['07', 'Demonstrate', 'Present work that another person can inspect.'],
]

function ProofGallery({ compact = false }: { compact?: boolean }) {
  const types = ['All', ...Array.from(new Set(evidence.map(item => item.type)))]
  const [filter, setFilter] = useState('All')
  const filtered = filter === 'All' ? evidence : evidence.filter(item => item.type === filter)
  return <div className="proof-gallery">
    {!compact && <div className="filter-row" role="group" aria-label="Filter evidence">{types.map(type => <button type="button" className={filter === type ? 'active' : ''} key={type} onClick={() => setFilter(type)}>{type}</button>)}</div>}
    <div className="evidence-grid" aria-live="polite">{filtered.slice(0, compact ? 3 : undefined).map((item, index) => <EvidenceCard key={item.title} item={item} index={index}/>)}</div>
  </div>
}

function EvidenceCard({ item, index }: { item: Evidence; index: number }) {
  const external = item.href.startsWith('http')
  const content = <><div className="evidence-art"><span>0{index + 1}</span><div className="scan-lines"/><i>{item.type}</i></div><div className="evidence-copy"><div className="verified"><Icon name="check" size={14}/> Source verified</div><h3>{item.title}</h3><p>{item.description}</p><small>{item.meta}</small><span className="evidence-link">Inspect evidence <Icon name={external ? 'external' : 'arrow'} size={15}/></span></div></>
  return external ? <a className="evidence-card reveal" href={item.href} target="_blank" rel="noreferrer">{content}</a> : <Link className="evidence-card reveal" to={item.href}>{content}</Link>
}

function WinsGrid({ limit }: { limit?: number }) {
  return <div className="wins-grid">{alumniWins.slice(0, limit).map((win, index) => <a className={`win-card reveal ${win.media ? 'win-card--media' : ''}`} href={win.href} target="_blank" rel="noreferrer" key={`${win.person}-${win.result}`}>{win.media && <img src={win.media} alt={win.mediaAlt}/>}<div><span>0{index + 1}</span><Icon name="external" size={15}/></div><strong>{win.result}</strong><h3>{win.field}</h3><p>{win.detail}</p>{win.signal && <small className="win-signal">{win.signal} · observed 17 Aug 2026</small>}<footer><b>{win.person}</b><span>{win.handle}</span></footer></a>)}</div>
}

function AlumniProofSection() {
  return <section className="section alumni-proof-section" id="alumni-proof">
    <SectionHead label="04 / Alumni signal" title={<>What learners say.<br/><em>Where their work lands.</em></>} body="Direct learner statements and public competition outcomes, each linked to the original X post. Individual results are evidence, not a promise of identical outcomes." action={<a className="inline-link" href="https://x.com/GuildAcademy_" target="_blank" rel="noreferrer">Review the X record <Icon name="external"/></a>}/>
    <div className="testimonial-stage">
      <a className="x-evidence-frame reveal" href={testimonials[0].href} target="_blank" rel="noreferrer"><img src="/evidence/alumni-roy-x.png?v=2" alt="Public X post from 0x_Roy thanking Guild Academy for sharpening his security skills"/><div><span><Icon name="check" size={14}/> Source capture</span><b>First Web3 security win</b><small>Open the original post <Icon name="external" size={13}/></small></div></a>
      <div className="testimonial-quotes">{testimonials.map((item, index) => <a className="testimonial-card reveal" href={item.href} target="_blank" rel="noreferrer" key={item.handle}><span className="quote-mark">“</span><small>{item.context}</small><blockquote>{item.quote}</blockquote><p>{item.detail}</p><span className="social-signal"><Icon name="check" size={13}/>{item.signal}<small>Observed 17 Aug 2026</small></span><footer><div><b>{item.name}</b><span>{item.handle}</span></div><i>0{index + 1}</i></footer></a>)}</div>
    </div>
    <div className="wins-heading"><span className="eyebrow">Alumni in the field</span><p>Public results from security competitions and audit platforms.</p></div>
    <WinsGrid limit={4}/>
    <div className="ecosystem-proof-list">{ecosystemProofs.map((item, index) => <a className={`ecosystem-proof ecosystem-proof--${index + 1} reveal`} href={item.href} target="_blank" rel="noreferrer" key={item.href}><div><span className="eyebrow">Ecosystem proof / 0{index + 1}</span><strong>{item.title}</strong></div><div><h3>{item.subject}</h3><p>{item.description}</p><small>{item.signal} · observed 17 Aug 2026</small></div><Icon name="external"/></a>)}</div>
  </section>
}

export function HomePage() {
  const [activeStep, setActiveStep] = useState(0)
  return <>
    <section className="home-hero">
      <div className="hero-noise"/><div className="hero-layout">
        <div className="hero-copy reveal"><span className="eyebrow eyebrow--light">Education / Talent / Practice</span><h1>Learn deeply.<br/><em>Build practically.</em><br/>Demonstrate capability.</h1><p>Guild Academy is a technical learning community for people who want to turn serious study into real, inspectable work.</p><div className="hero-actions"><ButtonLink to="/programs">Explore programmes</ButtonLink><a className="button button--ghost" href="#proof">See the proof <Icon name="arrow" size={16}/></a></div></div>
        <div className="hero-visual reveal"><CapabilityMap/></div>
      </div>
      <div className="hero-foot"><span>AFRICA-ROOTED / GLOBALLY CONNECTED</span><span>SCROLL TO INSPECT ↓</span></div>
    </section>

    <section className="proof-strip" id="proof" aria-label="Verified programme outcomes">
      <Metric value="16" label="weeks of intensive security learning" note="Smart Contract Security"/>
      <Metric value="40+" label="researchers in Cohort V" note="Across four continents"/>
      <Metric value="110+" label="vulnerabilities reported" note="Cohort IV report"/>
      <Metric value="25+" label="competitive audits" note="Cohort IV report"/>
    </section>

    <section className="section section--bone programmes-section">
      <SectionHead label="01 / Find your field" title={<>Choose a path.<br/><em>Produce the proof.</em></>} body={`${programmes.length} cohort-led programmes. One standard: learning becomes work another person can inspect.`} action={<Link className="inline-link" to="/programs">View the full catalogue <Icon name="arrow"/></Link>}/>
      <div className="programme-grid">{programmes.map((programme, index) => <ProgrammeCard key={programme.slug} programme={programme} index={index}/>)}</div>
    </section>

    <section className="section section--ink learning-section">
      <SectionHead label="02 / The Guild Method" title={<>You do not only watch lessons.<br/><em>You produce evidence.</em></>} body="Every stage creates a stronger technical signal: reasoning, code, systems, reports or demonstrable work."/>
      <div className="learning-layout">
        <div className="step-list">{learningSteps.map(([number, title, body], index) => <button type="button" key={title} className={activeStep === index ? 'active' : ''} onClick={() => setActiveStep(index)}><span>{number}</span><b>{title}</b><Icon name="arrow"/></button>)}</div>
        <div className="step-stage" aria-live="polite"><span className="stage-index">{learningSteps[activeStep][0]} / 07</span><div className="stage-glyph"><i/><i/><i/><b>{learningSteps[activeStep][0]}</b></div><h3>{learningSteps[activeStep][1]}</h3><p>{learningSteps[activeStep][2]}</p><small>OUTPUT: REVIEWABLE WORK</small></div>
      </div>
    </section>

    <section className="section section--mist">
      <SectionHead label="03 / Evidence library" title={<>Work,<br/><em>not marketing.</em></>} body="Claims should be inspectable. Explore the reports, repositories, research and technical writing behind the Academy." action={<Link className="inline-link" to="/labs">Open the evidence library <Icon name="arrow"/></Link>}/>
      <ProofGallery compact/>
    </section>

    <AlumniProofSection/>

    <section className="section section--community">
      <div className="community-grid"><div className="community-copy reveal"><span className="eyebrow">05 / Belong to the work</span><h2>Technical growth<br/>is stronger <em>together.</em></h2><p>Learn with peers who review your work, mentors who challenge your assumptions, and a community that keeps building beyond class.</p><ButtonLink to="/community" variant="secondary">Enter the community</ButtonLink></div><div className="community-board reveal"><div className="board-card board-card--large"><span>WEEKLY RHYTHM</span><b>Office hours</b><p>Bring blockers. Leave with a clearer next move.</p></div><div className="board-card"><span>REVIEW</span><b>Peer critique</b></div><div className="board-card board-card--accent"><span>LIVE</span><b>Demo day</b></div><div className="board-card"><span>ONGOING</span><b>Alumni sessions</b></div><div className="board-line"/></div></div>
    </section>

    <section className="section section--partner"><div className="partner-panel reveal"><div><span className="eyebrow eyebrow--light">06 / For organisations</span><h2>Build stronger<br/><em>technical capability.</em></h2></div><div><p>Custom workforce training, ecosystem programmes, workshops and talent collaboration built around your context.</p><ButtonLink to="/partnerships">Partner with the Academy</ButtonLink></div></div></section>

    <FAQSection/>
  </>
}

function FAQSection() {
  const [open, setOpen] = useState(0)
  return <section className="section section--bone faq-section"><SectionHead label="07 / Before you apply" title="Questions, answered." body="Clarity is part of the product. If a decision fact is missing, we should fix the page before asking for commitment."/><div className="faq-list">{faqs.map(([question, answer], index) => <div className={`faq-item ${open === index ? 'open' : ''}`} key={question}><button type="button" aria-expanded={open === index} onClick={() => setOpen(open === index ? -1 : index)}><span>0{index + 1}</span><b>{question}</b><i>+</i></button><div className="faq-answer"><p>{answer}</p></div></div>)}</div></section>
}

export function ProgrammesPage() {
  const [interest, setInterest] = useState<string | null>(null)
  return <>
    <PageHero label="Programme catalogue / 2026" title={<>Choose the work<br/>you want to <em>prove.</em></>} body="Each path publishes the commitment, price, readiness level and evidence you will produce. No vague promises. No hidden workload."><ButtonLink to="/admissions">Understand admissions</ButtonLink></PageHero>
    <section className="section section--bone"><div className="catalogue-intro"><span className="mono">{programmes.length} FLAGSHIP COHORTS</span><p>Applications and waitlists are managed programme by programme. Dates are published only after faculty and delivery readiness are confirmed.</p></div><div className="programme-grid programme-grid--catalogue">{programmes.map((programme, index) => <ProgrammeCard key={programme.slug} programme={programme} index={index}/>)}</div></section>
    <section className="section section--ink explore-section"><SectionHead label="Explore next" title={<>Help shape what<br/><em>we open next.</em></>} body="These areas are being demand-tested. Joining an interest list is not an application or promise of a cohort."/><div className="explore-grid">{exploreNext.map((name, index) => <button className="explore-card" type="button" key={name} onClick={() => setInterest(name)}><span>0{index + 1}</span><b>{name}</b><small>Join interest list</small><Icon name="arrow"/></button>)}</div></section>
    {interest && <InterestModal programme={interest} onClose={() => setInterest(null)}/>}
  </>
}

function InterestModal({ programme, onClose }: { programme: string; onClose: () => void }) {
  const [done, setDone] = useState(false)
  return <div className="modal-backdrop" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="interest-title"><button className="modal-close" onClick={onClose} aria-label="Close"><Icon name="close"/></button>{done ? <div className="form-success"><span><Icon name="check"/></span><h2>Interest noted.</h2><p>This preview stores no submission externally. Connect the production form before launch.</p><button className="button" onClick={onClose}>Close</button></div> : <><span className="eyebrow">Explore next</span><h2 id="interest-title">{programme}</h2><p>Tell us where to send curriculum and cohort announcements when this programme is validated.</p><form onSubmit={e => { e.preventDefault(); setDone(true) }}><label>Email address<input required type="email" placeholder="you@example.com"/></label><label>Current experience<select required defaultValue=""><option value="" disabled>Select one</option><option>Exploring the field</option><option>Some practical experience</option><option>Working professional</option></select></label><button className="button" type="submit">Join interest list <Icon name="arrow"/></button></form></>}</section></div>
}

export function ProgrammeDetailPage() {
  const { slug } = useParams()
  const programme = programmes.find(item => item.slug === slug)
  if (!programme) return <Navigate to="/programs" replace/>
  return <>
    <section className={`programme-hero accent-${programme.accent}`}><div className="programme-hero-main reveal"><Link className="back-link" to="/programs">← All programmes</Link><div className="programme-kicker"><span className="mono">{programme.code}</span><span className={`status status--${programme.status.toLowerCase().replaceAll(' ', '-')}`}>{programme.status}</span></div><h1>{programme.name}</h1><p>{programme.descriptor}</p><div className="hero-actions"><ButtonLink to={`/apply?programme=${programme.slug}`}>{programme.status === 'Open' ? 'Start application' : 'Join programme list'}</ButtonLink><a className="button button--ghost" href="#curriculum">View curriculum ↓</a></div></div><div className="programme-dossier reveal"><span className="dossier-title">PROGRAMME DOSSIER / {programme.code}</span><dl><div><dt>Duration</dt><dd>{programme.duration}</dd></div><div><dt>Weekly commitment</dt><dd>{programme.workload}</dd></div><div><dt>Delivery</dt><dd>{programme.format}</dd></div><div><dt>Level</dt><dd>{programme.level}</dd></div><div><dt>Cohort capacity</dt><dd>{programme.capacity} learners</dd></div><div><dt>Tuition</dt><dd>{programme.price}<small>{programme.usd} USD reference</small></dd></div></dl><small className="dossier-note">USD reference uses a fixed display rate. Nigeria-based payments are charged in NGN.</small></div></section>
    <nav className="anchor-nav" aria-label="Programme page sections"><a href="#outcome">Outcome</a><a href="#curriculum">Curriculum</a><a href="#evidence">Evidence</a><a href="#admissions">Admissions</a></nav>
    <section className="section section--bone programme-story" id="outcome"><div className="story-index">01</div><div><span className="eyebrow">The outcome</span><h2>What you will be able<br/>to <em>do.</em></h2></div><div><p className="lead">{programme.outcome}</p><p><b>Designed for:</b> {programme.audience}</p></div></section>
    <section className="section section--mist curriculum-section" id="curriculum"><SectionHead label="02 / Curriculum" title={<>A sequence built<br/>for <em>mastery.</em></>} body="Modules build toward the capstone. The programme team may refine tools and case studies while preserving published outcomes."/><div className="curriculum-list">{programme.curriculum.map((module, index) => <article key={module}><span>{String(index + 1).padStart(2, '0')}</span><div><small>MODULE {String(index + 1).padStart(2, '0')}</small><h3>{module}</h3></div><i>{index === programme.curriculum.length - 1 ? 'CAPSTONE' : `${index + 1}/${programme.curriculum.length}`}</i></article>)}</div></section>
    <section className="section section--ink evidence-output" id="evidence"><SectionHead label="03 / Evidence produced" title={<>Leave with work.<br/><em>Not just a certificate.</em></>} body="Completion depends on meaningful work, review and demonstration. A certificate alone does not imply professional competence."/><div className="output-grid">{programme.evidence.map((item, index) => <div key={item}><span>0{index + 1}</span><Icon name={index % 2 ? 'book' : 'lab'} size={32}/><h3>{item}</h3><small>REVIEWABLE OUTPUT</small></div>)}</div></section>
    <section className="section section--bone admissions-fit" id="admissions"><div><span className="eyebrow">04 / Readiness</span><h2>Is this the<br/><em>right fit?</em></h2><p>Admissions protects both the learner and the cohort. Review the requirements before committing.</p></div><div className="requirements-card"><h3>Admission requirements</h3>{programme.requirements.map(item => <p key={item}><Icon name="check" size={18}/>{item}</p>)}<hr/><dl><div><dt>Upfront</dt><dd>{programme.price}</dd></div><div><dt>Installment</dt><dd>{programme.instalment}</dd></div></dl><ButtonLink to={`/apply?programme=${programme.slug}`}>{programme.status === 'Open' ? 'Start application' : 'Register your interest'}</ButtonLink></div></section>
  </>
}

export function AdmissionsPage() {
  const stages = [['01','Discover','Compare the programme outcome, level, workload and price.'],['02','Apply','Share your readiness, availability and relevant work.'],['03','Qualify','Complete an assessment or interview where required.'],['04','Offer','Receive a clear offer, terms and payment route.'],['05','Onboard','Meet the cohort, tools, expectations and support team.']]
  return <><PageHero label="Admissions / Clear by design" title={<>A serious path,<br/>with <em>no hidden steps.</em></>} body="Admissions exists to protect programme fit. Acceptance reflects your ability to benefit from the cohort, not merely willingness to pay."><ButtonLink to="/apply">Start your application</ButtonLink></PageHero><section className="section section--bone"><SectionHead label="The admissions path" title="Know what happens next." body="Each programme may add a readiness exercise, but the experience and decision status should always be visible."/><div className="admissions-steps">{stages.map(([number,title,body]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{body}</p></article>)}</div></section><section className="section section--mist payment-section"><div><span className="eyebrow">Tuition / Access</span><h2>Transparent pricing.<br/><em>Structured access.</em></h2><p>Admissions is free. Payment begins only after an offer is accepted. Scholarship language is used only when funding and selection rules are confirmed.</p><ButtonLink to="/pay" variant="secondary">Open secure payment</ButtonLink></div><div className="payment-options"><article><span>01</span><h3>Upfront</h3><p>Pay the published programme tuition before onboarding.</p></article><article><span>02</span><h3>Four-part plan</h3><p>Use the cohort-specific installment schedule shown on the programme page.</p></article><article><span>03</span><h3>Payment routes</h3><p>Use card, a one-time bank account, USSD, OPay or an enabled mobile-money wallet through Flutterwave.</p></article></div></section><FAQSection/></>
}

type ApplicationData = {
  programme: string
  name: string
  email: string
  location: string
  experience: string
  hours: string
  portfolio: string
  motivation: string
}

const emptyApplication: ApplicationData = { programme: '', name: '', email: '', location: '', experience: '', hours: '', portfolio: '', motivation: '' }
const applicationSteps = ['Programme', 'Personal', 'Readiness', 'Evidence', 'Motivation', 'Review', 'Confirmation']

export function ApplyPage() {
  const [searchParams] = useSearchParams()
  const [step, setStep] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [consent, setConsent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submissionError, setSubmissionError] = useState('')
  const [submissionReference, setSubmissionReference] = useState('')
  const submissionId = useRef(crypto.randomUUID())
  const [data, setData] = useState<ApplicationData>(() => {
    const stored = localStorage.getItem('guild-academy-application')
    const restored = stored ? JSON.parse(stored) as ApplicationData : emptyApplication
    return { ...emptyApplication, ...restored, programme: searchParams.get('programme') || restored.programme }
  })

  useEffect(() => localStorage.setItem('guild-academy-application', JSON.stringify(data)), [data])
  const update = (key: keyof ApplicationData, value: string) => setData(current => ({ ...current, [key]: value }))
  const valid = useMemo(() => {
    if (step === 0) return Boolean(data.programme)
    if (step === 1) return Boolean(data.name && data.email && data.location)
    if (step === 2) return Boolean(data.experience && data.hours)
    if (step === 3) return true
    if (step === 4) return data.motivation.trim().length >= 40
    if (step === 5) return consent
    return true
  }, [consent, data, step])

  const continueApplication = async (event: FormEvent) => {
    event.preventDefault()
    if (!valid || submitting) return
    if (step === 5) {
      setSubmitting(true)
      setSubmissionError('')
      try {
        const response = await fetch('/api/applications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...data, consent, submissionId: submissionId.current }),
        })
        const result = await response.json() as { submissionId?: string; error?: string }
        if (!response.ok || !result.submissionId) throw new Error(result.error || 'Your application could not be recorded. Please try again.')
        setSubmissionReference(result.submissionId)
        setSubmitted(true)
        setStep(6)
        localStorage.removeItem('guild-academy-application')
      } catch (error) {
        setSubmissionError(error instanceof Error ? error.message : 'Your application could not be recorded. Please try again.')
      } finally {
        setSubmitting(false)
      }
      return
    }
    setStep(current => Math.min(6, current + 1))
  }

  return <section className="application-shell">
    <aside className="application-aside"><div className="standalone-brand-row"><Link className="brand brand--light" to="/"><img className="brand-logo" src="/brand/guild-academy-mark-transparent.png" alt=""/><span className="brand-name">Guild <b>Academy</b></span></Link><ThemeToggle inverse/></div><div className="application-aside-copy"><span className="eyebrow eyebrow--light">Admissions workspace</span><h1>Build your<br/><em>application.</em></h1><p>Your progress is saved on this device until you submit. Completed applications are recorded in the Guild Academy admissions register.</p></div><small>APPLICATION / 2026</small></aside>
    <div className="application-main"><header className="application-progress"><div><span>STEP {String(step + 1).padStart(2, '0')}</span><b>{applicationSteps[step]}</b></div><div className="progress-track"><i style={{ width: `${((step + 1) / applicationSteps.length) * 100}%` }}/></div><small>{step + 1} of {applicationSteps.length}</small></header>
      <form className="application-form" onSubmit={continueApplication}>
        {step === 0 && <fieldset><legend>Which field do you want to pursue?</legend><p>Select the programme that best matches the work you want to produce.</p><div className="choice-grid">{programmes.map(programme => <label className={data.programme === programme.slug ? 'selected' : ''} key={programme.slug}><input type="radio" name="programme" value={programme.slug} checked={data.programme === programme.slug} onChange={event => update('programme', event.target.value)}/><span>{programme.code}</span><b>{programme.name}</b><small>{programme.status} / {programme.duration}</small></label>)}</div></fieldset>}
        {step === 1 && <fieldset><legend>Tell us who you are.</legend><p>Use information the admissions team can use to contact you.</p><div className="form-grid"><label>Full name<input value={data.name} onChange={event => update('name', event.target.value)} required placeholder="Your full name"/></label><label>Email address<input type="email" value={data.email} onChange={event => update('email', event.target.value)} required placeholder="you@example.com"/></label><label className="span-2">City and country<input value={data.location} onChange={event => update('location', event.target.value)} required placeholder="Lagos, Nigeria"/></label></div></fieldset>}
        {step === 2 && <fieldset><legend>Can this cohort fit your life?</legend><p>Honest readiness is more useful than a perfect answer.</p><div className="form-grid"><label>Current experience<select value={data.experience} onChange={event => update('experience', event.target.value)} required><option value="">Select one</option><option>New to this field</option><option>Some guided practice</option><option>Independent project experience</option><option>Working professional</option></select></label><label>Hours available each week<select value={data.hours} onChange={event => update('hours', event.target.value)} required><option value="">Select one</option><option>Fewer than 8 hours</option><option>8-12 hours</option><option>13-18 hours</option><option>19+ hours</option></select></label></div></fieldset>}
        {step === 3 && <fieldset><legend>Show us where you are starting.</legend><p>A portfolio is helpful, not mandatory. Link code, writing, research or any relevant work.</p><label>Portfolio or profile URL <span className="optional">Optional</span><input type="url" value={data.portfolio} onChange={event => update('portfolio', event.target.value)} placeholder="https://github.com/your-name"/></label><div className="form-note"><Icon name="shield"/><div><b>Evidence can be early-stage.</b><p>We are looking for initiative and learning habits, not a polished professional identity.</p></div></div></fieldset>}
        {step === 4 && <fieldset><legend>Why this work, and why now?</legend><p>Explain the capability you want to build and how you intend to use it.</p><label>Your response<textarea value={data.motivation} onChange={event => update('motivation', event.target.value)} minLength={40} rows={8} placeholder="I want to build..."/><small>{data.motivation.length} characters / 40 minimum</small></label></fieldset>}
        {step === 5 && <fieldset><legend>Review and submit.</legend><p>Check the information below. You can return to any earlier stage before sending your application.</p><div className="review-list">{Object.entries(data).map(([key, value]) => <div key={key}><span>{key}</span><b>{value || 'Not provided'}</b></div>)}</div><label className="consent"><input type="checkbox" required checked={consent} onChange={event => setConsent(event.target.checked)}/><span>I confirm that this information is accurate and consent to Guild Academy storing and processing it for admissions.</span></label>{submissionError && <div className="submission-error" role="alert"><b>Submission not recorded.</b><span>{submissionError}</span></div>}</fieldset>}
        {step === 6 && <div className="application-complete"><span><Icon name="check" size={30}/></span><small>APPLICATION RECEIVED</small><h2>{submitted ? 'Your application is in.' : 'Application received.'}</h2><p>Your information has been recorded in the Guild Academy admissions register. Keep the reference below for any admissions enquiry.</p><code className="submission-reference">{submissionReference}</code><div className="completion-actions"><ButtonLink to={`/pay?application=${encodeURIComponent(submissionReference)}`}>Open secure payment</ButtonLink><ButtonLink to="/programs" variant="secondary">Return to programmes</ButtonLink></div><small className="completion-note">Only make payment after Guild Academy confirms your offer and instructs you to continue.</small></div>}
        {step < 6 && <footer className="form-actions">{step > 0 ? <button type="button" className="button button--ghost-dark" onClick={() => setStep(current => current - 1)} disabled={submitting}>← Back</button> : <Link className="button button--ghost-dark" to="/programs">← Exit</Link>}<button type="submit" className="button" disabled={!valid || submitting}>{step === 5 ? (submitting ? 'Submitting…' : 'Submit application') : 'Continue'} <Icon name="arrow"/></button></footer>}
      </form>
    </div>
  </section>
}

export function LabsPage() {
  return <><PageHero label="Labs & research / Inspect the work" title={<>Evidence is the<br/><em>real credential.</em></>} body="Open programme reports, research outputs, technical repositories and postmortems created through Guild Academy learning."><ButtonLink to="https://github.com/GuildAudits/hack-lab" external>Open Hack Lab</ButtonLink></PageHero><section className="section section--bone"><SectionHead label="Verified evidence library" title={<>Claims you can<br/><em>trace.</em></>} body="Every published figure here is tied to an Academy report or a public repository. Future work will be added only when a source can be inspected."/><ProofGallery/></section><section className="section section--ink lab-principles"><SectionHead label="The lab standard" title="How work becomes evidence."/><div className="principle-grid">{[['01','Reproduce','Start from a real system, failure mode or technical question.'],['02','Reason','Record assumptions, methods and trade-offs, not only the final answer.'],['03','Review','Put the work in front of peers, mentors or an inspectable process.'],['04','Publish','Share what is safe and useful so others can learn from it.']].map(([n,t,b]) => <article key={n}><span>{n}</span><h3>{t}</h3><p>{b}</p></article>)}</div></section></>
}

export function OutcomesPage() {
  return <><PageHero label="Outcomes / Source verified" title={<>Measure the work.<br/><em>Not the hype.</em></>} body="The strongest current proof comes from Guild Academy's smart contract security cohorts. Broader programme outcomes will be published as those tracks run."><ButtonLink to="/labs">Inspect evidence</ButtonLink></PageHero><section className="proof-strip proof-strip--light"><Metric value="5" label="security cohorts completed" note="Programme history"/><Metric value="40+" label="Cohort V researchers" note="Four continents"/><Metric value="110+" label="Cohort IV findings" note="Vulnerabilities reported"/><Metric value="22+" label="incident postmortems" note="Cohort V"/></section><section className="section section--bone"><SectionHead label="Cohort record" title={<>A growing body<br/>of <em>technical work.</em></>} body="These are programme outputs, not job-placement claims. Employment and salary statistics will not be published until a reliable follow-up method exists."/><div className="cohort-record"><article><span>COHORT IV</span><h3>Audit depth</h3><div><b>25+</b><small>competitive audits</small></div><div><b>110+</b><small>vulnerabilities reported</small></div><p>Eight core areas covered across a 16-week programme.</p></article><article className="featured"><span>COHORT V</span><h3>Research breadth</h3><div><b>40+</b><small>researchers</small></div><div><b>25+</b><small>hacks replayed</small></div><p>Participants represented four continents and produced more than 22 postmortems.</p></article></div></section><section className="section outcome-wins"><SectionHead label="Public field record" title={<>Results with<br/><em>receipts.</em></>} body="Leaderboard placements, validated findings and audit wins shared publicly by learners or the Academy. Open any card to inspect the original post and its attached result screenshot."/><WinsGrid/></section><section className="section section--mist"><SectionHead label="What comes next" title="A stronger outcome system." body="Every new programme should track capability evidence from application through alumni follow-up."/><div className="outcome-system">{['Entry readiness baseline','Module review evidence','Capstone assessment','Publication or portfolio signal','90-day alumni follow-up'].map((item,index)=><div key={item}><span>0{index+1}</span><b>{item}</b></div>)}</div></section></>
}

export function CommunityPage() {
  return <><PageHero label="Community / Learning in public" title={<>A place to practise<br/>being <em>serious.</em></>} body="Guild Academy is built as an ongoing technical community, not a classroom that disappears after graduation."><ButtonLink to="/apply">Join through a programme</ButtonLink></PageHero><section className="section section--bone community-record"><SectionHead label="Field record / Source verified" title={<>Sessions, service<br/>and <em>shared stages.</em></>} body="A selection of public activity from the Academy and the wider Guild ecosystem. Each record states our role and links to its source on X."/><div className="event-grid">{communityEvents.map((event, index) => <a className={`event-card event-card--${event.accent} reveal`} href={event.href} target="_blank" rel="noreferrer" key={event.href}><header><span>0{index + 1}</span><small>{event.role}</small><Icon name="external" size={15}/></header><div><time>{event.date}</time><h3>{event.title}</h3><p>{event.description}</p></div><footer><Icon name="check" size={13}/>{event.signal}<small>Observed 17 Aug 2026</small></footer></a>)}</div></section><section className="section section--mist"><SectionHead label="Community rhythm" title="The spaces around class." body="Dates are published per cohort. These are the recurring formats that sustain learning beyond formal lessons."/><div className="community-formats">{[['Office hours','Bring a blocker, leave with a clearer technical next step.','WEEKLY'],['Peer review circles','Read work closely and learn to give useful technical feedback.','COHORT'],['Research sessions','Investigate a tool, failure, paper or system with other builders.','OPEN'],['Demo days','Present what works, what failed and what you learned.','MILESTONE'],['Alumni exchanges','Keep sharing opportunities, methods and field intelligence.','ONGOING'],['Local meet-ups','Create smaller, trusted points of connection across regions.','COMMUNITY']].map(([t,b,k],i)=><article key={t}><span>0{i+1}</span><small>{k}</small><h3>{t}</h3><p>{b}</p></article>)}</div></section><section className="section section--ink community-code"><div><span className="eyebrow eyebrow--light">The culture</span><h2>Generous with knowledge.<br/><em>Rigorous with claims.</em></h2></div><div className="code-list">{['Show the work behind the answer.','Critique ideas without diminishing people.','Protect private systems and responsible disclosure.','Give credit clearly and correct mistakes publicly.','Make room for learners across experience levels.'].map((item,index)=><p key={item}><span>0{index+1}</span>{item}</p>)}</div></section></>
}

export function PartnershipsPage() {
  return <><PageHero label="Partnerships / Capability at scale" title={<>Build the programme<br/>your people <em>need.</em></>} body="Guild Academy works with organisations, ecosystems and communities on training, workshops and talent-development initiatives."><a className="button" href="#partner-form">Start a conversation <Icon name="arrow"/></a></PageHero><section className="section section--bone"><SectionHead label="Ways to partner" title="Built around the context." body="The final scope, faculty, delivery model and success measures are agreed before public promotion."/><div className="partner-offers">{[['01','Workforce academy','Cohort-based capability development for internal technical teams.'],['02','Ecosystem programme','Sponsored learning for a developer, security or innovation community.'],['03','Workshop series','Focused, practical interventions around a defined technical need.'],['04','Talent collaboration','Capstones, technical challenges and opportunities for demonstrated learners.']].map(([n,t,b])=><article key={n}><span>{n}</span><h3>{t}</h3><p>{b}</p></article>)}</div></section><PreviewContact id="partner-form" heading="Tell us what capability you need." context="partnership"/></>
}

function PreviewContact({ id, heading, context }: { id: string; heading: string; context: string }) {
  const [sent, setSent] = useState(false)
  return <section className="section section--mist contact-panel" id={id}><div><span className="eyebrow">Start the conversation</span><h2>{heading}</h2><p>This frontend demonstrates the complete experience. A secure CRM or email destination must be connected before launch.</p></div>{sent ? <div className="form-success inline"><span><Icon name="check"/></span><h3>Brief prepared.</h3><p>No external message was sent from this prototype.</p><button className="button" onClick={()=>setSent(false)}>Start another</button></div> : <form onSubmit={event => { event.preventDefault(); setSent(true) }}><label>Name<input required placeholder="Your name"/></label><label>Work email<input required type="email" placeholder="you@organisation.com"/></label><label>Organisation<input required placeholder="Organisation name"/></label><label>What are you trying to achieve?<textarea required minLength={30} rows={5} placeholder={`Tell us about the ${context}, audience and desired outcome.`}/></label><button className="button" type="submit">Prepare enquiry <Icon name="arrow"/></button></form>}</section>
}

export function AboutPage() {
  return <><PageHero label="About / Guild Technologies" title={<>An academy built<br/>around <em>capability.</em></>} body="Guild Academy is the education and talent-development pillar of Guild Technologies, created to help people learn deeply, practise deliberately and demonstrate real work."><ButtonLink to="/programs">Explore programmes</ButtonLink></PageHero><section className="section section--bone about-manifesto"><div><span className="eyebrow">Our position</span><h2>Education should leave<br/>something <em>inspectable.</em></h2></div><div><p>Technical learning loses value when it becomes passive consumption. Guild Academy centres the cycle of learning, practice, review, building, testing, writing and demonstration.</p><p>We are Africa-rooted and globally connected. That means designing for local realities without lowering the technical standard, and building routes for learners to participate in a wider field.</p></div></section><section className="section section--ink"><SectionHead label="Operating principles" title="What guides the product."/><div className="principle-grid">{[['01','Proof over promise','We publish evidence and identify assumptions.'],['02','Practice over passivity','Learners make, test, review and explain.'],['03','Clarity over pressure','Decisions, pricing and workload should be visible.'],['04','Community over isolation','Growth continues through peers and alumni.']].map(([n,t,b])=><article key={n}><span>{n}</span><h3>{t}</h3><p>{b}</p></article>)}</div></section></>
}

export function ContactPage() { return <><PageHero label="Contact / Find the right route" title={<>Bring us a question.<br/><em>Leave with direction.</em></>} body="Use this route for admissions, programme, community or general Academy questions."/><PreviewContact id="contact-form" heading="What can we help you resolve?" context="question"/></> }

export function InsightsPage() {
  const posts = [['FIELD NOTE 01','Why technical evidence matters more than completion theatre','A framework for designing programmes around observable capability.'],['COHORT V','From exploit replay to incident postmortem','How security learners moved from historical attacks to structured technical analysis.'],['PROGRAMME DESIGN','What a serious weekly workload actually means','A transparent way to think about live sessions, labs, review and independent practice.']]
  return <><PageHero label="Insights / Notes from the field" title={<>Ideas for people<br/>who take <em>practice seriously.</em></>} body="Programme thinking, research notes and learning methods from the Guild Academy community."/><section className="section section--bone"><div className="insight-grid">{posts.map(([k,t,b],i)=><article key={t}><div className="insight-art"><span>0{i+1}</span><i/></div><small>{k}</small><h2>{t}</h2><p>{b}</p><span className="inline-link">Editorial preview <Icon name="arrow"/></span></article>)}</div></section></>
}

export function PortalPage() {
  return <section className="portal-shell"><aside className="portal-nav"><div className="standalone-brand-row"><Link className="brand brand--light" to="/"><img className="brand-logo" src="/brand/guild-academy-mark-transparent.png" alt=""/><span className="brand-name">Guild <b>Academy</b></span></Link><ThemeToggle inverse/></div><nav><a className="active" href="#mission">Mission control</a><a href="#modules">Modules</a><a href="#evidence">Evidence</a><a href="#community">Community</a></nav><small>LEARNER EXPERIENCE PREVIEW</small></aside><main className="portal-main"><header><div><span className="eyebrow">Smart Contract Security / Cohort preview</span><h1>Mission control</h1></div><Link to="/">Exit preview ↗</Link></header><section className="portal-welcome"><div><small>WEEK 06 / ACCESS CONTROL</small><h2>Welcome back,<br/><em>researcher.</em></h2><p>Your next output is a documented exploit reproduction with mitigation notes.</p><button className="button">Continue mission <Icon name="arrow"/></button></div><div className="progress-ring"><span>62%</span><small>MODULE PROGRESS</small></div></section><section className="portal-grid"><article className="portal-card portal-card--wide"><span>THIS WEEK</span><h3>Access control under pressure</h3><div className="task"><Icon name="book"/><div><b>Read</b><small>Patterns and failure modes / 35 min</small></div><i>DONE</i></div><div className="task"><Icon name="lab"/><div><b>Reproduce</b><small>Complete the guided exploit lab / 2 hr</small></div><i>ACTIVE</i></div><div className="task"><Icon name="shield"/><div><b>Submit</b><small>Mitigation note and test evidence</small></div><i>LOCKED</i></div></article><article className="portal-card"><span>PEER REVIEW</span><b className="big-number">03</b><p>reviews waiting for your attention</p></article><article className="portal-card portal-card--accent"><span>NEXT LIVE SESSION</span><h3>Exploit clinic</h3><p>Date published during confirmed cohort onboarding.</p><small>CALENDAR SYNC PREVIEW</small></article></section></main></section>
}

export function NotFoundPage() { return <section className="not-found"><span>404 / OFF THE MAP</span><h1>This path has<br/>not been <em>charted.</em></h1><ButtonLink to="/">Return home</ButtonLink></section> }
