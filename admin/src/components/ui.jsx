import { X } from 'lucide-react';
import { BADGE_TONE } from '../lib/constants';
import { classNames } from '../lib/format';

const buttonStyles = {
  primary:
    'bg-forest text-lime hover:bg-ink shadow-[0_10px_24px_-12px_rgba(22,53,40,0.7)]',
  ghost: 'bg-white/70 text-forest hover:bg-white border border-forest/10',
  outline: 'bg-transparent text-forest border border-forest/20 hover:bg-white',
  danger: 'bg-rose text-white hover:bg-rose/90',
  lime: 'bg-lime text-ink hover:bg-lime/90',
};

export function Button({
  children,
  variant = 'primary',
  className,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      className={classNames(
        'inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50',
        buttonStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

const tones = {
  ok: 'bg-moss/12 text-moss',
  warn: 'bg-clay/12 text-clay',
  danger: 'bg-rose/10 text-rose',
  info: 'bg-leaf/12 text-leaf',
  muted: 'bg-ink/8 text-ink/70',
};

export function Badge({ value, map, className }) {
  const tone = tones[BADGE_TONE[value] || 'muted'] || tones.muted;
  return (
    <span
      className={classNames(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize',
        tone,
        className
      )}
    >
      {map?.[value] || value || '—'}
    </span>
  );
}

export function Card({ children, className }) {
  return (
    <div
      className={classNames(
        'rounded-3xl border border-forest/8 bg-paper/90 p-5 shadow-[0_16px_40px_-28px_rgba(16,35,26,0.45)]',
        className
      )}
    >
      {children}
    </div>
  );
}

export function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? (
          <p className="mb-1 text-xs font-semibold tracking-[0.18em] text-moss uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="font-display text-3xl tracking-tight text-ink sm:text-4xl">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-sm text-ink/65">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function Field({ label, children }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium tracking-wide text-ink/60 uppercase">{label}</span>
      {children}
    </label>
  );
}

const controlClass =
  'w-full rounded-2xl border border-forest/12 bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition placeholder:text-ink/35 focus:border-moss/40 focus:ring-4 focus:ring-lime/40';

export function Input(props) {
  return <input className={controlClass} {...props} />;
}

export function Select({ children, ...props }) {
  return (
    <select className={controlClass} {...props}>
      {children}
    </select>
  );
}

export function Textarea(props) {
  return <textarea className={`${controlClass} min-h-28 resize-y`} {...props} />;
}

export function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-forest/15 border-t-moss" />
    </div>
  );
}

export function EmptyState({ title, description }) {
  return (
    <div className="rounded-3xl border border-dashed border-forest/15 bg-white/40 px-6 py-14 text-center">
      <p className="font-display text-xl text-ink">{title}</p>
      {description ? <p className="mt-2 text-sm text-ink/60">{description}</p> : null}
    </div>
  );
}

export function ErrorBox({ error }) {
  if (!error) return null;
  return (
    <div className="rounded-2xl border border-rose/20 bg-rose/8 px-4 py-3 text-sm text-rose">
      {error.message || 'Đã xảy ra lỗi'}
    </div>
  );
}

export function Table({ columns, rows, rowKey, compact }) {
  return (
    <div className="overflow-x-auto">
      <table className={classNames('w-full text-left text-sm', compact ? '' : 'min-w-[640px]')}>
        <thead>
          <tr className="border-b border-forest/10 text-xs tracking-wide text-ink/50 uppercase">
            {columns.map((col) => (
              <th key={col.key} className={classNames('px-3 py-3 font-medium', col.className)}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)} className="border-b border-forest/6 last:border-0 hover:bg-mist/50">
              {columns.map((col) => (
                <td key={col.key} className={classNames('px-3 py-3 align-middle', col.className)}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Modal({ open, title, onClose, children, wide }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-3 sm:items-center">
      <button className="absolute inset-0" aria-label="Đóng" onClick={onClose} />
      <div
        className={classNames(
          'relative max-h-[90vh] w-full overflow-y-auto rounded-3xl bg-paper p-5 shadow-2xl',
          wide ? 'max-w-4xl' : 'max-w-lg'
        )}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="font-display text-2xl text-ink">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-ink/50 hover:bg-white hover:text-ink"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function StatCard({ label, value, hint }) {
  return (
    <Card className="min-w-0">
      <p className="text-xs font-medium tracking-[0.16em] text-moss uppercase">{label}</p>
      <p className="font-display mt-3 text-3xl tracking-tight text-ink">{value}</p>
      {hint ? <p className="mt-2 text-xs text-ink/55">{hint}</p> : null}
    </Card>
  );
}

export function FilterSelect({ value, onChange, options, allLabel = 'Tất cả' }) {
  return (
    <Select value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">{allLabel}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </Select>
  );
}
