import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import {
  getContactMessages,
  getPrayerRequests,
  updateContactMessageStatus,
  updatePrayerRequestStatus,
} from '../../services/contactService';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function AdminMessages() {
  const [tab, setTab] = useState('contact');
  const [messages, setMessages] = useState([]);
  const [prayers, setPrayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getContactMessages(), getPrayerRequests()]).then(([msgs, prays]) => {
      setMessages(msgs);
      setPrayers(prays);
      setLoading(false);
    });
  }, []);

  const markMessageRead = async (id) => {
    await updateContactMessageStatus(id, 'read');
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, status: 'read' } : m)));
  };

  const markPrayerResolved = async (id) => {
    await updatePrayerRequestStatus(id, 'resolved');
    setPrayers((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'resolved' } : p)));
  };

  const unreadCount = messages.filter((m) => m.status === 'unread').length;
  const activeCount = prayers.filter((p) => p.status === 'active').length;

  return (
    <div>
      <h1 className="admin-page-title">Messages</h1>

      <div className="tab-group">
        <button
          className={`tab ${tab === 'contact' ? 'active' : ''}`}
          onClick={() => setTab('contact')}
        >
          Contact Messages {unreadCount > 0 && <span className="badge-count">{unreadCount}</span>}
        </button>
        <button
          className={`tab ${tab === 'prayer' ? 'active' : ''}`}
          onClick={() => setTab('prayer')}
        >
          Prayer Requests {activeCount > 0 && <span className="badge-count">{activeCount}</span>}
        </button>
      </div>

      {loading ? (
        <LoadingSpinner center />
      ) : tab === 'contact' ? (
        messages.length === 0 ? (
          <p className="empty-state">No contact messages yet.</p>
        ) : (
          <div className="admin-list">
            {messages.map((msg) => {
              const date = msg.createdAt?.toDate ? msg.createdAt.toDate() : new Date();
              return (
                <div
                  key={msg.id}
                  className={`admin-list-item${msg.status === 'unread' ? ' admin-list-item-unread' : ''}`}
                >
                  <div className="admin-list-item-info">
                    <h3>
                      {msg.firstName} {msg.lastName}
                      <span className="text-muted"> &lt;{msg.email}&gt;</span>
                    </h3>
                    <p className="text-sm text-muted">
                      {msg.subject} &bull; {format(date, 'MMM d, yyyy h:mm a')}
                    </p>
                    {msg.phone && <p className="text-sm">Phone: {msg.phone}</p>}
                    <p className="admin-message-body">{msg.message}</p>
                  </div>
                  <div className="admin-list-item-actions">
                    <span className={`status-badge status-${msg.status}`}>{msg.status}</span>
                    {msg.status === 'unread' && (
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => markMessageRead(msg.id)}
                      >
                        Mark Read
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        prayers.length === 0 ? (
          <p className="empty-state">No prayer requests yet.</p>
        ) : (
          <div className="admin-list">
            {prayers.map((prayer) => {
              const date = prayer.createdAt?.toDate ? prayer.createdAt.toDate() : new Date();
              return (
                <div
                  key={prayer.id}
                  className={`admin-list-item${prayer.status === 'active' ? ' admin-list-item-unread' : ''}`}
                >
                  <div className="admin-list-item-info">
                    <h3>
                      {prayer.name || 'Anonymous'}
                      {prayer.isPrivate && <span className="badge badge-private">Private</span>}
                    </h3>
                    <p className="text-sm text-muted">{format(date, 'MMM d, yyyy h:mm a')}</p>
                    {prayer.email && <p className="text-sm">{prayer.email}</p>}
                    <p className="admin-message-body">{prayer.request}</p>
                  </div>
                  <div className="admin-list-item-actions">
                    <span className={`status-badge status-${prayer.status}`}>{prayer.status}</span>
                    {prayer.status === 'active' && (
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => markPrayerResolved(prayer.id)}
                      >
                        Mark Resolved
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}
