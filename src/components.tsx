import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import type { Programme } from './data'

export function Icon({ name, size = 20 }: { name: string; size?: number }) {
  const paths: Record<string, ReactNode> = {
    arrow: <><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></>,
    external: <><path d="M14 3h7v7"/><path d="M10 14 21 3"/><path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    menu: <><path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h16"/></>,
    close: <><path d="m6 6 12 12"/><path d="m18 6-12 12"/></>,
    shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/>,
    lab: <><path d="M9 3v6l-5 9a2 2 0 0 0 2 3h12a2 2 0 0 0 2-3l-5-9V3"/><path d="M7 15h10"/><path d="M8 3h8"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
    book: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M4 4v15.5"/><path d="M20 22V2H6.5A2.5 2.5 0 0 0 4 4.5"/></>,
    spark: <path d="m12 3-1.4 5.6L5 10l5.6 1.4L12 17l1.4-5.6L19 10l-5.6-1.4L12 3Z"/>,
    chevron: <path d="m9 18 6-6-6-6"/>,
    sun: <><circle cx="12" cy="12" r="3.5"/><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.66 6.34l1.41-1.41"/></>,
    moon: <path d="M20.5 14.4A7.5 7.5 0 0 1 9.6 3.5 8.5 8.5 0 1 0 20.5 14.4Z"/>,
  }
  return <svg className="icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

export function ButtonLink({ to, children, variant = 'primary', external = false }: { to: string; children: ReactNode; variant?: 'primary' | 'secondary' | 'ghost'; external?: boolean }) {
  const className = `button button--${variant}`
  if (external) return <a className={className} href={to} target="_blank" rel="noreferrer">{children}<Icon name="external" size={16}/></a>
  return <Link className={className} to={to}>{children}<Icon name="arrow" size={16}/></Link>
}

const nav = [['Programmes', '/programs'], ['Admissions', '/admissions'], ['Labs', '/labs'], ['Outcomes', '/outcomes'], ['Community', '/community'], ['About', '/about']]

type Theme = 'light' | 'dark'

function initialTheme(): Theme {
  const active = document.documentElement.dataset.theme
  if (active === 'light' || active === 'dark') return active
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeToggle({ inverse = false }: { inverse?: boolean }) {
  const [theme, setTheme] = useState<Theme>(initialTheme)
  const nextTheme = theme === 'light' ? 'dark' : 'light'

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('guild-academy-theme', theme)
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#071017' : '#f4f0e6')
  }, [theme])

  return <button
    className={`theme-toggle ${inverse ? 'theme-toggle--inverse' : ''}`}
    type="button"
    aria-label={`Switch to ${nextTheme} mode`}
    title={`Switch to ${nextTheme} mode`}
    onClick={() => setTheme(nextTheme)}
  >
    <span className="theme-toggle__track" aria-hidden="true">
      <Icon name="sun" size={15}/><i/><Icon name="moon" size={14}/>
    </span>
    <span className="visually-hidden">{theme === 'light' ? 'Light mode active' : 'Dark mode active'}</span>
  </button>
}

export function Header() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  useEffect(() => setOpen(false), [location.pathname])
  return <header className="site-header">
    <div className="header-inner">
      <Link className="brand" to="/" aria-label="Guild Academy home">
        <img className="brand-logo" src="/brand/guild-academy-mark-transparent.png" alt=""/>
        <span className="brand-name">Guild <b>Academy</b><small>by Guild Technologies</small></span>
      </Link>
      <nav className="desktop-nav" aria-label="Main navigation">
        {nav.map(([label, to]) => <NavLink key={to} to={to} className={({isActive}) => isActive ? 'active' : ''}>{label}</NavLink>)}
      </nav>
      <div className="header-actions">
        <Link className="text-link desktop-only" to="/portal">Learner preview</Link>
        <ThemeToggle/>
        <Link className="button button--small" to="/apply">Apply <Icon name="arrow" size={15}/></Link>
        <button className="menu-button" type="button" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen(!open)}><Icon name={open ? 'close' : 'menu'} /></button>
      </div>
    </div>
    <div className={`mobile-nav ${open ? 'is-open' : ''}`}>
      {nav.map(([label, to]) => <NavLink key={to} to={to}>{label}<Icon name="chevron"/></NavLink>)}
      <NavLink to="/partnerships">Partnerships<Icon name="chevron"/></NavLink>
      <NavLink to="/portal">Learner preview<Icon name="chevron"/></NavLink>
    </div>
  </header>
}

