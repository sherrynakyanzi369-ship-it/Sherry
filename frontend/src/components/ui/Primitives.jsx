import { useEffect } from 'react';
import { Icon } from './Icon';

export function QuantityStepper({ value, onChange, min = 1, max = 99, small = false }) {
  return (
    <div className={`qty-stepper${small ? ' small' : ''}`}>
      <button type="button" aria-label="Decrease quantity" disabled={value <= min} onClick={() => onChange(-1)}>
        <Icon name="minus" size={14} />
      </button>
      <span aria-live="polite">{value}</span>
      <button
        type="button"
        aria-label="Increase quantity"
        disabled={value >= max}
        onClick={() => onChange(1)}
      >
        <Icon name="plus" size={14} />
      </button>
    </div>
  );
}

export function Skeleton({ className = '' }) {
  return <div className={`skeleton ${className}`} aria-hidden="true" />;
}

export function ProductCardSkeleton() {
  return (
    <div className="product-card skeleton-card">
      <Skeleton className="sk-img" />
      <Skeleton className="sk-line w-70" />
      <Skeleton className="sk-line w-40" />
      <Skeleton className="sk-line w-50" />
    </div>
  );
}

export function EmptyState({ icon = 'droplet', title, text, action }) {
  return (
    <div className="empty-state">
      <span className="empty-icon">
        <Icon name={icon} size={30} />
      </span>
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {action}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="empty-state error">
      <span className="empty-icon">
        <Icon name="alert" size={30} />
      </span>
      <h3>Something went wrong</h3>
      <p>{message}</p>
      {onRetry && (
        <button type="button" className="btn btn-outline" onClick={onRetry}>
          <Icon name="refresh" size={16} /> Try again
        </button>
      )}
    </div>
  );
}

export function SectionHeader({ eyebrow, title, text, link }) {
  return (
    <div className="section-header reveal">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2>{title}</h2>
        {text && <p className="section-text">{text}</p>}
      </div>
      {link}
    </div>
  );
}

export function Reveal({ children, className = '', as: Tag = 'div', ...rest }) {
  return (
    <Tag className={`reveal ${className}`} {...rest}>
      {children}
    </Tag>
  );
}

export function DrawerShell({ open, onClose, title, id, children, footer }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <>
      <div className="overlay-backdrop" onClick={onClose} />
      <aside className="drawer" role="dialog" aria-modal="true" aria-label={title} style={{ display: 'flex', flexDirection: 'column' }}>
        <header className="drawer-head">
          <h2 id={id}>{title}</h2>
          <button type="button" className="icon-btn" aria-label={`Close ${title}`} onClick={onClose}>
            <Icon name="close" size={18} />
          </button>
        </header>
        <div className="drawer-body">{children}</div>
        {footer && <footer className="drawer-foot">{footer}</footer>}
      </aside>
    </>
  );
}

export function Breadcrumbs({ items }) {
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <ol>
        {items.map((item, i) => (
          <li key={`${item.label}-${i}`}>
            {item.href ? (
              <a href={item.href}>{item.label}</a>
            ) : (
              <span aria-current="page">{item.label}</span>
            )}
            {i < items.length - 1 && <Icon name="chevron" size={12} />}
          </li>
        ))}
      </ol>
    </nav>
  );
}
