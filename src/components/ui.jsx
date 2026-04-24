import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from './Icons'

/* ============= TOASTS ============= */
const ToastCtx = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const idRef = useRef(0)

  const dismiss = useCallback(id => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const push = useCallback((opts) => {
    const id = ++idRef.current
    const toast = {
      id,
      title: opts.title || '',
      message: opts.message || '',
      tone: opts.tone || 'info',
      duration: opts.duration ?? 3400,
      action: opts.action || null,
    }
    setToasts(prev => [...prev, toast])
    if (toast.duration > 0) {
      setTimeout(() => dismiss(id), toast.duration)
    }
    return id
  }, [dismiss])

  const api = {
    push,
    dismiss,
    success: (title, message, opts) => push({ tone: 'success', title, message, ...opts }),
    error:   (title, message, opts) => push({ tone: 'error', title, message, ...opts }),
    info:    (title, message, opts) => push({ tone: 'info', title, message, ...opts }),
    warn:    (title, message, opts) => push({ tone: 'warn', title, message, ...opts }),
  }

  return (
    <ToastCtx.Provider value={api}>
      {children}
      <div className="toast-stack" aria-live="polite">
        {toasts.map(t => <ToastItem key={t.id} toast={t} onClose={() => dismiss(t.id)} />)}
      </div>
    </ToastCtx.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastCtx)
  if (!ctx) throw new Error('useToast must be inside <ToastProvider>')
  return ctx
}

const TONE_ICON = { success: 'check', error: 'alert', warn: 'alert', info: 'bell' }

function ToastItem({ toast, onClose }) {
  return (
    <div className={`toast tone-${toast.tone}`}>
      <div className="toast-icon"><Icon name={TONE_ICON[toast.tone]} size={14} /></div>
      <div className="toast-body">
        {toast.title && <div className="toast-title">{toast.title}</div>}
        {toast.message && <div className="toast-msg">{toast.message}</div>}
      </div>
      {toast.action && (
        <button className="toast-action" onClick={() => { toast.action.onClick(); onClose() }}>
          {toast.action.label}
        </button>
      )}
      <button className="toast-close" onClick={onClose} aria-label="Cerrar"><Icon name="x" size={12} /></button>
    </div>
  )
}

/* ============= MODAL ============= */
export function Modal({ open, onClose, title, eyebrow, children, footer, size = 'md' }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') onClose?.() }
    window.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.()
      }}
    >
      <div className={`modal modal-${size}`}>
        <div className="modal-header">
          <div>
            {eyebrow && <div className="card-eyebrow">{eyebrow}</div>}
            <h3 className="modal-title">{title}</h3>
          </div>
          <button type="button" className="btn-icon" onClick={() => onClose?.()} aria-label="Cerrar">
            <Icon name="x" size={14} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>,
    document.body
  )
}

/* ============= CONFIRM ============= */
export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirmar', tone = 'primary' }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button
            className={`btn ${tone === 'danger' ? 'btn-danger' : 'btn-primary'}`}
            onClick={() => { onConfirm?.(); onClose?.() }}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <p style={{ margin: 0, fontSize: 13.5, color: 'var(--ink-700)', lineHeight: 1.55 }}>{message}</p>
    </Modal>
  )
}

/* ============= DROPDOWN MENU ============= */
export function DropdownMenu({ trigger, items, align = 'right' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const onDoc = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  return (
    <div className="dropdown-wrap" ref={ref}>
      <div onClick={() => setOpen(o => !o)}>{trigger}</div>
      {open && (
        <div className={`dropdown-menu align-${align}`}>
          {items.map((item, i) => {
            if (item.divider) return <div key={i} className="dropdown-divider" />
            return (
              <button
                key={i}
                className={`dropdown-item ${item.danger ? 'danger' : ''}`}
                onClick={() => { item.onClick?.(); setOpen(false) }}
              >
                {item.icon && <Icon name={item.icon} size={13} />}
                <span>{item.label}</span>
                {item.hint && <span className="dropdown-hint mono">{item.hint}</span>}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ============= DRAWER / POPOVER ============= */
export function Popover({ open, onClose, anchor, children, width = 340 }) {
  const ref = useRef(null)
  useEffect(() => {
    if (!open) return
    const onDoc = e => { if (ref.current && !ref.current.contains(e.target) && !anchor?.current?.contains(e.target)) onClose?.() }
    const onKey = e => { if (e.key === 'Escape') onClose?.() }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onClose, anchor])
  if (!open) return null
  return (
    <div className="popover" ref={ref} style={{ width }}>
      {children}
    </div>
  )
}
