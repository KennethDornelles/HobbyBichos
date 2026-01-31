import { useEffect, useState } from 'react';
import { api } from '../services/api';

export function useUserNotifications(userId: string, storeId?: string) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    api.get(`/notifications/user`, { params: { userId, storeId } })
      .then(res => res.data)
      .then(data => setNotifications(data))
      .finally(() => setLoading(false));
  }, [userId, storeId]);

  return { notifications, loading };
}
