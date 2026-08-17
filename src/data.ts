export type ProgrammeStatus = 'Open' | 'Applications opening' | 'Waitlist'

export type Programme = {
  slug: string
  code: string
  name: string
  shortName: string
  descriptor: string
  outcome: string
  audience: string
  duration: string
  workload: string
  format: string
  level: string
  status: ProgrammeStatus
  price: string
  usd: string
  instalment: string
  capacity: number
  requirements: string[]
  curriculum: string[]
  evidence: string[]
  accent: 'green' | 'orange' | 'blue' | 'bone' | 'mist'
}

export const programmes: Programme[] = [
  {
    slug: 'software-engineering', code: 'GA/SE-01', name: 'Software Engineering', shortName: 'Software Engineering',
    descriptor: 'Build complete, reliable web applications and learn to explain how they work.',
    outcome: 'Design, build, test, deploy and demonstrate a production-style full-stack application with source control, documentation and a portfolio case study.',
    audience: 'Beginners with demonstrated readiness, self-taught developers who need structure, and committed career switchers.',
    duration: '24 weeks', workload: '12–15 hrs / week', format: 'Hybrid', level: 'Beginner → Intermediate', status: 'Applications opening',
    price: '₦360,000', usd: '$240', instalment: '₦99,000 × 4', capacity: 30, accent: 'bone',
    requirements: ['Basic digital literacy', 'A capable laptop and reliable internet', 'Readiness exercise', 'Commitment to weekly live and async work'],
    curriculum: ['Developer setup, web foundations, Git and collaborative workflow', 'JavaScript and TypeScript foundations, problem solving and data structures', 'HTML, CSS, responsive UI and accessibility', 'React and frontend application architecture', 'APIs, Node.js and backend services', 'SQL, data modelling and authentication', 'Testing, debugging and code review', 'Deployment, observability and application security', 'System design fundamentals and technical documentation', 'Capstone: build, deploy, present and defend a complete product'],
    evidence: ['Reviewed GitHub repositories', 'Deployed full-stack application', 'Technical documentation', 'Recorded capstone demonstration'],
  },
  {
    slug: 'ai-development', code: 'GA/AI-01', name: 'AI Development', shortName: 'AI Development',
    descriptor: 'Build useful AI systems that are evaluated, observable, secure and cost-aware.',
    outcome: 'Deploy an AI-enabled application or workflow with documented architecture, evaluation criteria, failure cases and operational metrics.',
    audience: 'Developers and technically confident learners with Python or JavaScript readiness.',
    duration: '16 weeks', workload: '12–15 hrs / week', format: 'Hybrid', level: 'Intermediate', status: 'Applications opening',
    price: '₦300,000', usd: '$200', instalment: '₦84,000 × 4', capacity: 24, accent: 'green',
    requirements: ['Programming fundamentals', 'Comfort working with APIs', 'Command-line basics', 'Readiness exercise'],
    curriculum: ['Python, APIs, data handling and engineering foundations', 'AI and machine-learning concepts for product builders', 'LLM applications, prompting and context design', 'Retrieval, embeddings and knowledge systems', 'Tool use, workflows and agent design', 'Evaluation, quality measurement and human-in-the-loop design', 'Security, privacy, hallucination, misuse and governance', 'Deployment, observability and cost/performance engineering', 'Capstone: production-style AI system with evaluation dossier'],
    evidence: ['Deployed AI prototype', 'Architecture and system diagram', 'Evaluation set and quality report', 'Failure-mode analysis and demo'],
  },
  {
    slug: 'devops-infrastructure', code: 'GA/DI-01', name: 'DevOps & Infrastructure Engineering', shortName: 'DevOps & Infrastructure',
    descriptor: 'Provision, deploy, observe, secure, troubleshoot and operate modern infrastructure.',
    outcome: 'Operate a production-style service with infrastructure-as-code, automated delivery, monitoring, security controls and recovery runbooks.',
    audience: 'Developers, IT support professionals, aspiring cloud engineers and technically prepared career switchers.',
    duration: '16 weeks', workload: '12–16 hrs / week', format: 'Hybrid', level: 'Intermediate', status: 'Applications opening',
    price: '₦330,000', usd: '$220', instalment: '₦92,000 × 4', capacity: 24, accent: 'blue',
    requirements: ['Basic Linux and command-line comfort', 'Networking fundamentals or pre-work', 'Laptop with virtualisation support where possible', 'Readiness exercise'],
    curriculum: ['Linux administration, networking, DNS and shell workflows', 'Git, containers and Docker', 'CI/CD and release engineering', 'Cloud foundations and infrastructure-as-code', 'Kubernetes, orchestration and service networking', 'Reverse proxies, load balancing and application delivery', 'Monitoring, logging, alerting and observability', 'Hardening, secrets, backups, disaster recovery and incident response', 'Capstone: deploy and operate a resilient service with runbooks'],
    evidence: ['Infrastructure repository', 'Deployment pipeline', 'System and network diagrams', 'Dashboard, incident runbook and recovery test'],
  },
  {
    slug: 'cybersecurity', code: 'GA/CY-01', name: 'Cybersecurity', shortName: 'Cybersecurity',
    descriptor: 'Learn security through authorised labs, responsible practice and clear reporting.',
    outcome: 'Assess systems in approved environments, model threats, investigate vulnerabilities and recommend practical remediation.',
    audience: 'Aspiring security practitioners, developers, IT professionals and technically prepared learners.',
    duration: '16 weeks', workload: '12–16 hrs / week', format: 'Hybrid', level: 'Foundation → Intermediate', status: 'Waitlist',
    price: '₦330,000', usd: '$220', instalment: '₦92,000 × 4', capacity: 24, accent: 'orange',
    requirements: ['Basic computer and networking knowledge', 'Linux foundations recommended', 'Signed ethics and authorised-lab agreement', 'Readiness exercise'],
    curriculum: ['Security mindset, ethics, authorisation and lab safety', 'Linux, networking, protocols and scripting', 'Web and application security foundations', 'Identity, access control and secrets hygiene', 'Threat modelling and vulnerability assessment', 'Cloud and infrastructure security fundamentals', 'Defensive monitoring, logging and incident response', 'Security automation and reporting', 'Capstone: authorised assessment, findings report and remediation briefing'],
    evidence: ['Authorised lab reports', 'Threat model', 'Vulnerability assessment', 'Incident exercise and remediation plan'],
  },
  {
    slug: 'blockchain-security', code: 'GA/BS-01', name: 'Blockchain Security', shortName: 'Blockchain Security',
    descriptor: 'Secure the systems around digital assets, from wallets and nodes to bridges and protocol infrastructure.',
    outcome: 'Threat-model, assess, monitor and harden blockchain infrastructure while documenting practical controls for keys, nodes, wallets, bridges and incident response.',
    audience: 'Blockchain developers, infrastructure engineers, cybersecurity practitioners and technically prepared learners moving into protocol security.',
    duration: '18 weeks', workload: '14–18 hrs / week', format: 'Hybrid', level: 'Intermediate → Advanced', status: 'Applications opening',
    price: '₦390,000', usd: '$260', instalment: '₦108,000 × 4', capacity: 20, accent: 'blue',
    requirements: ['Working programming or scripting ability', 'Linux, networking and command-line fundamentals', 'Blockchain foundations or published pre-work', 'Signed ethics and authorised-lab agreement'],
    curriculum: ['Blockchain architecture, distributed systems and applied cryptography', 'Accounts, wallets, key management, signing flows and custody models', 'Nodes, clients, RPC infrastructure and secure validator operations', 'Consensus security, finality, forks and network-layer threats', 'Transaction lifecycle, mempools, MEV and economic attack surfaces', 'Bridge, oracle and cross-chain security architecture', 'Smart-contract integration risk and protocol dependency mapping', 'Threat modelling, monitoring, detection and security automation', 'Incident response, forensics, disclosure and recovery exercises', 'Capstone: assess and defend an authorised blockchain system'],
    evidence: ['Blockchain threat model', 'Hardened node or protocol lab', 'Monitoring and incident-response runbook', 'Capstone security assessment and defence briefing'],
  },
  {
    slug: 'smart-contract-security', code: 'GA/SC-06', name: 'Smart Contract Security', shortName: 'Smart Contract Security',
    descriptor: 'Learn how smart contracts fail, how auditors reason and how secure protocols are built.',
    outcome: 'Review Ethereum smart-contract systems, identify risk patterns, write structured findings and reproduce issues with proof-of-concept code.',
    audience: 'Developers with Solidity or equivalent readiness, blockchain developers and security practitioners moving into Web3.',
    duration: '16 weeks', workload: '15–18 hrs / week', format: 'Hybrid', level: 'Advanced', status: 'Open',
    price: '₦375,000', usd: '$250', instalment: '₦105,000 × 4', capacity: 20, accent: 'green',
    requirements: ['Working programming ability', 'Git and GitHub', 'Solidity strongly recommended', 'Readiness exercise and pre-work where required'],
    curriculum: ['Blockchain systems, cryptography and Ethereum execution', 'Solidity, token standards and EVM fundamentals', 'Audit readiness, heuristics and report writing', 'Common vulnerability classes and secure design', 'Testing, fuzzing, invariants and proof-of-concept writing', 'Signatures, oracles and flash-loan risk', 'DeFi systems: AMMs, lending, staking and perpetuals', 'Governance, bridges, upgradeability, storage, MEV and centralisation risk', 'Hack postmortems, competitive audits and final assessment'],
    evidence: ['Audit-style reports', 'Proof-of-concept code', 'Hack Lab contributions', 'Technical articles and final review'],
  },
]

