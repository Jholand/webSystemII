import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DarkModeProvider } from './contexts/DarkModeContext';
import Cookies from 'js-cookie';
import Homepage from './pages/Homepage';
import Login from './pages/Login';
import MainLayout from './components/MainLayout';
import AdminDashboard from './pages/admin/Dashboard';
import Records from './pages/admin/Records';
import CalendarPage from './pages/admin/CalendarPage';
import Settings from './pages/admin/Settings';
import DonationsCollections from './pages/admin/DonationsCollections';
import Categories from './pages/admin/Categories';
import AccountManagement from './pages/admin/AccountManagement';
import AdminSchedules from './pages/admin/AdminSchedules';
import PaymentReports from './pages/shared/PaymentReports';
import AuditLog from './pages/admin/AuditLog';
import DataManagement from './pages/admin/DataManagement';
import UploadFiles from './pages/admin/UploadFiles';
import PriestDashboard from './pages/priest/PriestDashboard';
import PriestMembers from './pages/priest/PriestMembers';
import PriestSacraments from './pages/priest/PriestSacraments';
import PriestEvents from './pages/priest/PriestEvents';
import PriestReports from './pages/priest/PriestReports';
import PriestServiceRequests from './pages/priest/PriestServiceRequests';
import PriestAppointments from './pages/priest/PriestAppointments';
import PriestDonationsSummary from './pages/priest/PriestDonationsSummary';
import AccountantDashboard from './pages/accountant/AccountantDashboard';
import PaymentHistory from './pages/accountant/PaymentHistory';
import PaymentCategories from './pages/accountant/PaymentCategories';
import FinancialReports from './pages/accountant/FinancialReports';
import FinancialDocuments from './pages/accountant/FinancialDocuments';
import ReceiptView from './pages/accountant/ReceiptView';
import DonorHistory from './pages/accountant/DonorHistory';
import Appointments from './pages/accountant/Appointments';
import ServicePaymentsEnhanced from './pages/accountant/ServicePaymentsEnhanced';
import ChurchAdminDashboard from './pages/churchadmin/ChurchAdminDashboard';
import MemberRecords from './pages/churchadmin/MemberRecords';
import ServiceRequests from './pages/churchadmin/ServiceRequests';
import CalendarSchedule from './pages/churchadmin/CalendarSchedule';
import EventPlanning from './pages/churchadmin/EventPlanning';
import StaffSchedules from './pages/churchadmin/StaffSchedules';
import Reports from './pages/churchadmin/Reports';
import Documents from './pages/churchadmin/Documents';
import Announcements from './pages/churchadmin/Announcements';
import AuditLogs from './pages/churchadmin/AuditLogs';
import SecretaryDashboard from './pages/churchadmin/SecretaryDashboard';
import SecretaryMembers from './pages/churchadmin/SecretaryMembers';
import AddEditMember from './pages/churchadmin/AddEditMember';
import SacramentRecords from './pages/churchadmin/SacramentRecords';
import UserDashboard from './pages/user/UserDashboard';
import UserUploadFiles from './pages/user/UserUploadFiles';
import MyRequests from './pages/user/MyRequests';
import UserProfile from './pages/user/UserProfile';
import UserSacraments from './pages/user/UserSacraments';
import UserServiceRequests from './pages/user/UserServiceRequests';
import RequestService from './pages/user/NewServiceRequest';
import MyServiceRequests from './pages/user/MyServiceRequests';
import UserPayments from './pages/user/UserPayments';
import UserNotifications from './pages/user/UserNotifications';
import UserInteractions from './pages/user/UserInteractions';
import UserCertificateRequests from './pages/user/UserCertificateRequests';
import ChurchAdminCertificates from './pages/churchadmin/ChurchAdminCertificates';
import SacramentsAndCertificates from './pages/churchadmin/SacramentsAndCertificates';
import SharedCategories from './pages/shared/Categories';
import SharedSettings from './pages/shared/Settings';
import SharedDonationsCollections from './pages/shared/DonationsCollections';
import FinanceDonations from './pages/shared/FinanceDonations';
import SystemSettings from './pages/shared/SystemSettings';

