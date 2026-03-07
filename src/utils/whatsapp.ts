export const formatWhatsAppMessage = (type: 'booking' | 'cancellation', data: any) => {
    const businessName = "Américo Barber"; // This could come from a config/store
    
    if (type === 'booking') {
        const servicesStr = data.services.map((s: any) => s.name).join(', ');
        const dateStr = data.date.split('-').reverse().join('/');
        const timeStr = `${String(data.startTime.hour).padStart(2, '0')}:${String(data.startTime.minute).padStart(2, '0')}`;
        
        return window.encodeURIComponent(
            `Olá! Gostaria de confirmar meu agendamento na *${businessName}*:\n\n` +
            `📅 *Data:* ${dateStr}\n` +
            `🕒 *Horário:* ${timeStr}\n` +
            `✂️ *Serviços:* ${servicesStr}\n` +
            `👤 *Barbeiro:* ${data.barberName}\n` +
            `💰 *Valor Total:* ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.totalPrice)}\n\n` +
            `Até lá!`
        );
    }
    
    if (type === 'cancellation') {
        const dateStr = data.date.split('-').reverse().join('/');
        const timeStr = `${String(data.startTime.hour).padStart(2, '0')}:${String(data.startTime.minute).padStart(2, '0')}`;
        
        return window.encodeURIComponent(
            `Olá, gostaria de cancelar meu agendamento na *${businessName}*:\n\n` +
            `📅 *Data:* ${dateStr}\n` +
            `🕒 *Horário:* ${timeStr}\n` +
            `👤 *Barbeiro:* ${data.barberName}\n\n` +
            `Motivo: ${data.observation || 'Não informado'}`
        );
    }
    
    return '';
};

export const openWhatsApp = (phone: string, message: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const url = `https://wa.me/55${cleanPhone}?text=${message}`;
    window.open(url, '_blank');
};
