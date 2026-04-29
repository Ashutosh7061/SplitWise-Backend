import { useEffect, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';

type ErrorDialogProps = {
  message: string | null;
  onClose: () => void;
  title?: string;
};

export function ErrorDialog({ message, onClose, title = 'Something went wrong' }: ErrorDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    if (message && !dialog.open) {
      dialog.showModal();
      return;
    }

    if (!message && dialog.open) {
      dialog.close();
    }
  }, [message]);

  if (!message) {
    return null;
  }

  return (
    <dialog
      ref={dialogRef}
      className="dialog-shell"
      aria-labelledby="error-dialog-title"
      aria-describedby="error-dialog-message"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <div className="dialog-card dialog-error" role="document">
        <div className="dialog-header">
          <span className="dialog-icon" aria-hidden="true">
            <AlertTriangle size={20} />
          </span>
          <div>
            <p className="eyebrow dialog-eyebrow">Error</p>
            <h3 id="error-dialog-title">{title}</h3>
          </div>
        </div>
        <p id="error-dialog-message" className="dialog-message">{message}</p>
        <div className="dialog-actions">
          <button type="button" className="button primary dialog-button" onClick={onClose}>
            Got it
          </button>
        </div>
      </div>
    </dialog>
  );
}