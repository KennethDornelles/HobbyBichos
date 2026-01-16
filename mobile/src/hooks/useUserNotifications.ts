import { useEffect, useState } from 'react';

export function useUserNotifications(userId: string, storeId: string) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId || !storeId) return;
    setLoading(true);
    fetch(`https://SEU_BACKEND_URL/notifications/user?userId=${userId}&storeId=${storeId}`)
      .then(res => res.json())
      .then(data => setNotifications(data))
      .finally(() => setLoading(false));
  }, [userId, storeId]);

  return { notifications, loading };
}
