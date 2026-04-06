import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageCircle,
    X,
    Calendar,
    Scissors,
    Clock,
    User,
    CheckCircle,
    ArrowRight,
    Ban,
    DollarSign,
    ChevronLeft
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

type QuestionInfo = {
    id: string;
    shortLabel: string;
    fullQuestion: string;
    answer: React.ReactNode;
};

// Dados das perguntas e respostas do Bot
const FAQ_DATA: QuestionInfo[] = [
    {
        id: 'como-agendar',
        shortLabel: 'Como agendo um horário?',
        fullQuestion: 'Olá! Poderia me ensinar como marcar um horário?',
        answer: (
            <div className="space-y-3">
                <p className="text-sm text-text-primary">Claro! É super simples. Você pode começar clicando em "Agendar" no menu. Depois, é só seguir este passo a passo:</p>

                <div className="flex items-start gap-3 p-2.5 bg-bg-card border border-border rounded-xl">
                    <User className="text-accent mt-0.5 flex-shrink-0" size={18} />
                    <div className="text-sm text-text-secondary"><strong className="text-text-primary">1. Profissional:</strong> Escolha quem vai te atender ou deixe "Sem preferência".</div>
                </div>

                <div className="flex items-start gap-3 p-2.5 bg-bg-card border border-border rounded-xl">
                    <Scissors className="text-accent mt-0.5 flex-shrink-0" size={18} />
                    <div className="text-sm text-text-secondary"><strong className="text-text-primary">2. Serviço:</strong> Selecione os cortes ou serviços desejados.</div>
                </div>

                <div className="flex items-start gap-3 p-2.5 bg-bg-card border border-border rounded-xl">
                    <Calendar className="text-accent mt-0.5 flex-shrink-0" size={18} />
                    <div className="text-sm text-text-secondary"><strong className="text-text-primary">3. Data e Hora:</strong> Navegue pelo calendário e escolha o melhor horário.</div>
                </div>

                <div className="flex items-start gap-3 p-2.5 bg-bg-card border border-border rounded-xl">
                    <CheckCircle className="text-accent mt-0.5 flex-shrink-0" size={18} />
                    <div className="text-sm text-text-secondary"><strong className="text-text-primary">4. Confirmação:</strong> Preencha seus dados de contato e voilà! Está agendado. 🎉</div>
                </div>

                <Link to="/agendar" className="mt-4 flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-bg-primary font-bold py-2.5 px-4 rounded-xl transition text-sm">
                    Ir para o Agendamento <ArrowRight size={16} />
                </Link>
            </div>
        )
    },
    {
        id: 'ver-horarios',
        shortLabel: 'Ver meus horários',
        fullQuestion: 'Onde encontro os horários que eu já agendei?',
        answer: (
            <div className="space-y-3">
                <p className="text-sm text-text-primary">Para visualizar todos os seus horários agendados e histórico, você precisa acessar seu <strong>Perfil</strong>.</p>
                <div className="flex items-center gap-3 p-3 bg-bg-card border border-border rounded-xl mt-2">
                    <Clock className="text-accent flex-shrink-0" size={24} />
                    <p className="text-sm text-text-secondary">Abra o menu principal e clique em <strong className="text-text-primary">"Meus Agendamentos"</strong>.</p>
                </div>
                <Link to="/meus-agendamentos" className="mt-4 flex items-center justify-center gap-2 border border-accent text-accent hover:bg-accent/10 font-bold py-2.5 px-4 rounded-xl transition text-sm">
                    Ver Meus Agendamentos <ArrowRight size={16} />
                </Link>
            </div>
        )
    },
    {
        id: 'cancelar',
        shortLabel: 'Cancelar agendamento',
        fullQuestion: 'Tive um imprevisto. Como cancelo meu horário?',
        answer: (
            <div className="space-y-3">
                <p className="text-sm text-text-primary">Sem problemas. Siga estes passos para liberar a vaga:</p>
                <ol className="list-decimal pl-4 text-sm text-text-secondary space-y-2 mt-2">
                    <li>Vá na tela de <strong className="text-text-primary">Meus Agendamentos</strong>.</li>
                    <li>Localize o horário que deseja cancelar.</li>
                    <li>Clique no botão com o ícone de Cancelar <Ban size={14} className="inline text-error mx-1" />.</li>
                    <li>Confirme a ação.</li>
                </ol>
                <div className="p-3 bg-error/10 border border-error/30 rounded-xl mt-3 flex gap-3 items-start">
                    <Clock size={18} className="text-error flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-text-secondary">Pedimos que cancele com a maior antecedência possível para que outro cliente aproveite o horário!</p>
                </div>
            </div>
        )
    },
    {
        id: 'precos',
        shortLabel: 'Saber valores',
        fullQuestion: 'Como vejo a tabela de preços dos serviços?',
        answer: (
            <div className="space-y-3">
                <p className="text-sm text-text-primary">A nossa tabela completa de preços fica disponível no próprio sistema de agendamento!</p>
                <div className="flex items-start gap-3 p-3 bg-bg-card border border-border rounded-xl mt-2">
                    <DollarSign className="text-success flex-shrink-0 mt-0.5" size={20} />
                    <p className="text-sm text-text-secondary">Você pode iniciar o fluxo clicando em <strong className="text-text-primary">Agendar</strong>. Após escolher o profissional, você verá uma tela linda com a lista de serviços, seus preços exatos e a duração.</p>
                </div>
                <Link to="/agendar" className="mt-4 flex items-center justify-center gap-2 bg-text-primary text-bg-primary hover:bg-text-secondary font-bold py-2.5 px-4 rounded-xl transition text-sm">
                    Simular Agendamento <ArrowRight size={16} />
                </Link>
            </div>
        )
    }
];

