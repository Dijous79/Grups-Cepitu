-- Base de dades dels «Grups penjats» (Supabase). S'executa un cop al SQL Editor del projecte.

create table public.propostes (
  id uuid primary key default gen_random_uuid(),
  titol text not null constraint propostes_titol_check check (char_length(titol) between 1 and 60),
  dades jsonb not null,
  creat timestamptz not null default now(),
  token uuid not null default gen_random_uuid()
);

alter table public.propostes enable row level security;
create policy "Tothom pot llegir" on public.propostes for select using (true);

-- Es poden llegir les propostes, però no el token que serveix per esborrar-les.
revoke all on public.propostes from anon, authenticated;
grant select (id, titol, dades, creat) on public.propostes to anon, authenticated;

-- Qualsevol pot penjar una proposta (amb un límit de mida).
create or replace function public.penja_proposta(p_titol text, p_dades jsonb)
returns table (out_id uuid, out_token uuid)
language plpgsql security definer set search_path = public
as $$
begin
  if octet_length(p_dades::text) > 50000 then
    raise exception 'Massa dades';
  end if;
  return query
    insert into propostes (titol, dades) values (trim(p_titol), p_dades)
    returning propostes.id, propostes.token;
end $$;

-- Només qui l'ha penjada (té el token al seu mòbil) la pot esborrar.
create or replace function public.esborra_proposta(p_id uuid, p_token uuid)
returns boolean
language sql security definer set search_path = public
as $$
  with d as (delete from propostes where id = p_id and token = p_token returning 1)
  select exists (select 1 from d);
$$;

revoke execute on function public.penja_proposta(text, jsonb) from public;
revoke execute on function public.esborra_proposta(uuid, uuid) from public;
grant execute on function public.penja_proposta(text, jsonb) to anon, authenticated;
grant execute on function public.esborra_proposta(uuid, uuid) to anon, authenticated;
