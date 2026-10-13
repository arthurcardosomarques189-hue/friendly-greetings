import { Link, useNavigate } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { Clapperboard, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAccount } from './account-context';
import type { ReactNode } from 'react';
export function MemberShell({ children }: { children: ReactNode }) {
  const { account } = useAccount(); const queryClient = useQueryClient(); const navigate = useNavigate();
  async function signOut() { await queryClient.cancelQueries(); queryClient.clear(); await supabase.auth.signOut(); await navigate({ to: '/auth', replace: true }); }
  return <main className="cine-app"><header className="member-header"><Link to="/" className="brand"><Clapperboard className="brand-accent" /> CINEVERSE</Link><nav><Link to="/">Catálogo</Link><Link to="/conta">Minha conta</Link>{account?.isAdmin && <Link to="/admin">Administrar</Link>}<Button variant="ghost" onClick={signOut}><LogOut /> Sair</Button></nav></header><div className="member-content">{children}</div></main>;
}