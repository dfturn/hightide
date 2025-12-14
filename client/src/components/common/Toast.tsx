import "./Toast.css";

interface ToastProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  onClose?: () => void;
}

function Toast({ message, actionLabel, onAction, onClose }: ToastProps) {
  return (
    <div className="toast-container">
      <div className="toast">
        <p className="toast-message">{message}</p>
        <div className="toast-actions">
          {actionLabel && onAction && (
            <button className="toast-action-button" onClick={onAction}>
              {actionLabel}
            </button>
          )}
          {onClose && (
            <button
              className="toast-close-button"
              onClick={onClose}
              aria-label="Close"
            >
              ×
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Toast;
