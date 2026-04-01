import { Navigate, Route, Routes } from "react-router-dom"
import ProtectedRoute from "./components/ProtectedRoute"
import LandingPage from "./pages/LandingPage"
import LoginPage from "./pages/LoginPage"
import AppointmentsPage from "./pages/portal/AppointmentsPage"
import BillsPage from "./pages/portal/BillsPage"
import PortalHome from "./pages/portal/PortalHome"
import PortalLayout from "./pages/portal/PortalLayout"
import PrescriptionsPage from "./pages/portal/PrescriptionsPage"
import ReportsPage from "./pages/portal/ReportsPage"
import RevisitPage from "./pages/portal/RevisitPage"
import VisitDetailPage from "./pages/portal/VisitDetailPage"
import VisitsPage from "./pages/portal/VisitsPage"

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/portal" element={<PortalLayout />}>
          <Route index element={<PortalHome />} />
          <Route path="bills" element={<BillsPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="prescriptions" element={<PrescriptionsPage />} />
          <Route path="appointments" element={<AppointmentsPage />} />
          <Route path="visits" element={<VisitsPage />} />
          <Route path="visits/:visitId" element={<VisitDetailPage />} />
          <Route path="revisit" element={<RevisitPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