export function HelpChatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedQuestion, setSelectedQuestion] = useState<QuestionInfo | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const location = useLocation();

    // Auto-scroll ao selecionar pergunta
    useEffect(() => {
        if (selectedQuestion && scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [selectedQuestion]);

    if (location.pathname === '/agendar') {
        return null;
    }

    return (
        <>
            {/* Modal/Window do Chatbot */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="fixed bottom-24 right-4 sm:right-6 w-[340px] max-w-[calc(100vw-32px)] bg-bg-primary border border-border shadow-2xl rounded-2xl overflow-hidden z-50 flex flex-col"
                        style={{ maxHeight: 'calc(100vh - 120px)' }}
                    >
                        {/* Header */}
                        <div className="bg-bg-card p-4 border-b border-border flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center relative">
                                    <MessageCircle className="text-accent" size={20} />
                                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-success border-2 border-bg-card rounded-full" />
                                </div>
                                <div>
                                    <h3 className="font-heading font-bold text-sm text-text-primary leading-tight">Suporte Virtual</h3>
                                    <span className="text-xs text-success font-medium">Online agora</span>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 text-text-secondary transition-colors"
                                aria-label="Fechar ajuda"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Corpo do Chat */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                            {/* Boas vindas do Bot */}
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-accent/20 flex-shrink-0 flex items-center justify-center mt-1">
                                    <img src="/logo.png" alt="Bot" className="w-full h-full object-cover p-1" />
                                </div>
                                <div className="bg-bg-card border border-border rounded-2xl rounded-tl-sm p-3.5 shadow-sm max-w-[85%]">
                                    <p className="text-sm text-text-primary">
                                        Olá! Boas-vindas ao <strong>Américo Barber</strong>. Eu sou o seu assistente virtual de navegação! 💈
                                    </p>
                                    {!selectedQuestion && (
                                        <p className="text-sm text-text-primary mt-2">
                                            Se deseja entender como algo funciona no site, selecione uma das opções abaixo:
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Menu Principal */}
                            {!selectedQuestion ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="pl-11 space-y-2"
                                >
                                    {FAQ_DATA.map((faq) => (
                                        <button
                                            key={faq.id}
                                            onClick={() => setSelectedQuestion(faq)}
                                            className="w-full text-left bg-transparent border border-accent/40 text-accent hover:bg-accent hover:text-bg-primary rounded-xl px-4 py-2.5 text-sm font-medium transition-all shadow-sm"
                                        >
                                            {faq.shortLabel}
                                        </button>
                                    ))}
                                    <div className="text-center pt-2">
                                        <span className="text-[10px] text-text-disabled uppercase tracking-widest font-semibold">Respostas Automáticas</span>
                                    </div>
                                </motion.div>
                            ) : (
                                /* Interação de Pergunta/Resposta selecionada */
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-4"
                                >
                                    {/* Pergunta do Usuário */}
                                    <div className="flex justify-end">
                                        <div className="bg-accent text-bg-primary rounded-2xl rounded-tr-sm p-3.5 shadow-md max-w-[85%]">
                                            <p className="text-sm font-medium">{selectedQuestion.fullQuestion}</p>
                                        </div>
                                    </div>

                                    {/* Resposta do Bot */}
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 rounded-full bg-accent/20 flex-shrink-0 flex items-center justify-center mt-1">
                                            <img src="/logo.png" alt="Bot" className="w-full h-full object-cover p-1" />
                                        </div>
                                        <div className="bg-bg-card border border-border rounded-2xl rounded-tl-sm p-3.5 shadow-sm max-w-[85%]">
                                            {selectedQuestion.answer}
                                        </div>
                                    </div>

                                    {/* Action para voltar */}
                                    <div className="pl-11 pt-2">
                                        <button
                                            onClick={() => setSelectedQuestion(null)}
                                            className="flex items-center gap-2 text-xs text-text-secondary hover:text-accent transition-colors font-medium border border-border bg-bg-input px-3 py-1.5 rounded-full"
                                        >
                                            <ChevronLeft size={14} /> Mostrar outras dúvidas
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Float Button Toggle */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Dúvidas? Converse com nosso Assistente Visual"
                className={`fixed z-40 right-4 sm:right-6 flex items-center justify-center w-[54px] h-[54px] shadow-xl shadow-bg-primary/50 transition-colors border ${isOpen
                        ? 'bg-bg-card text-text-secondary border-border bottom-6'
                        : 'bg-bg-card text-accent border-accent/30 hover:bg-accent/10 bottom-4 sm:bottom-6'
                    } rounded-full`}
            >
                {isOpen ? <X size={24} /> : <MessageCircle size={28} />}
                
                {/* Ping animation para atrair novos usuarios levemente */}
                {!isOpen && (
                    <span className="absolute top-0 right-0 w-3 h-3 flex">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-accent border-2 border-bg-card"></span>
                    </span>
                )}
            </motion.button>
        </>
    );
}
