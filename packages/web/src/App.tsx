import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { RoleSwitcher } from './components/RoleSwitcher';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import { LandingPage } from './pages/LandingPage';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { EventDetailsPage } from './pages/EventDetailsPage';
import { MyTicketsPage } from './pages/MyTicketsPage';
import { PublicTicketPage } from './pages/PublicTicketPage';
import { OrganizerCreatePage } from './pages/OrganizerCreatePage';
import { OrganizerDashboardPage } from './pages/OrganizerDashboardPage';
import { GatekeeperPage } from './pages/GatekeeperPage';
import { OrderSuccessPage } from './pages/OrderSuccessPage';
import { SupportWidget } from './components/SupportWidget';

const AppLayout: React.FC = () => {
  const location = useLocation();

  // Pages with their own full-screen layout (no shared Navbar/Footer/RoleSwitcher)
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const isLandingPage = location.pathname === '/';

  if (isAuthPage) {
    return (
      <main className="min-h-screen w-full bg-white flex items-center justify-center overflow-y-auto lg:overflow-hidden">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </main>
    );
  }

  if (isLandingPage) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
      </Routes>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <RoleSwitcher />
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* App home — events catalog */}
          <Route path="/home" element={<HomePage />} />
          <Route path="/event/:id" element={<EventDetailsPage />} />
          <Route path="/events/:id" element={<EventDetailsPage />} />
          <Route path="/order-success" element={<OrderSuccessPage />} />
          <Route path="/ticket/:shareToken" element={<PublicTicketPage />} />

          {/* Customer Protected Routes */}
          <Route
            path="/my-tickets"
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER', 'ORGANIZER']}>
                <MyTicketsPage />
              </ProtectedRoute>
            }
          />

          {/* Organizer Strictly Protected Routes (No Customer or Gatekeeper allowed) */}
          <Route
            path="/organizer/create"
            element={
              <ProtectedRoute allowedRoles={['ORGANIZER']}>
                <OrganizerCreatePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/dashboard"
            element={
              <ProtectedRoute allowedRoles={['ORGANIZER']}>
                <OrganizerDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Gatekeeper Strictly Protected Routes */}
          <Route
            path="/gatekeeper"
            element={
              <ProtectedRoute allowedRoles={['GATEKEEPER', 'ORGANIZER']}>
                <GatekeeperPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </main>
      <Footer />
      <SupportWidget />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
