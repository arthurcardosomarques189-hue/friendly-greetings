import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { z } from 'zod';
import { hasActiveAccess, usernameEmail } from './access';

export const getAccount = createServerFn({ method: 'GET' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const [profile, role, subscription, payments] = await Promise.all([
    context.supabase.from('profiles').select('*').eq('id', context.userId).single(),
    context.supabase.rpc('has_role', { _user_id: context.userId, _role: 'admin' }),
    context.supabase.from('subscriptions').select('*').eq('user_id', context.userId).maybeSingle(),
    context.supabase.from('payments').select('*').eq('user_id', context.userId).order('confirmed_at', { ascending: false }).limit(12),
  ]);
  if (profile.error || role.error || subscription.error || payments.error) throw new Error('Não foi possível carregar sua conta.');
  return { profile: profile.data, isAdmin: Boolean(role.data), subscription: subscription.data, payments: payments.data ?? [] };
});

export const getManagement = createServerFn({ method: 'GET' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const role = await context.supabase.rpc('has_role', { _user_id: context.userId, _role: 'admin' });
  if (role.error || !role.data) throw new Error('Somente o proprietário pode administrar os acessos.');
  const [profiles, subscriptions, payments, settings, sources] = await Promise.all([
    context.supabase.from('profiles').select('*').order('created_at', { ascending: false }),
    context.supabase.from('subscriptions').select('*'),
    context.supabase.from('payments').select('*').order('confirmed_at', { ascending: false }).limit(50),
    context.supabase.from('payment_settings').select('*').maybeSingle(),
    context.supabase.from('movie_sources').select('*').order('created_at', { ascending: false }),
  ]);
  if (profiles.error || subscriptions.error || payments.error || settings.error || sources.error) throw new Error('Não foi possível carregar a administração.');
  return { profiles: profiles.data ?? [], subscriptions: subscriptions.data ?? [], payments: payments.data ?? [], settings: settings.data, sources: sources.data ?? [], ownerId: context.userId };
});

const actionSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('create'), username: z.string().trim().toLowerCase().regex(/^[a-z0-9_]{3,30}$/), name: z.string().trim().min(1).max(100), password: z.string().min(12).max(100) }),
  z.object({ action: z.literal('password'), userId: z.string().uuid(), password: z.string().min(12).max(100) }),
  z.object({ action: z.literal('block'), userId: z.string().uuid(), blocked: z.boolean() }),
  z.object({ action: z.literal('payment'), userId: z.string().uuid(), reference: z.string().trim().min(1).max(150) }),
  z.object({ action: z.literal('settings'), pix_key: z.string().trim().max(200), recipient: z.string().trim().max(100), contact: z.string().trim().max(100) }),
  z.object({ action: z.literal('source'), movieId: z.number().int().positive(), title: z.string().min(1).max(200), url: z.string().url().refine(value => value.startsWith('https://'), 'Use um link HTTPS'), rights: z.literal(true) }),
]);
export const manageAccess = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator(actionSchema).handler(async ({ context, data }) => {
  const role = await context.supabase.rpc('has_role', { _user_id: context.userId, _role: 'admin' });
  if (role.error || !role.data) throw new Error('Somente o proprietário pode alterar os acessos.');
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  if ('userId' in data && data.userId === context.userId) throw new Error('Sua conta de administrador não pode ser alterada aqui.');
  if (data.action === 'create') {
    const result = await supabaseAdmin.auth.admin.createUser({ email: usernameEmail(data.username), password: data.password, email_confirm: true, user_metadata: { username: data.username, display_name: data.name } });
    if (result.error || !result.data.user) throw new Error('Não foi possível criar o acesso. Verifique se o usuário já existe e escolha uma senha forte.');
    const subscription = await supabaseAdmin.from('subscriptions').upsert({ user_id: result.data.user.id, blocked: false }, { onConflict: 'user_id' });
    if (subscription.error) throw new Error('Conta criada, mas o acesso ainda precisa ser ativado.');
  } else if (data.action === 'password') {
    const result = await supabaseAdmin.auth.admin.updateUserById(data.userId, { password: data.password });
    if (result.error) throw new Error('Não foi possível redefinir a senha. Escolha uma senha forte.');
  } else if (data.action === 'block') {
    const result = await supabaseAdmin.from('subscriptions').upsert({ user_id: data.userId, blocked: data.blocked });
    if (result.error) throw new Error('Não foi possível atualizar o bloqueio.');
  } else if (data.action === 'payment') {
    const content = await supabaseAdmin.from('movie_sources').select('movie_id').eq('rights_confirmed', true).limit(1);
    if (content.error || !content.data?.length) throw new Error('Adicione pelo menos um vídeo autorizado antes de confirmar pagamentos e ativar assinaturas.');
    const settings = await supabaseAdmin.from('payment_settings').select('pix_key, recipient').eq('id', 1).maybeSingle();
    if (!settings.data?.pix_key || !settings.data.recipient) throw new Error('Cadastre sua chave Pix e o nome do recebedor antes de confirmar pagamentos.');
    const result = await supabaseAdmin.rpc('confirm_monthly_payment', { target: data.userId, actor: context.userId, payment_reference: data.reference });
    if (result.error) throw new Error('Não foi possível confirmar o pagamento.');
  } else if (data.action === 'settings') {
    const result = await supabaseAdmin.from('payment_settings').upsert({ id: 1, pix_key: data.pix_key, recipient: data.recipient, contact: data.contact });
    if (result.error) throw new Error('Não foi possível salvar os dados do Pix.');
  } else {
    const result = await supabaseAdmin.from('movie_sources').upsert({ movie_id: data.movieId, title: data.title, playback_url: data.url, rights_confirmed: data.rights });
    if (result.error) throw new Error('Não foi possível salvar o vídeo.');
  }
  return { ok: true };
});

export const getPlayback = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator(z.object({ movieId: z.number().int().positive() })).handler(async ({ context, data }) => {
  const [role, subscription] = await Promise.all([
    context.supabase.rpc('has_role', { _user_id: context.userId, _role: 'admin' }),
    context.supabase.from('subscriptions').select('*').eq('user_id', context.userId).maybeSingle(),
  ]);
  if (role.error || subscription.error) throw new Error('Não foi possível verificar o acesso.');
  if (!role.data && !hasActiveAccess(subscription.data)) throw new Error('Seu acesso está pendente, vencido ou bloqueado. Fale com Arthur para renovar.');
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  const source = await supabaseAdmin.from('movie_sources').select('playback_url').eq('movie_id', data.movieId).eq('rights_confirmed', true).maybeSingle();
  if (source.error || !source.data) throw new Error('Este filme ainda não tem um vídeo autorizado disponível.');
  return { url: source.data.playback_url };
});