export const exploreNext = ['Blockchain Development', 'Cloud Security', 'Data Analytics & Engineering', 'Product Management', 'UI/UX & Product Design', 'QA & Test Automation', 'Developer Relations', 'Mobile Development']

export type Evidence = { type: string; title: string; meta: string; description: string; href: string; verified: boolean }

export const evidence: Evidence[] = [
  { type: 'Cohort report', title: '110+ vulnerabilities reported', meta: 'Cohort IV · verified report', description: 'High, medium and low findings documented across competitive audits and CodeHawks First Flights.', href: '/outcomes', verified: true },
  { type: 'Open source', title: 'Guild Academy Hacks Lab', meta: 'Cohort V · public repository', description: 'A public environment for replaying notable DeFi incidents and studying attack paths.', href: 'https://github.com/GuildAudits/GuildAcademy-Hacks-Lab', verified: true },
  { type: 'Technical writing', title: '22+ incident postmortems', meta: 'Cohort V · Hashnode & Medium', description: 'Learners documented exploit mechanics, root causes, losses and practical mitigations.', href: '/insights', verified: true },
  { type: 'Audit work', title: '25+ competitive audits', meta: 'Cohort IV · verified report', description: 'Participation spanning Sherlock, Cantina, Code4rena, CodeHawks and Immunefi.', href: '/outcomes', verified: true },
  { type: 'Research', title: '25+ hacks studied and replayed', meta: 'Cohort V · verified report', description: 'Real incidents reconstructed to understand assumptions and discover alternate attack paths.', href: '/labs', verified: true },
  { type: 'Community', title: 'Across four continents', meta: 'Cohort V · 40+ researchers', description: 'Security researchers joined from Africa, Asia, Europe and America.', href: '/community', verified: true },
]

