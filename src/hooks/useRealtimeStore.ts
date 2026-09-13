import { useStore, syncWithSupabase } from '../data/store';
import { isSupabaseConfigured } from '../lib/supabase';

export function useRealtimeStore() {
  const store = useStore();

  const refresh = async () => {
    if (isSupabaseConfigured) {
      await syncWithSupabase();
    }
  };

  return {
    ...store,
    isRealtime: isSupabaseConfigured,
    refresh,
  };
}