function App() {
  // Check cookies on mount to persist authentication
  const [userRole, setUserRole] = useState(() => {
    const role = Cookies.get('userRole');
    // If there's a stored role but it seems problematic, clear it
    if (role && !['admin', 'priest', 'accountant', 'church_admin', 'user'].includes(role)) {
      Cookies.remove('userRole');
      Cookies.remove('isLoggedIn');
      Cookies.remove('userName');
      return null;
    }
    return role; // Return the stored role to persist authentication
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const authStatus = Cookies.get('isLoggedIn');
    const hasToken = localStorage.getItem('token');
    
    // User must have both cookie auth AND token for Sanctum
    if (authStatus === 'true' && !hasToken) {
      // Clear old session - user needs to log in again
      console.warn('Old session detected without token. Clearing session.');
      Cookies.remove('isLoggedIn');
      Cookies.remove('userRole');
      Cookies.remove('userName');
      Cookies.remove('userId');
      localStorage.removeItem('userId');
      return false;
    }
    
    return authStatus === 'true' && hasToken; // Check both cookies and token
  });

  const handleLogin = (role) => {
    setUserRole(role);
    setIsAuthenticated(true);
    Cookies.set('userRole', role, { expires: 7 });
    Cookies.set('isLoggedIn', 'true', { expires: 7 });
  };

  const handleLogout = () => {
    setUserRole(null);
    setIsAuthenticated(false);
    Cookies.remove('userRole');
    Cookies.remove('isLoggedIn');
    Cookies.remove('userName');
    Cookies.remove('userId');
    localStorage.removeItem('userId');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
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
              <Route path="/admin/accounts" element={<AccountManagement />} />
              <Route path="/admin/categories" element={<Navigate to="/admin/settings" replace />} />
              <Route path="/admin/records" element={<Records />} />
              {/* Redirect old record routes to new Records page */}
              <Route path="/admin/birth-records" element={<Navigate to="/admin/records" replace />} />
              <Route path="/admin/marriage-records" element={<Navigate to="/admin/records" replace />} />
              <Route path="/admin/schedules" element={<AdminSchedules />} />
              <Route path="/admin/finance" element={<FinanceDonations />} />
              <Route path="/admin/payment-reports" element={<FinanceDonations />} />
              <Route path="/admin/audit-log" element={<AuditLog />} />
              <Route path="/admin/settings" element={<SystemSettings />} />
              <Route path="/admin/calendar" element={<CalendarPage />} />
              <Route path="/admin/data-mgmt" element={<DataManagement />} />
              <Route path="/admin/files" element={<UploadFiles />} />

              {/* Priest Routes */}
              <Route path="/priest/dashboard" element={<PriestDashboard />} />
              <Route path="/priest/sacraments" element={<PriestSacraments />} />
              <Route path="/priest/appointments" element={<PriestAppointments />} />
              <Route path="/priest/service-requests" element={<PriestServiceRequests />} />
              <Route path="/priest/events" element={<PriestEvents />} />
              <Route path="/priest/members" element={<PriestMembers />} />
              <Route path="/priest/reports" element={<PriestReports />} />
              <Route path="/priest/finance" element={<FinanceDonations />} />
              <Route path="/priest/donations" element={<FinanceDonations />} />

              {/* Accountant Routes */}
              <Route path="/accountant/dashboard" element={<AccountantDashboard />} />
              <Route path="/accountant/appointments" element={<Appointments />} />
              <Route path="/accountant/finance" element={<FinanceDonations />} />
              <Route path="/accountant/payments" element={<FinanceDonations />} />
              <Route path="/accountant/service-payments" element={<ServicePaymentsEnhanced />} />
              <Route path="/accountant/categories" element={<SystemSettings />} />
              <Route path="/accountant/receipts" element={<PaymentHistory />} />
              <Route path="/accountant/receipts/:id" element={<ReceiptView />} />
              <Route path="/accountant/donors/:memberId" element={<DonorHistory />} />
              <Route path="/accountant/reports" element={<FinanceDonations />} />
              <Route path="/accountant/documents" element={<FinancialDocuments />} />
              <Route path="/accountant/donations-collections" element={<FinanceDonations />} />
              <Route path="/accountant/system-categories" element={<SharedCategories />} />
              <Route path="/accountant/system-settings" element={<SharedSettings />} />

              {/* Church Admin Routes */}
              <Route path="/church-admin/dashboard" element={<ChurchAdminDashboard />} />
              <Route path="/church-admin/members" element={<MemberRecords />} />
              <Route path="/church-admin/sacraments" element={<SacramentsAndCertificates />} />
              <Route path="/church-admin/sacrament-records" element={<Navigate to="/church-admin/sacraments" replace />} />
              <Route path="/church-admin/certificates" element={<Navigate to="/church-admin/sacraments" replace />} />
              <Route path="/church-admin/calendar" element={<CalendarSchedule />} />
              <Route path="/church-admin/appointments" element={<Navigate to="/church-admin/calendar" replace />} />
              <Route path="/church-admin/scheduling" element={<Navigate to="/church-admin/calendar" replace />} />
              <Route path="/church-admin/service-requests" element={<ServiceRequests />} />
              <Route path="/church-admin/documents" element={<Documents />} />
              <Route path="/church-admin/announcements" element={<Announcements />} />
              <Route path="/church-admin/finance" element={<FinanceDonations />} />
              <Route path="/church-admin/donations-collections" element={<Navigate to="/church-admin/finance" replace />} />
              <Route path="/church-admin/reports" element={<Navigate to="/church-admin/finance" replace />} />

              {/* Secretary Routes */}
              <Route path="/church-admin/secretary/dashboard" element={<SecretaryDashboard />} />
              <Route path="/church-admin/secretary/members" element={<SecretaryMembers />} />
              <Route path="/church-admin/secretary/members/new" element={<AddEditMember />} />
              <Route path="/church-admin/secretary/members/:id/edit" element={<AddEditMember />} />

              {/* User Routes */}
              <Route path="/user/dashboard" element={<UserDashboard />} />
              <Route path="/user/profile" element={<UserProfile />} />
              <Route path="/user/interactions" element={<UserInteractions />} />
              <Route path="/user/sacraments" element={<UserSacraments />} />
              <Route path="/user/requests" element={<UserServiceRequests />} />
              <Route path="/user/service-requests" element={<RequestService />} />
              <Route path="/user/my-service-requests" element={<MyServiceRequests />} />
              <Route path="/user/certificates" element={<UserCertificateRequests />} />
              <Route path="/user/payments" element={<UserPayments />} />
              <Route path="/user/notifications" element={<UserNotifications />} />
              <Route path="/user/my-requests" element={<MyRequests />} />
              <Route path="/user/upload" element={<UserUploadFiles />} />
              <Route path="/user/categories" element={<SharedCategories />} />
              <Route path="/user/settings" element={<SharedSettings />} />

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
