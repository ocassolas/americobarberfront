import { Instagram, MessageCircle } from 'lucide-react';
import { BUSINESS, TEXT } from '@/config/constants';

export function ClientFooter() {
    return (
        <footer className="bg-bg-card border-t border-border py-8 px-4">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center font-heading font-bold text-bg-primary text-xs">
                        AB
                    </div>
                    <span className="font-heading font-semibold">{BUSINESS.name}</span>
                </div>

                <p className="text-text-secondary text-sm text-center">{TEXT.footer.copyright}</p>

                <div className="flex items-center gap-3">
                    <a
                        href={BUSINESS.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg hover:bg-accent/10 text-text-secondary hover:text-accent transition"
                        aria-label="Instagram"
                    >
                        <Instagram size={20} />
                    </a>
                    <a
                        href={BUSINESS.whatsapp}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg hover:bg-accent/10 text-text-secondary hover:text-accent transition"
                        aria-label="WhatsApp"
                    >
                        <MessageCircle size={20} />
                    </a>
                </div>
            </div>
        </footer>
    );
}
