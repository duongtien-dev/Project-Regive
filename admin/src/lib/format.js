export function oid(doc) {
  if (!doc) return '';
  if (typeof doc === 'string') return doc;
  return doc.id || doc._id || '';
}

export function displayName(user) {
  if (!user) return '—';
  if (typeof user === 'string') return user;
  return user.fullName || user.email || '—';
}

export function formatVnd(value) {
  const n = Number(value) || 0;
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(d);
}

export function formatDateOnly(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium' }).format(d);
}

export function toDateInput(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const tz = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return tz.toISOString().slice(0, 10);
}

export function toIsoStart(dateStr) {
  if (!dateStr) return undefined;
  return new Date(`${dateStr}T00:00:00`).toISOString();
}

export function toIsoEnd(dateStr) {
  if (!dateStr) return undefined;
  return new Date(`${dateStr}T23:59:59`).toISOString();
}

export function classNames(...parts) {
  return parts.filter(Boolean).join(' ');
}
