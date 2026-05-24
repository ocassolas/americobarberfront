export function isLateCancellationWindow(date: string, startTime: string): boolean {
    const normalizedTime = startTime.length === 5 ? `${startTime}:00` : startTime;
    const appointment = new Date(`${date}T${normalizedTime}`);
    const hoursUntil = (appointment.getTime() - Date.now()) / (1000 * 60 * 60);
    return hoursUntil >= 0 && hoursUntil < 12;
}

export function formatPenaltyAmount(amount: number): string {
    return amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
