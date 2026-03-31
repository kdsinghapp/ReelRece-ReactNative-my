import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { getPendingInvitations } from '@redux/Api/GroupApi';

export const usePendingInvitesCount = (token: string | null) => {
  const [hasPendingInvites, setHasPendingInvites] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  const refreshCount = useCallback(async () => {
    if (!token) return;
    try {
      const res = await getPendingInvitations(token);
      const invitations = res?.results || res || [];
      const count = invitations.length;
      setPendingCount(count);
      setHasPendingInvites(count > 0);
    } catch (e) {
      // ignore error
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      refreshCount();
    }, [refreshCount])
  );

  return { hasPendingInvites, pendingCount, refreshCount };
};
