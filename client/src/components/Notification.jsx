import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Notification() {
  const { notification } = useApp();
  if (!notification) return null;

  const icons = { success: CheckCircle, error: AlertCircle, info: Info };
  const colors = { success: 'var(--green)', error: 'var(--red)', info: 'var(--accent)' };
  const type = notification.type || 'success';
  const Icon = icons[type] || CheckCircle;
  const color = colors[type] || 'var(--green)';

  return (
    <div className="notification" style={{ borderColor: color }}>
      <Icon size={18} color={color} style={{ flexShrink: 0 }} />
      <span style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.4 }}>{notification.message}</span>
    </div>
  );
}
