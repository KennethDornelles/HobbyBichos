import { useEffect, useState } from 'react';

export function useNotificationPreferences(userId: string, storeId: string) {
  const [prefs, setPrefs] = useState<any>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId || !storeId) return;
    setLoading(true);
    fetch(`https://SEU_BACKEND_URL/notifications/preferences?userId=${userId}&storeId=${storeId}`)
      .then(res => res.json())
      .then(data => {
        // Transforma array em objeto por categoria
        const obj: any = {};
        data.forEach((p: any) => {
          obj[p.category] = {
            push: p.push,
            email: p.email,
            sms: p.sms,
            whatsapp: p.whatsapp,
          };
        });
        setPrefs(obj);
      })
      .finally(() => setLoading(false));
  }, [userId, storeId]);

  const updatePref = async (category: string, channel: string, value: boolean) => {
    setPrefs((prev: any) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [channel]: value,
      },
    }));
    await fetch('https://SEU_BACKEND_URL/notifications/preferences', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        storeId,
        category,
        ...prefs[category],
        [channel]: value,
      }),
    });
  };

  return { prefs, loading, updatePref };
}
