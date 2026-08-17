import { Route, Routes } from 'react-router-dom'
import { Layout } from './components'
import { AboutPage, AdmissionsPage, ApplyPage, CommunityPage, ContactPage, HomePage, InsightsPage, LabsPage, NotFoundPage, OutcomesPage, PartnershipsPage, PortalPage, ProgrammeDetailPage, ProgrammesPage } from './pages'

export default function App() {
  return <Routes>
    <Route path="/portal" element={<PortalPage/>}/>
    <Route path="/apply" element={<ApplyPage/>}/>
    <Route path="*" element={<Layout><Routes>
      <Route path="/" element={<HomePage/>}/>
      <Route path="/programs" element={<ProgrammesPage/>}/>
      <Route path="/programs/:slug" element={<ProgrammeDetailPage/>}/>
      <Route path="/admissions" element={<AdmissionsPage/>}/>
      <Route path="/labs" element={<LabsPage/>}/>
      <Route path="/outcomes" element={<OutcomesPage/>}/>
      <Route path="/community" element={<CommunityPage/>}/>
      <Route path="/partnerships" element={<PartnershipsPage/>}/>
      <Route path="/about" element={<AboutPage/>}/>
      <Route path="/contact" element={<ContactPage/>}/>
      <Route path="/insights" element={<InsightsPage/>}/>
      <Route path="*" element={<NotFoundPage/>}/>
    </Routes></Layout>}/>
  </Routes>
}
