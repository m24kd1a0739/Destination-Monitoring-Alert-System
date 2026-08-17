import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from 'lucide-react';
import { ToastMessage } from '../../context/JourneyContext';

interface ToastProps {
  toast: ToastMessage | null;
  onDismiss: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  if (!toast) return null;

  const icons = {
    info: <Info className="w-5 h-5 text-blue-400" />,
    success: <CheckCircle className="w-5 h-5 text-emerald-400" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400" />,
    urgent: <AlertCircle className="w-5 h-5 text-red-400 animate-pulse" />
  };

  const bgColors = {
    info: 'bg-dark-card border-blue-500/30 text-slate-100',
    success: 'bg-dark-card border-emerald-500/30 text-slate-100',
    warning: 'bg-dark-card border-amber-500/30 text-slate-100',
    urgent: 'bg-red-950/90 border-red-500/60 text-white shadow-xl shadow-red-500/20'
  };

  const type = toast.type || 'info';

  return (
    <div className="fixed top-16 right-4 z-50 max-w-sm w-full animate-bounce-short">
      <div className={`flex items-start p-4 rounded-2xl border backdrop-blur-xl shadow-2xl ${bgColors[type]}`}>
        <div className="flex-shrink-0 mr-3 mt-0.5">
          {icons[type]}
        </div>
        <div className="flex-1 min-w-0 mr-2">
          <h4 className="text-sm font-semibold tracking-tight">{toast.title}</h4>
          <p className="text-xs text-slate-300 mt-0.5 leading-relaxed break-words">{toast.message}</p>
        </div>
        <button
          onClick={onDismiss}
          className="flex-shrink-0 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          aria-label="Dismiss toast"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
