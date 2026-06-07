import { Check, X } from 'lucide-react';
import { useEffect } from 'react';

type SuccessToastProps = {
  message: string | null;
  onClose: () => void;
  autoCloseDuration?: number;
};

export function SuccessToast({ message, onClose, autoCloseDuration = 4000 }: SuccessToastProps) {
  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      onClose();
    }, autoCloseDuration);

    return () => clearTimeout(timer);
  }, [message, onClose, autoCloseDuration]);

  if (!message) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
        animation: 'slideInRight 0.3s ease-out'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '14px 18px',
          borderRadius: '14px',
          backgroundColor: 'rgba(57, 217, 138, 0.1)',
          border: '1px solid rgba(57, 217, 138, 0.3)',
          boxShadow: '0 8px 24px rgba(57, 217, 138, 0.2)',
          backdropFilter: 'blur(8px)',
          minWidth: '320px',
          maxWidth: '400px'
        }}
      >
        <Check size={20} style={{ color: '#39d98a', flexShrink: 0 }} />
        <p
          style={{
            margin: 0,
            color: '#39d98a',
            fontSize: '14px',
            fontWeight: '500',
            flex: 1
          }}
        >
          {message}
        </p>
        <button
          type="button"
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#39d98a',
            cursor: 'pointer',
            padding: '0',
            display: 'flex',
            alignItems: 'center',
            flexShrink: 0,
            transition: 'opacity 0.2s'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.7')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          <X size={18} />
        </button>
      </div>

      <style>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(400px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
