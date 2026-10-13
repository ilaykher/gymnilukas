import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import StaffDashboard from './pages/Staff/StaffDashboard';
import Members from './pages/Staff/Members';
import MemberProfile from './pages/Staff/MemberProfile';
import MemberCheckIn from './pages/Staff/MemberCheckIn';
import WalkInRegistration from './pages/Staff/WalkInRegistration';
import AdminDashboard from './pages/Admin/AdminDashboard';
import Settings from './pages/Settings';
import Login from './pages/Login';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/admin/*" element={<AdminDashboard />} />

        <Route element={<DashboardLayout />}>
          <Route path="/" element={<StaffDashboard />} />
          <Route path="/members" element={<Members />} />
          <Route path="/member-profile" element={<MemberProfile />} />
          <Route path="/check-in" element={<StaffDashboard />} />
          <Route path="/walk-in-registration" element={<WalkInRegistration />} />
          <Route path="/register-member" element={<StaffDashboard />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}