export const testimonials = [
  {
    name: '0x_Roy',
    handle: '@thatboivikky',
    context: 'Learner outcome · January 2026',
    quote: 'Thank you @GuildAcademy_ for sharpening me. The best is yet to come.',
    detail: 'Shared alongside a first Web3 security win with two high-severity and one low-severity findings.',
    signal: '1,347 views · 19 likes · 6 reposts',
    href: 'https://x.com/thatboivikky/status/2013023802616168573',
  },
  {
    name: 'Muntasir',
    handle: '@Heis_muntasir',
    context: 'First audit result · December 2025',
    quote: '@GuildAcademy_ thanks for the guidance.',
    detail: 'Published with evidence of a first competitive audit result.',
    signal: '458 views · 7 likes · 2 reposts',
    href: 'https://x.com/Heis_muntasir/status/1999488284733636991',
  },
  {
    name: 'Yasookeh',
    handle: '@yasookeh',
    context: 'First critical finding · December 2025',
    quote: 'Enrolled @GuildAcademy_ to become a full time security researcher/auditor. Found my first critical.',
    detail: 'A learner reflection describing the move into Web3 security and visible growth through the programme.',
    signal: '596 views · 13 likes · 1 repost',
    href: 'https://x.com/yasookeh/status/2003413254899662928',
  },
]

