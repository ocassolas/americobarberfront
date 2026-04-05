import { Outlet, useLocation } from 'react-router-dom';
import { ClientHeader } from './ClientHeader';
import { ClientFooter } from './ClientFooter';
import { ToastContainer } from '@/components/shared/ToastContainer';
import { PageTransition } from '@/components/shared/PageTransition';
import { FloatingBookingButton } from '@/components/shared/FloatingBookingButton';
import { LoadingBar } from '@/components/shared/LoadingBar';
import { HelpChatbot } from '@/components/shared/HelpChatbot';

export function ClientLayout() {
    const location = useLocation();
    const hideHelpChatbot = location.pathname === '/meus-agendamentos';

    return (
        <div className="min-h-screen flex flex-col">
            <ClientHeader />
            <main className="flex-1">
                <PageTransition>
                    <Outlet />
                </PageTransition>
            </main>
            <ClientFooter />
            <FloatingBookingButton />
            {!hideHelpChatbot && <HelpChatbot />}
            <LoadingBar />
            <ToastContainer />
        </div>
    );
}
