import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DarkModeProvider } from './contexts/DarkModeContext';
import Homepage from './pages/Homepage';
import Login from './pages/Login';
import MainLayout from './components/MainLayout';
import AdminDashboard from './pages/admin/Dashboard';
import BirthRecords from './pages/admin/BirthRecords';
import MarriageRecords from './pages/admin/MarriageRecords';
import CalendarPage from './pages/admin/CalendarPage';
import ChurchMembership from './pages/admin/ChurchMembership';
import Settings from './pages/admin/Settings';
import BillingModule from './pages/admin/BillingModule';
import DonationsCollections from './pages/admin/DonationsCollections';
import AccountManagement from './pages/admin/AccountManagement';
import UploadFiles from './pages/admin/UploadFiles';
import PriestDashboard from './pages/priest/PriestDashboard';
import AccountantDashboard from './pages/accountant/AccountantDashboard';
import BillingCollections from './pages/accountant/BillingCollections';
import DonationsOfferings from './pages/accountant/DonationsOfferings';
import FinancialReports from './pages/accountant/FinancialReports';
import FinancialDocuments from './pages/accountant/FinancialDocuments';
import ChurchAdminDashboard from './pages/churchadmin/ChurchAdminDashboard';
import MemberRecords from './pages/churchadmin/MemberRecords';
import ServiceRequests from './pages/churchadmin/ServiceRequests';
import CalendarSchedule from './pages/churchadmin/CalendarSchedule';
import EventPlanning from './pages/churchadmin/EventPlanning';
import StaffSchedules from './pages/churchadmin/StaffSchedules';
import Reports from './pages/churchadmin/Reports';
import Documents from './pages/churchadmin/Documents';
import Announcements from './pages/churchadmin/Announcements';
import UserDashboard from './pages/user/UserDashboard';
import UserUploadFiles from './pages/user/UserUploadFiles';
import MyRequests from './pages/user/MyRequests';
import RequestService from './pages/user/RequestService';
import PaymentsBilling from './pages/user/PaymentsBilling';

function App() {
  const [userRole, setUserRole] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = (role) => {
    setUserRole(role);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setUserRole(null);
    setIsAuthenticated(false);
  };

  return (
    <DarkModeProvider>
      <AuthProvider>
        <BrowserRouter>
        {!isAuthenticated ? (
          <Routes>
            <Route path="/" element={<Homepage onLogin={handleLogin} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        ) : (
          <Routes>
            <Route path="/" element={<MainLayout userRole={userRole} onLogout={handleLogout} />}>
              {/* Admin Routes */}
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/billing" element={<BillingModule />} />
              <Route path="/admin/donations" element={<DonationsCollections />} />
              <Route path="/admin/calendar" element={<CalendarPage />} />
              <Route path="/admin/accounts" element={<AccountManagement />} />
              <Route path="/admin/upload" element={<UploadFiles />} />
              <Route path="/admin/birth-records" element={<BirthRecords />} />
              <Route path="/admin/marriage-records" element={<MarriageRecords />} />
              <Route path="/admin/membership" element={<ChurchMembership />} />
              <Route path="/admin/settings" element={<Settings />} />

              {/* Priest Routes */}
              <Route path="/priest/dashboard" element={<PriestDashboard />} />

              {/* Accountant Routes */}
              <Route path="/accountant/dashboard" element={<AccountantDashboard />} />
              <Route path="/accountant/billing" element={<BillingCollections />} />
              <Route path="/accountant/donations" element={<DonationsOfferings />} />
              <Route path="/accountant/reports" element={<FinancialReports />} />
              <Route path="/accountant/documents" element={<FinancialDocuments />} />

              {/* Church Admin Routes */}
              <Route path="/church-admin/dashboard" element={<ChurchAdminDashboard />} />
              <Route path="/church-admin/members" element={<MemberRecords />} />
              <Route path="/church-admin/service-requests" element={<ServiceRequests />} />
              <Route path="/church-admin/calendar" element={<CalendarSchedule />} />
              <Route path="/church-admin/events" element={<EventPlanning />} />
              <Route path="/church-admin/staff-schedules" element={<StaffSchedules />} />
              <Route path="/church-admin/reports" element={<Reports />} />
              <Route path="/church-admin/documents" element={<Documents />} />
              <Route path="/church-admin/announcements" element={<Announcements />} />

              {/* User Routes */}
              <Route path="/user/dashboard" element={<UserDashboard />} />
              <Route path="/user/my-requests" element={<MyRequests />} />
              <Route path="/user/request-service" element={<RequestService />} />
              <Route path="/user/payments-billing" element={<PaymentsBilling />} />
              <Route path="/user/upload" element={<UserUploadFiles />} />

              {/* Default redirect */}
              <Route path="*" element={<Navigate to={`/${userRole === 'church_admin' ? 'church-admin' : userRole}/dashboard`} replace />} />
            </Route>
          </Routes>
        )}
        </BrowserRouter>
      </AuthProvider>
    </DarkModeProvider>
  );
}

export default App;
