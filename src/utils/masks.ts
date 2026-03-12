export const maskCPF = (value: string) => {
    return value
        .replace(/\D/g, '')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1');
};

export const maskPhone = (value: string) => {
    return value
        .replace(/\D/g, '')
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .replace(/(-\d{4})\d+?$/, '$1');
};

export const maskCurrency = (value: string | number) => {
    const cleanValue = String(value).replace(/\D/g, '');
    const options = { style: 'currency' as const, currency: 'BRL' };
    return new Intl.NumberFormat('pt-BR', options).format(
        parseFloat(cleanValue) / 100
    );
};

export const parseCurrencyToNumber = (value: string) => {
    return parseFloat(value.replace(/\D/g, '')) / 100 || 0;
};

export const onlyNumbers = (value: string) => {
    return value.replace(/\D/g, '');
};
