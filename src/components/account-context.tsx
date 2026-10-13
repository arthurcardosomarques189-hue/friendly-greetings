import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { supabase } from '@/integrations/supabase/client';
import { getAccount } from '@/lib/access.functions';
import type { User } from '@supabase/supabase-js';
type Account = Awaited<ReturnType<typeof getAccount>>;
const AccountContext = createContext<{ user: User | null; account: Account | undefined; loading: boolean }>({ user: null, account: undefined, loading: true });
export function AccountProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const fetchAccount = useServerFn(getAccount);
  useEffect(() => { let alive = true; supabase.auth.getUser().then(({ data }) => { if (alive) { setUser(data.user); setLoading(false); } }); return () => { alive = false; }; }, []);
  // Identity updates are dispatched by the single root auth subscriber.
  useEffect(() => { const update = () => { supabase.auth.getUser().then(({ data }) => setUser(data.user)); }; window.addEventListener('cineverse-auth', update); return () => window.removeEventListener('cineverse-auth', update); }, []);
  const result = useQuery({ queryKey: ['account', user?.id], queryFn: () => fetchAccount(), enabled: Boolean(user), retry: false });
  return <AccountContext.Provider value={{ user, account: result.data, loading: loading || Boolean(user && result.isLoading) }}>{children}</AccountContext.Provider>;
}
export const useAccount = () => useContext(AccountContext);