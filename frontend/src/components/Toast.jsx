// Exact replica of .toast-wrap / .toast from the HTML auth page
import { CheckCircle2, XCircle } from 'lucide-react'

export default function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="toast-wrap" aria-live="polite" aria-atomic="true">
      {toasts.map(t => <ToastItem key={t.id} toast={t} onRemove={removeToast} />)}
    </div>
  )
}

function ToastItem({ toast, onRemove }) {
  const ok = toast.type === 'success'
  return (
    <div className={`toast ${toast.type}`} onClick={() => onRemove(toast.id)} style={{ cursor: 'pointer' }}>
      <div className="tic">
        {ok ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
      </div>
      <div className="body">
        <p className="t">{toast.title}</p>
        {toast.message && <p className="m">{toast.message}</p>}
      </div>
    </div>
  )
}
