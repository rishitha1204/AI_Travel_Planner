import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute.jsx';
import { AppLayout } from '../layouts/AppLayout.jsx';
import { AuthLayout } from '../layouts/AuthLayout.jsx';
import { Login } from '../pages/Login.jsx';
import { Register } from '../pages/Register.jsx';
import { Dashboard } from '../pages/Dashboard.jsx';
import { CreateTrip } from '../pages/CreateTrip.jsx';
import { TripDetails } from '../pages/TripDetails.jsx';
import { Profile } from '../pages/Profile.jsx';

export function AppRouter() {
  return (
    <Routes>
      {/* Public auth routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Protected app routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/trips/new" element={<CreateTrip />} />
          <Route path="/trips/:tripId" element={<TripDetails />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}