import { Outlet, useLocation } from 'react-router-dom';
import { ClientHeader } from './ClientHeader';
import { ClientFooter } from './ClientFooter';
import { ToastContainer } from '@/components/shared/ToastContainer';
import { PageTransition } from '@/components/shared/PageTransition';
import { FloatingBookingButton } from '@/components/shared/FloatingBookingButton';
import { LoadingBar } from '@/components/shared/LoadingBar';
import { HelpChatbot } from '@/components/shared/HelpChatbot';
import { PaymentPendingOverlay } from '@/components/shared/PaymentPendingOverlay';
import { usePaymentPenalty } from '@/hooks/usePaymentPenalty';

export function ClientLayout() {
    const location = useLocation();
    const hideHelpChatbot = location.pathname === '/meus-agendamentos' || location.pathname === '/historico';
    const { penalty, refresh, clearPenalty } = usePaymentPenalty();

    return (
        <div className="min-h-screen flex flex-col">
            <ClientHeader />
            <main className={`flex-1 ${penalty ? 'pointer-events-none select-none' : ''}`}>
                <PageTransition>
                    <Outlet />
                </PageTransition>
            </main>
            <ClientFooter />
            <FloatingBookingButton />
            {!hideHelpChatbot && <HelpChatbot />}
            <LoadingBar />
            <ToastContainer />

            {penalty && (
                <PaymentPendingOverlay
                    penalty={penalty}
                    onProofSubmitted={() => {
                        clearPenalty();
                        refresh();
                    }}
                />
            )}
        </div>
    );
}
