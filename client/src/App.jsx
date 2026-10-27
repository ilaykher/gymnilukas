import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/useAuth';

import DashboardLayout from './layouts/DashboardLayout';

import StaffDashboard from './pages/Staff/StaffDashboard';
import Members from './pages/Staff/Members';
import MemberProfile from './pages/Staff/MemberProfile';
import MemberCheckin from './pages/Staff/MemberCheckin';
import WalkInRegistration from './pages/Staff/WalkInRegistration';
import RealtimeActivity from './pages/Staff/RealtimeActivity';
import RegisterMember from './pages/Staff/RegisterMember';

import AdminDashboard from './pages/Admin/AdminDashboard';

import Settings from './pages/Settings';
import Login from './pages/Login';
import ChangePassword from './pages/ChangePassword';

function RequireAuth({ roles, children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-stone-500" role="status">Verifying session…</div>;
  }
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (user.mustChangePassword && location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />;
  }
  if (roles && !roles.includes(user.role)) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }
  return children;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/change-password" element={<RequireAuth><ChangePassword /></RequireAuth>} />

            <Route
              path="/admin/*"
              element={<RequireAuth roles={['admin']}><AdminDashboard /></RequireAuth>}
            />

            <Route element={<RequireAuth roles={['employee']}><DashboardLayout /></RequireAuth>}>
              <Route path="/dashboard" element={<StaffDashboard />} />
              <Route path="/members" element={<Members />} />
              <Route path="/member-profile" element={<MemberProfile />} />
              <Route path="/check-in" element={<MemberCheckin />} />
              <Route path="/realtime-activity" element={<RealtimeActivity />} />

              <Route path="/walk-in-registration" element={<WalkInRegistration />} />

              <Route path="/register-member" element={<RegisterMember />} />
              <Route path="/settings" element={<Settings />} />
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}