export const alumniWins = [
  {
    person: 'Pelz', handle: '@Pelz_Dev', result: 'Top 4', field: 'Among 1,000+ researchers',
    detail: 'Sherlock competitive audit', signal: '2.5K views · 70 likes', href: 'https://x.com/GuildAcademy_/status/2047045425731907777',
  },
  {
    person: 'Edoscoba', handle: '@edoscoba', result: '2nd place', field: 'Code4rena leaderboard',
    detail: 'Guild Academy Cohort IV learner', signal: '3,787 views · 69 likes', href: 'https://x.com/GuildAcademy_/status/2021882576558805270',
  },
  {
    person: 'Heeze', handle: '@heezeEth', result: '3rd place', field: 'Succinct Labs competition',
    detail: 'Cantina result · $4,926.99 award', href: 'https://x.com/GuildAcademy_/status/1959061084947849545',
  },
  {
    person: 'Zurab Anchabadze', handle: '@anchabadze', result: '6th place', field: 'Panoptic competition',
    detail: 'First solo medium finding on Code4rena', href: 'https://x.com/Pelz_Dev/status/2022384965707796615',
  },
  {
    person: 'Theboiledcorn + Orhukl', handle: 'Cohort V', result: '1st place', field: 'Competitive audit contest',
    detail: 'Seven weeks into the bootcamp', signal: '2.3K views · 40 likes', href: 'https://x.com/GuildAcademy_/status/1966874016074883256',
  },
  {
    person: 'i_hizick', handle: 'Cohort IV', result: '6th place', field: 'CodeHawks leaderboard',
    detail: 'Starknet staking audit · Part 2', signal: '2.3K views · 41 likes', media: '/evidence/ihizick-codehawks-result.jpg', mediaAlt: 'Public CodeHawks leaderboard shared with Guild Academy Cohort IV result', href: 'https://x.com/GuildAcademy_/status/1933644424816570377',
  },
  {
    person: 'Edoscoba, Rocco, Ayoola + Kwesi', handle: 'Cohort IV', result: 'Top ranks', field: 'CodeHawks First Flights',
    detail: 'Multiple learners on public leaderboards', signal: '985 views · 18 likes', media: '/evidence/cohort-iv-first-flights.jpg', mediaAlt: 'Guild Academy graphic listing top Cohort IV learners in CodeHawks First Flight challenges', href: 'https://x.com/GuildAcademy_/status/1923036163566108713',
  },
  {
    person: 'Orhukl', handle: 'Cohort V', result: '$1,894.74', field: 'Code4rena Competition #10',
    detail: 'Public award card shared with source evidence', signal: '1,852 views · 32 likes', media: '/evidence/orhukl-cohort-v-win.jpg', mediaAlt: 'Code4rena award card showing Orhukl earned 1,894.74 USDC in Competition 10', href: 'https://x.com/GuildAcademy_/status/2015795824207298992',
  },
]

