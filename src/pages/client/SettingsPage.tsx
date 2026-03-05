import { useState } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { TEXT } from '@/config/constants';

export function SettingsPage() {
    const [pushEnabled, setPushEnabled] = useState(false);

    return (
        <div className="pt-20 pb-8 min-h-screen px-4">
            <div className="max-w-lg mx-auto">
                <h1 className="font-heading text-2xl md:text-3xl font-bold text-center mb-8">{TEXT.settings.title}</h1>

                <div className="card-premium p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {pushEnabled ? (
                                <Bell size={20} className="text-accent" />
                            ) : (
                                <BellOff size={20} className="text-text-secondary" />
                            )}
                            <div>
                                <h3 className="font-medium text-sm">{TEXT.settings.notifications}</h3>
                                <p className="text-text-secondary text-xs">{TEXT.settings.notificationsDesc}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setPushEnabled(!pushEnabled)}
                            className={`relative w-12 h-7 rounded-full transition-colors ${pushEnabled ? 'bg-accent' : 'bg-border'}`}
                            role="switch"
                            aria-checked={pushEnabled}
                            aria-label={TEXT.settings.notifications}
                        >
                            <div
                                className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform ${pushEnabled ? 'translate-x-5' : 'translate-x-0.5'
                                    }`}
                            />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
