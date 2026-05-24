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
import { ClientHistoryPage } from '@/pages/client/ClientHistoryPage';
import { ClientLoginPage } from '@/pages/client/ClientLoginPage';
import { ClientRegisterPage } from '@/pages/client/ClientRegisterPage';

// Admin pages
import { DashboardPage } from '@/pages/admin/DashboardPage';
import { AgendaPage } from '@/pages/admin/AgendaPage';
import { ServicesPage } from '@/pages/admin/ServicesPage';
import { HistoryPage } from '@/pages/admin/HistoryPage';
import { WorkHoursPage } from '@/pages/admin/WorkHoursPage';
import { AdminSettingsPage } from '@/pages/admin/AdminSettingsPage';
import { BarbersManagementPage } from '@/pages/admin/BarbersManagementPage';
import { ClientsManagementPage } from '@/pages/admin/ClientsManagementPage';
import { GalleryManagementPage } from '@/pages/admin/GalleryManagementPage';
import { CancellationPenaltiesPage } from '@/pages/admin/CancellationPenaltiesPage';

function isAdminUser(user: ReturnType<typeof useAuthStore.getState>['user']) {
  return user?.role === 'ROLE_ADMIN';
}

function AdminRootRedirect() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  if (isAuthenticated && isAdminUser(user)) return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/entrar" replace />;
}

function AdminGuard({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  if (!isAuthenticated) return <Navigate to="/entrar" replace />;
  if (!isAdminUser(user)) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function SuperAdminGuard({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  if (!user?.isOwner) return <Navigate to="/admin/dashboard" replace />;
  return <>{children}</>;
}

function ClientAreaGuard({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  if (isAdminUser(user)) return <Navigate to="/admin/dashboard" replace />;
  return <>{children}</>;
}

function ClientGuard({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  if (isAdminUser(user)) return <Navigate to="/admin/dashboard" replace />;
  if (!isAuthenticated) return <Navigate to="/entrar" replace />;
  return <>{children}</>;
}

function ClientAuthGuard({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  if (isAuthenticated && isAdminUser(user)) return <Navigate to="/admin/dashboard" replace />;
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
        <Route element={<ClientAreaGuard><ClientLayout /></ClientAreaGuard>}>
          {/* Public client routes */}
          <Route path="/" element={<LandingPage />} />

          {/* Authenticated client routes */}
          <Route path="/agendar" element={<ClientGuard><BookingPage /></ClientGuard>} />
          <Route path="/meus-agendamentos" element={<ClientGuard><MyAppointmentsPage /></ClientGuard>} />
          <Route path="/historico" element={<ClientGuard><ClientHistoryPage /></ClientGuard>} />
          <Route path="/configuracoes" element={<ClientGuard><SettingsPage /></ClientGuard>} />
        </Route>

        {/* Client Auth */}
        <Route path="/entrar" element={<ClientAuthGuard><ClientLoginPage /></ClientAuthGuard>} />
        <Route path="/cadastrar" element={<ClientAuthGuard><ClientRegisterPage /></ClientAuthGuard>} />

        <Route path="/admin" element={<AdminRootRedirect />} />

        {/* Admin authenticated routes */}
        <Route element={<AdminGuard><AdminLayout /></AdminGuard>}>
          <Route path="/admin/dashboard" element={<DashboardPage />} />
          <Route path="/admin/agenda" element={<AgendaPage />} />
          <Route path="/admin/servicos" element={<ServicesPage />} />
          <Route path="/admin/barbeiros" element={<SuperAdminGuard><BarbersManagementPage /></SuperAdminGuard>} />
          <Route path="/admin/clientes" element={<ClientsManagementPage />} />
          <Route path="/admin/historico" element={<HistoryPage />} />
          <Route path="/admin/horarios" element={<WorkHoursPage />} />
          <Route path="/admin/configuracoes" element={<AdminSettingsPage />} />
          <Route path="/admin/galeria" element={<SuperAdminGuard><GalleryManagementPage /></SuperAdminGuard>} />
          <Route path="/admin/comprovantes" element={<CancellationPenaltiesPage />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