export const communityEvents = [
  {
    role: 'Academy-led', date: 'May 2026', title: 'Guild Academy community call',
    description: 'A public conversation covering upcoming cohorts, Academy updates, community growth and opportunities ahead.',
    signal: '2,000 views · 36 likes · 8 reposts', href: 'https://x.com/GuildAcademy_/status/2054268040934764996', accent: 'green',
  },
  {
    role: 'Guest session', date: 'Sep 2025', title: 'Blockchain security with 0xRajeev',
    description: 'A guest researcher session delivered for learners in Smart Contract Security Bootcamp Cohort V.',
    signal: '3,300 views · 57 likes · 10 reposts', href: 'https://x.com/GuildAcademy_/status/1970216289718411665', accent: 'blue',
  },
  {
    role: 'Live practice', date: 'Sep 2025', title: 'Live audit session with Pelz',
    description: 'A late-night practical session showing how learner development continues through active audit work.',
    signal: '5,200 views · 56 likes · 10 reposts', href: 'https://x.com/GuildAcademy_/status/1965929867641499795', accent: 'orange',
  },
  {
    role: 'Public goods', date: 'Nov 2025', title: 'Graduate-led protocol reviews',
    description: 'Graduating researchers began a private audit initiative offering eligible open-source projects professional-grade security feedback.',
    signal: '1,524 views · 12 likes · 2 reposts', href: 'https://x.com/GuildAcademy_/status/1990356050340638884', accent: 'bone',
  },
  {
    role: 'Ecosystem spotlight', date: 'Nov 2025', title: 'Web3 Security Summit Africa',
    description: 'Guild Academy amplified the summit highlight from an event hosted by GuildAudits for Africa’s security community.',
    signal: '2,655 views · 47 likes · 18 reposts', href: 'https://x.com/Web3summitafric/status/1989725015999189272', accent: 'summit',
  },
  {
    role: 'Ecosystem invitation', date: 'Sep 2025', title: 'Summit registration and speaker call',
    description: 'The Academy shared registration and speaker opportunities with African security researchers and builders.',
    signal: '1,500 views · 25 likes · 7 reposts', href: 'https://x.com/GuildAcademy_/status/1971618562222838074', accent: 'mist',
  },
  {
    role: 'Cohort practice', date: 'Oct 2025', title: 'Three live audits, one cohort',
    description: 'Cohort V ran three live audit sessions simultaneously, turning collaborative review into practical training.',
    signal: '2,000 views · 33 likes · 7 reposts', href: 'https://x.com/GuildAcademy_/status/1977689625096548373', accent: 'green',
  },
  {
    role: 'Cohort finale', date: 'Jun 2025', title: 'Open-source audit assessment',
    description: 'Cohort IV graduates completed a final assessment by delivering free, professional-grade security reviews for two protocols.',
    signal: '1,800 views · 24 likes · 1 repost', href: 'https://x.com/GuildAcademy_/status/1933156383945261383', accent: 'blue',
  },
]

export const ecosystemProofs = [
  {
    title: 'Knowledge Partner',
    subject: '2025 Nigeria Web3 Landscape Report',
    description: 'Guild Academy was named among the knowledge partners contributing to the second edition of the ecosystem report.',
    signal: 'Verified ecosystem contribution',
    href: 'https://x.com/GuildAcademy_/status/2046661100939141409',
  },
  {
    title: 'Featured Contributor',
    subject: 'Web3 security researcher session with Glider',
    description: 'Glider featured Guild Academy alongside security practitioners in a public session about building a career in Web3 security.',
    signal: '3,646 views · 68 likes · 9 reposts',
    href: 'https://x.com/glider_xyz/status/2062477426865684578',
  },
]

export const faqs = [
  ['Who is Guild Academy for?', 'Ambitious beginners, working professionals and experienced builders who want a structured route to demonstrated technical capability. Each programme publishes its own readiness level.'],
  ['Do I need prior experience?', 'Software Engineering begins with foundations. Specialist programmes require technical readiness or completion of published pre-work.'],
  ['How much time should I expect?', 'Flagship programmes require 12–18 hours each week across live sessions, practical work, review and independent study.'],
  ['Is learning online or onsite?', 'Flagship cohorts are designed for hybrid delivery. The exact physical location, time zone and live schedule are confirmed before enrollment opens.'],
  ['What do I receive at completion?', 'Learners who meet programme requirements receive a certificate and, more importantly, a body of reviewed work they can demonstrate.'],
  ['How do payments work?', 'Pay tuition upfront or use the published four-part installment plan. Scholarship places are announced only when funding and selection rules are confirmed.'],
  ['What happens after I apply?', 'Admissions reviews programme fit and readiness. Where required, you complete an assessment or interview before receiving an offer and payment instructions.'],
  ['Can I join the community without a cohort?', 'Yes. Public workshops, technical writing, events and selected community sessions provide ways to participate beyond enrollment.'],
]
