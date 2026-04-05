import { TEXT } from '@/config/constants';

export function ClientFooter() {
    return (
        <footer className="bg-bg-card border-t border-border py-8 px-4">
            <div className="max-w-7xl mx-auto flex items-center justify-center">
                <p className="text-text-secondary text-sm text-center">{TEXT.footer.copyright}</p>
            </div>
        </footer>
    );
}
