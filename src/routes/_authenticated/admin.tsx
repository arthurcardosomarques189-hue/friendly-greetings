import { createFileRoute, Link } from '@tanstack/react-router';
import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { ArrowLeft, CheckCircle2, Film, LoaderCircle, LockKeyhole, RefreshCw, Search, Settings2, Users, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { MemberShell } from '@/components/member-shell';
import { getManagement, manageAccess } from '@/lib/access.functions';
import { hasActiveAccess, MONTHLY_PRICE_LABEL } from '@/lib/access';

export const Route = createFileRoute('/_authenticated/admin')({
  component: AdminPage,
  head: () => ({ meta: [{ title: 'Administração | CineVerse' }, { name: 'description', content: 'Gerencie clientes, pagamentos e conteúdo autorizado do CineVerse.' }] }),
});

type Management = Awaited<ReturnType<typeof getManagement>>;
type Tab = 'clientes' | 'pagamentos' | 'pix' | 'conteudo';

function AdminPage() {
  const [data, setData] = useState<Management | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<Tab>('clientes');
  const [search, setSearch] = useState('');
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [pixKey, setPixKey] = useState('');
  const [recipient, setRecipient] = useState('');
  const [contact, setContact] = useState('');
  const [movieId, setMovieId] = useState('');
  const [movieTitle, setMovieTitle] = useState('');
  const [movieUrl, setMovieUrl] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [reference, setReference] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await getManagement();
      setData(result);
      setPixKey(result.settings?.pix_key ?? '');
      setRecipient(result.settings?.recipient ?? '');
      setContact(result.settings?.contact ?? '');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível carregar a administração.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  async function runAction(action: Parameters<typeof manageAccess>[0] extends never ? never : any, success: string) {
    setBusy(true);
    setError('');
    try {
      await manageAccess({ data: action });
      toast.success(success);
      setReference('');
      setNewPassword('');
      await refresh();
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'A operação não foi concluída.';
      setError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }

  const subscriptions = data?.subscriptions ?? [];
  const profiles = data?.profiles ?? [];
  const filteredProfiles = useMemo(() => profiles.filter(profile => {
    const term = search.trim().toLowerCase();
    return !term || profile.username.toLowerCase().includes(term) || profile.display_name.toLowerCase().includes(term) || profile.id.toLowerCase().includes(term);
  }), [profiles, search]);

  const activeCount = profiles.filter(profile => hasActiveAccess(subscriptions.find(item => item.user_id === profile.id))).length;
  const blockedCount = subscriptions.filter(item => item.blocked).length;

  function submit(event: FormEvent<HTMLFormElement>, action: any, success: string) {
    event.preventDefault();
    void runAction(action, success);
  }

  return <MemberShell>
    <div className="admin-page">
      <div className="admin-heading">
        <div><Link to="/conta" className="text-link"><ArrowLeft size={16} /> Voltar à conta</Link><span className="section-kicker">PAINEL PRIVADO</span><h1>Administração</h1><p className="quiet-note">Gerencie clientes, acessos, pagamentos e conteúdos do CineVerse.</p></div>
        <Button variant="outline" onClick={() => void refresh()} disabled={loading || busy}><RefreshCw size={16} /> Atualizar</Button>
      </div>

      {error && <div role="alert" className="admin-alert">{error}</div>}
      {loading ? <div className="admin-loading"><LoaderCircle className="animate-spin" /> Carregando dados administrativos…</div> : !data ? <section className="account-summary"><div><h2>Acesso não autorizado ou indisponível</h2><p>Esta área é exclusiva do administrador. Confira sua conta e tente novamente.</p><Link to="/conta" className="text-link">Voltar para minha conta</Link></div></section> : <>
        <div className="admin-stats">
          <article><Users /><span>Clientes cadastrados</span><strong>{profiles.length}</strong></article>
          <article><CheckCircle2 /><span>Acessos ativos</span><strong>{activeCount}</strong></article>
          <article><LockKeyhole /><span>Acessos bloqueados</span><strong>{blockedCount}</strong></article>
          <article><Wallet /><span>Mensalidade</span><strong>{MONTHLY_PRICE_LABEL}</strong></article>
        </div>

        <div className="admin-tabs" role="tablist" aria-label="Seções administrativas">
          {([{ id: 'clientes', label: 'Clientes', icon: Users }, { id: 'pagamentos', label: 'Pagamentos', icon: Wallet }, { id: 'pix', label: 'Dados do Pix', icon: Settings2 }, { id: 'conteudo', label: 'Conteúdo', icon: Film }] as const).map(item => <button key={item.id} type="button" role="tab" aria-selected={tab === item.id} className={tab === item.id ? 'admin-tab active' : 'admin-tab'} onClick={() => setTab(item.id)}><item.icon size={16} />{item.label}</button>)}
        </div>

        {tab === 'clientes' && <section className="admin-panel">
          <div className="admin-panel-heading"><div><h2>Clientes</h2><p className="quiet-note">Crie contas e administre o acesso dos usuários.</p></div><label className="admin-search"><Search size={16} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Buscar nome ou usuário" /></label></div>
          <form className="admin-form admin-create-form" onSubmit={event => submit(event, { action: 'create', username, name, password }, 'Cliente criado com sucesso.')}>
            <h3>Novo cliente</h3>
            <label>Usuário<input required minLength={3} maxLength={30} pattern="[a-zA-Z0-9_]+" value={username} onChange={event => setUsername(event.target.value)} placeholder="ex.: cliente_01" /></label>
            <label>Nome de exibição<input required maxLength={100} value={name} onChange={event => setName(event.target.value)} placeholder="Nome do cliente" /></label>
            <label>Senha inicial<input required minLength={12} maxLength={100} type="password" value={password} onChange={event => setPassword(event.target.value)} placeholder="Mínimo de 12 caracteres" /></label>
            <Button type="submit" disabled={busy}>Criar cliente</Button>
          </form>
          <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Cliente</th><th>Usuário</th><th>Acesso</th><th>Vencimento</th><th>Ações</th></tr></thead><tbody>
            {filteredProfiles.map(profile => {
              const subscription = subscriptions.find(item => item.user_id === profile.id);
              const active = hasActiveAccess(subscription);
              const blocked = Boolean(subscription?.blocked);
              return <tr key={profile.id}><td><strong>{profile.display_name || 'Sem nome'}</strong><small>{profile.id.slice(0, 8)}…</small></td><td>{profile.username}</td><td><span className={blocked ? 'admin-status blocked' : active ? 'admin-status active' : 'admin-status pending'}>{blocked ? 'Bloqueado' : active ? 'Ativo' : 'Pendente'}</span></td><td>{subscription?.expires_at ? new Date(subscription.expires_at).toLocaleDateString('pt-BR') : '—'}</td><td><div className="admin-actions"><Button size="sm" variant="outline" disabled={busy || profile.id === data.ownerId} onClick={() => void runAction({ action: 'block', userId: profile.id, blocked: !blocked }, blocked ? 'Acesso desbloqueado.' : 'Acesso bloqueado.')}>{blocked ? 'Desbloquear' : 'Bloquear'}</Button><Button size="sm" variant="ghost" disabled={busy || profile.id === data.ownerId} onClick={() => setSelectedUser(selectedUser === profile.id ? '' : profile.id)}>Senha</Button></div>{selectedUser === profile.id && <form className="admin-inline-form" onSubmit={event => submit(event, { action: 'password', userId: profile.id, password: newPassword }, 'Senha redefinida.') }><input type="password" required minLength={12} maxLength={100} value={newPassword} onChange={event => setNewPassword(event.target.value)} placeholder="Nova senha (12+ caracteres)" /><Button size="sm" type="submit" disabled={busy}>Salvar</Button></form>}</td></tr>;
            })}
            {!filteredProfiles.length && <tr><td colSpan={5}>Nenhum cliente encontrado.</td></tr>}
          </tbody></table></div>
        </section>}

        {tab === 'pagamentos' && <section className="admin-panel"><h2>Pagamentos</h2><p className="quiet-note">Confirme somente pagamentos recebidos e verificados. A confirmação ativa a assinatura mensal.</p>
          <form className="admin-form admin-payment-form" onSubmit={event => submit(event, { action: 'payment', userId: selectedUser, reference }, 'Pagamento confirmado e assinatura atualizada.')}>
            <label>Cliente<select required value={selectedUser} onChange={event => setSelectedUser(event.target.value)}><option value="">Selecione um cliente</option>{profiles.map(profile => <option key={profile.id} value={profile.id}>{profile.display_name} (@{profile.username})</option>)}</select></label>
            <label>Referência do pagamento<input required maxLength={150} value={reference} onChange={event => setReference(event.target.value)} placeholder="ID/identificação do Pix" /></label>
            <Button type="submit" disabled={busy || !selectedUser}>Confirmar pagamento</Button>
          </form>
          <h3>Histórico recente</h3><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Data</th><th>Cliente</th><th>Valor</th><th>Referência</th><th>Vencimento</th></tr></thead><tbody>{data.payments.map(payment => <tr key={payment.id}><td>{new Date(payment.confirmed_at).toLocaleDateString('pt-BR')}</td><td>{profiles.find(profile => profile.id === payment.user_id)?.username ?? payment.user_id.slice(0, 8)}</td><td>{(payment.amount_cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td><td>{payment.reference || '—'}</td><td>{new Date(payment.expires_at).toLocaleDateString('pt-BR')}</td></tr>)}{!data.payments.length && <tr><td colSpan={5}>Nenhum pagamento registrado.</td></tr>}</tbody></table></div>
        </section>}

        {tab === 'pix' && <section className="admin-panel"><h2>Dados para pagamento via Pix</h2><p className="quiet-note">Esses dados serão exibidos aos clientes na área de assinatura.</p><form className="admin-form admin-settings-form" onSubmit={event => submit(event, { action: 'settings', pix_key: pixKey, recipient, contact }, 'Dados do Pix salvos.')}>
          <label>Chave Pix<input maxLength={200} value={pixKey} onChange={event => setPixKey(event.target.value)} placeholder="Chave Pix para receber pagamentos" /></label><label>Nome do recebedor<input maxLength={100} value={recipient} onChange={event => setRecipient(event.target.value)} placeholder="Nome exibido no pagamento" /></label><label>Contato para suporte<input maxLength={100} value={contact} onChange={event => setContact(event.target.value)} placeholder="WhatsApp ou e-mail de suporte" /></label><Button type="submit" disabled={busy}>Salvar dados do Pix</Button>
        </form></section>}

        {tab === 'conteudo' && <section className="admin-panel"><h2>Vídeos autorizados</h2><p className="quiet-note">Cadastre apenas links de vídeos que você possui ou tem autorização para distribuir. O conteúdo autorizado pode ser liberado para reprodução no catálogo.</p><form className="admin-form admin-source-form" onSubmit={event => submit(event, { action: 'source', movieId: Number(movieId), title: movieTitle, url: movieUrl, rights: true }, 'Vídeo autorizado salvo.')}>
          <label>ID do filme no catálogo<input required type="number" min={1} step={1} value={movieId} onChange={event => setMovieId(event.target.value)} placeholder="ID do filme" /></label><label>Título<input required maxLength={200} value={movieTitle} onChange={event => setMovieTitle(event.target.value)} placeholder="Título do vídeo" /></label><label>Link HTTPS do vídeo<input required type="url" pattern="https://.*" value={movieUrl} onChange={event => setMovieUrl(event.target.value)} placeholder="https://…" /></label><label className="admin-check"><input required type="checkbox" /> Confirmo que tenho direitos ou autorização para disponibilizar este vídeo.</label><Button type="submit" disabled={busy}>Salvar vídeo</Button>
        </form><h3>Conteúdo cadastrado</h3><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>ID</th><th>Título</th><th>Link</th><th>Direitos</th></tr></thead><tbody>{data.sources.map(source => <tr key={source.movie_id}><td>{source.movie_id}</td><td>{source.title}</td><td><a href={source.playback_url} target="_blank" rel="noreferrer">Abrir link</a></td><td>{source.rights_confirmed ? 'Confirmados' : 'Não confirmado'}</td></tr>)}{!data.sources.length && <tr><td colSpan={4}>Nenhum vídeo cadastrado.</td></tr>}</tbody></table></div></section>}
      </>}
    </div>
  </MemberShell>;
}
