import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';

import DashboardLayout from './layouts/DashboardLayout';

import StaffDashboard from './pages/Staff/StaffDashboard';
import Members from './pages/Staff/Members';
import MemberProfile from './pages/Staff/MemberProfile';
import MemberCheckIn from './pages/Staff/MemberCheckIn';
import WalkInRegistration from './pages/Staff/WalkInRegistration';

import AdminDashboard from './pages/Admin/AdminDashboard';
import Settings from './pages/Settings';
import Login from './pages/Login';
import RegisterMember from './pages/Staff/RegisterMember';

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Login */}
          <Route path="/login" element={<Login />} />

          {/* Admin */}
          <Route path="/admin/*" element={<AdminDashboard />} />

          {/* Staff Layout */}
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<StaffDashboard />} />
            <Route path="/members" element={<Members />} />
            <Route path="/member-profile" element={<MemberProfile />} />

            {/* Fixed: Render the actual Check-In page */}
            <Route path="/check-in" element={<MemberCheckIn />} />

            {/* Walk-in Registration */}
            <Route
              path="/walk-in-registration"
              element={<WalkInRegistration />}
            />

            <Route path="/register-member" element={<RegisterMember />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}