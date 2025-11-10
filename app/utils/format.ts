export const formatCurrency = (amount: number | null | undefined): string => {
  // Handle null, undefined, or NaN values
  const safeAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  
  return new Intl.NumberFormat('en-TZ', {
    style: 'currency',
    currency: 'TZS',
    minimumFractionDigits: 0,
  }).format(safeAmount);
};

export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('en-TZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatPhoneNumber = (phone: string): string => {
  // Remove any non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format as +255 XXX XXX XXX
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{3})$/);
  if (match) {
    return `+255 ${match[1]} ${match[2]} ${match[3]}`;
  }
  return phone;
};
