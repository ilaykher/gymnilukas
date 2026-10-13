import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import StaffDashboard from './pages/StaffDashboard';
import Members from './pages/Members';
import MemberProfile from './pages/MemberProfile';
import Settings from './pages/Settings';
import Login from './pages/Login';
import MemberCheckIn from './pages/MemberCheckIn';
import WalkInRegistration from './pages/WalkInRegistration';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/check-in" element={<MemberCheckIn />} />
        
        {/* Lahat ng may sidebar layout ay dito nakagrupo */}
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<StaffDashboard />} />
          <Route path="/members" element={<Members />} />
          <Route path="/member-profile" element={<MemberProfile />} />
          <Route path="/walk-in-registration" element={<WalkInRegistration />} />
          <Route path="/register-member" element={<StaffDashboard />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}