export function Footer() {
  return <footer className="site-footer">
    <div className="footer-lead">
      <div><span className="eyebrow eyebrow--light">THE NEXT MOVE</span><h2>Build work you can<br/><em>stand behind.</em></h2></div>
      <div className="footer-cta"><p>Find a programme that matches your readiness, ambition and time.</p><ButtonLink to="/programs">Explore programmes</ButtonLink></div>
    </div>
    <div className="footer-grid">
      <div><Link className="brand brand--light" to="/"><img className="brand-logo" src="/brand/guild-academy-mark-transparent.png" alt=""/><span className="brand-name">Guild <b>Academy</b></span></Link><p className="muted">The education and talent-development pillar of Guild Technologies.</p></div>
      <div><h3>Learn</h3><Link to="/programs">Programmes</Link><Link to="/admissions">Admissions</Link><Link to="/labs">Labs & research</Link><Link to="/outcomes">Outcomes</Link></div>
      <div><h3>Belong</h3><Link to="/community">Community</Link><Link to="/insights">Insights</Link><Link to="/partnerships">Partnerships</Link><Link to="/contact">Contact</Link></div>
      <div><h3>Follow</h3><a href="https://x.com/GuildAcademy_" target="_blank" rel="noreferrer">X / Twitter</a><a href="https://github.com/GuildAudits" target="_blank" rel="noreferrer">GitHub</a><span className="footer-note">Africa-rooted<br/>Globally connected</span></div>
    </div>
    <div className="footer-base"><span>© 2026 Guild Technologies</span><span>Evidence before claims.</span></div>
  </footer>
}

export function Layout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'auto' }) }, [pathname])
  return <><Header/><main id="main-content">{children}</main><Footer/></>
}

export function SectionHead({ label, title, body, action }: { label: string; title: ReactNode; body?: string; action?: ReactNode }) {
  return <div className="section-head reveal"><div><span className="eyebrow">{label}</span><h2>{title}</h2></div>{body && <p>{body}</p>}{action && <div className="section-action">{action}</div>}</div>
}

export function ProgrammeCard({ programme, index = 0 }: { programme: Programme; index?: number }) {
  return <article className={`programme-card accent-${programme.accent} reveal`} style={{'--delay': `${index * 70}ms`} as CSSProperties}>
    <div className="card-top"><span className="mono">{programme.code}</span><span className={`status status--${programme.status.toLowerCase().replaceAll(' ', '-')}`}>{programme.status}</span></div>
    <div className="programme-number">0{index + 1}</div>
    <h3>{programme.name}</h3><p>{programme.descriptor}</p>
    <dl><div><dt>Duration</dt><dd>{programme.duration}</dd></div><div><dt>Workload</dt><dd>{programme.workload}</dd></div><div><dt>Tuition</dt><dd>{programme.price}<small>{programme.usd} ref.</small></dd></div></dl>
    <Link className="card-link" to={`/programs/${programme.slug}`}>View field guide <Icon name="arrow" size={17}/></Link>
  </article>
}

export function PageHero({ label, title, body, children, tone = 'dark' }: { label: string; title: ReactNode; body: string; children?: ReactNode; tone?: 'dark' | 'light' }) {
  return <section className={`page-hero page-hero--${tone}`}><div className="page-hero-grid"><div className="reveal"><span className={`eyebrow ${tone === 'dark' ? 'eyebrow--light' : ''}`}>{label}</span><h1>{title}</h1></div><div className="page-hero-aside reveal"><p>{body}</p>{children}</div></div><div className="page-rule"><span>GUILD / FIELD NOTE</span><i/></div></section>
}

export function Metric({ value, label, note }: { value: string; label: string; note: string }) {
  return <div className="metric"><strong>{value}</strong><span>{label}</span><small>{note}</small></div>
}
