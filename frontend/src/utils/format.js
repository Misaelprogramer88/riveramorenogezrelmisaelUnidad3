export function formatMxn(amount) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2
  }).format(Number(amount) || 0);
}

export function formatUsd(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(Number(amount) || 0);
}

export function formatDateTime(isoString) {
  if (!isoString) return '—';
  try {
    return new Intl.DateTimeFormat('es-MX', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date(isoString));
  } catch {
    return isoString;
  }
}

export function truncateJwt(token) {
  if (!token) return 'Sin token activo';
  if (token.length <= 36) return token;
  return `${token.slice(0, 22)}...${token.slice(-14)}`;
}

export function decodeJwtPayload(token) {
  if (!token) return null;
  try {
    const [, payloadBase64] = token.split('.');
    const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join('')
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}
