import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAccessLog = (page: string) => {
  useEffect(() => {
    const logAccess = async () => {
      try {
        await supabase.from('access_logs').insert({
          page,
          user_agent: navigator.userAgent,
          referrer: document.referrer || null,
        });
      } catch (error) {
        // Silently fail - don't interrupt user experience
        console.error('Failed to log access:', error);
      }
    };

    logAccess();
  }, [page]);
};
