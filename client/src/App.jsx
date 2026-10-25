import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';

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

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* The app always starts at the login page */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />

          {/* Admin routes */}
          <Route path="/admin/*" element={<AdminDashboard />} />

          {/* Staff routes */}
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<StaffDashboard />} />
            <Route path="/members" element={<Members />} />
            <Route path="/member-profile" element={<MemberProfile />} />
            <Route path="/check-in" element={<MemberCheckin />} />
            <Route path="/realtime-activity" element={<RealtimeActivity />} />

            <Route
              path="/walk-in-registration"
              element={<WalkInRegistration />}
            />

            <Route path="/register-member" element={<RegisterMember />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          {/* Unknown URLs go back to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}