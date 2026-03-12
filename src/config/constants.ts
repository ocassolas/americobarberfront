import type { BusinessConfig, AdminCredentials } from '@/types';

export const BUSINESS: BusinessConfig = {
    name: 'Américo Barber',
    subtitle: 'Estilo e Precisão',
    address: 'Av. General Anápio Gomes, 296 - Cachoeirinha/RS',
    addressLink: 'https://maps.google.com/?q=Av.+General+Anapio+Gomes+296+Cachoeirinha+RS',
    phone: '+55 51 99303-3500',
    whatsapp: 'https://wa.me/5551993033500',
    instagram: '@americo_barber_club',
    workingHours: '',
    slotInterval: 30,
};

export const ADMIN_CREDENTIALS: AdminCredentials = {
    username: 'admin',
    password: 'admin123',
};

export const TEXT = {
    hero: {
        title: 'Estilo e Precisão',
        subtitle: 'Tradição e modernidade em cada corte. Agende seu horário e viva a experiência Américo Barber.',
        cta: 'Agendar Horário',
    },
    sections: {
        barbers: 'Nossos Barbeiros',
        services: 'Serviços',
        info: 'Informações',
    },
    booking: {
        title: 'Agendar Horário',
        steps: ['Barbeiro', 'Serviços', 'Data', 'Horário', 'Seus Dados', 'Confirmação'],
        noPreference: 'Sem preferência',
        selectService: 'Selecione ao menos um serviço',
        noSlots: 'Nenhum horário disponível nesta data. Tente outro dia.',
        prev: 'Voltar',
        next: 'Próximo',
        confirm: 'Confirmar Agendamento',
        success: 'Agendamento confirmado com sucesso!',
    },
    myAppointments: {
        title: 'Meus Agendamentos',
        subtitle: 'Informe seu telefone para consultar seus agendamentos',
        phone: 'Telefone celular',
        search: 'Buscar',
        empty: 'Nenhum agendamento encontrado para este número.',
        cancel: 'Cancelar agendamento',
        cancelConfirm: 'Tem certeza que deseja cancelar este agendamento?',
        cancelled: 'Agendamento cancelado com sucesso.',
    },
    admin: {
        login: 'Área Administrativa',
        loginSubtitle: 'Acesse o painel de gerenciamento',
        username: 'Usuário',
        password: 'Senha',
        enter: 'Entrar',
        invalidCredentials: 'Usuário ou senha inválidos.',
        dashboard: 'Dashboard',
        agenda: 'Agenda',
        services: 'Serviços',
        history: 'Histórico',
        workHours: 'Horários',
        barbers: 'Barbeiros',
        clients: 'Clientes',
        settings: 'Configurações',
        logout: 'Sair',
    },
    settings: {
        title: 'Configurações',
        notifications: 'Notificações Push',
        notificationsDesc: 'Receba lembretes sobre seus agendamentos',
    },
    footer: {
        copyright: '© 2026 Américo Barber. Todos os direitos reservados.',
    },
} as const;
