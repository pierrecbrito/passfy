import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { RoleSwitcher } from './components/RoleSwitcher';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Pages
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { EventDetailsPage } from './pages/EventDetailsPage';
import { MyTicketsPage } from './pages/MyTicketsPage';
import { PublicTicketPage } from './pages/PublicTicketPage';
import { OrganizerCreatePage } from './pages/OrganizerCreatePage';
import { OrganizerDashboardPage } from './pages/OrganizerDashboardPage';
import { GatekeeperPage } from './pages/GatekeeperPage';

const AppLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <RoleSwitcher />
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/event/:id" element={<EventDetailsPage />} />
          <Route path="/ticket/:shareToken" element={<PublicTicketPage />} />

          {/* Customer Routes */}
          <Route path="/my-tickets" element={<MyTicketsPage />} />

          {/* Organizer Routes */}
          <Route path="/organizer/create" element={<OrganizerCreatePage />} />
          <Route path="/organizer/dashboard" element={<OrganizerDashboardPage />} />

          {/* Gatekeeper Routes */}
          <Route path="/gatekeeper" element={<GatekeeperPage />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
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
