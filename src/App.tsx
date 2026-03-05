import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useThemeStore } from '@/stores/useThemeStore';
import { useAuthStore } from '@/stores/useAuthStore';

// Layouts
import { ClientLayout } from '@/components/layout/ClientLayout';
import { AdminLayout } from '@/components/layout/AdminLayout';

// Client pages
import { LandingPage } from '@/pages/client/LandingPage';
import { BookingPage } from '@/pages/client/BookingPage';
import { MyAppointmentsPage } from '@/pages/client/MyAppointmentsPage';
import { SettingsPage } from '@/pages/client/SettingsPage';

// Admin pages
import { AdminLoginPage } from '@/pages/admin/AdminLoginPage';
import { DashboardPage } from '@/pages/admin/DashboardPage';
import { AgendaPage } from '@/pages/admin/AgendaPage';
import { ServicesPage } from '@/pages/admin/ServicesPage';
import { HistoryPage } from '@/pages/admin/HistoryPage';
import { WorkHoursPage } from '@/pages/admin/WorkHoursPage';
import { AdminSettingsPage } from '@/pages/admin/AdminSettingsPage';

function AdminGuard({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/admin" replace />;
  return <>{children}</>;
}

function App() {
  const isDark = useThemeStore((s) => s.isDark);

  useEffect(() => {
    document.body.className = isDark ? 'dark' : 'light';
  }, [isDark]);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => { });
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Client routes */}
        <Route element={<ClientLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/agendar" element={<BookingPage />} />
          <Route path="/meus-agendamentos" element={<MyAppointmentsPage />} />
          <Route path="/configuracoes" element={<SettingsPage />} />
        </Route>

        {/* Admin login */}
        <Route path="/admin" element={<AdminLoginPage />} />

        {/* Admin authenticated routes */}
        <Route element={<AdminGuard><AdminLayout /></AdminGuard>}>
          <Route path="/admin/dashboard" element={<DashboardPage />} />
          <Route path="/admin/agenda" element={<AgendaPage />} />
          <Route path="/admin/servicos" element={<ServicesPage />} />
          <Route path="/admin/historico" element={<HistoryPage />} />
          <Route path="/admin/horarios" element={<WorkHoursPage />} />
          <Route path="/admin/configuracoes" element={<AdminSettingsPage />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
