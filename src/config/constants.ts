import type { BusinessConfig, AdminCredentials } from '@/types';

export const BUSINESS: BusinessConfig = {
    name: 'Américo Barber',
    subtitle: 'Estilo e Precisão',
    address: 'Rua Augusta, 1234 - Consolação, São Paulo - SP',
    addressLink: 'https://maps.google.com/?q=Rua+Augusta+1234+Consolacao+Sao+Paulo',
    phone: '(11) 99876-5432',
    whatsapp: 'https://wa.me/5511998765432',
    instagram: 'https://instagram.com/americobarber',
    workingHours: 'Seg a Sáb: 08:00 - 20:00',
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
