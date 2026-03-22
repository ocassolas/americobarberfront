import { Outlet } from 'react-router-dom';
import { ClientHeader } from './ClientHeader';
import { ClientFooter } from './ClientFooter';
import { ToastContainer } from '@/components/shared/ToastContainer';
import { PageTransition } from '@/components/shared/PageTransition';
import { FloatingBookingButton } from '@/components/shared/FloatingBookingButton';
import { LoadingBar } from '@/components/shared/LoadingBar';

export function ClientLayout() {
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
            <LoadingBar />
            <ToastContainer />
        </div>
    );
}
