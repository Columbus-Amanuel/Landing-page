import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

function isErrorText(message) {
  if (!message) return false;
  const lower = message.toLowerCase();
  return (
    lower.includes('failed') ||
    lower.includes('unable') ||
    message.includes('አልተሳካም')
  );
}

/** Replaces emoji prefixes in admin save messages with Heroicons. */
export default function AdminFlashMessage({ message }) {
  if (!message) return null;
  const err = isErrorText(message);
  const text = message.replace(/^[✅❌]\s*/, '').trim();
  return (
    <p
      className={`admin-save-message${err ? ' admin-save-message--error' : ''}`}
      role="status"
    >
      {err ? (
        <XCircleIcon className="admin-flash-icon" aria-hidden />
      ) : (
        <CheckCircleIcon className="admin-flash-icon" aria-hidden />
      )}
      <span>{text}</span>
    </p>
  );
}
