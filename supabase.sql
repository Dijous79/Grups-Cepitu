-- Base de dades dels «Grups penjats» (Supabase). S'executa un cop al SQL Editor del projecte.
-- Abans, canvia CANVIA-AQUESTA-CLAU per la paraula clau de l'esplai (no la pugis al git).

create table public.propostes (
  id uuid primary key default gen_random_uuid(),
  autor text not null check (char_length(autor) between 1 and 40),
  dades jsonb not null,
  creat timestamptz not null default now(),
  token uuid not null default gen_random_uuid()
);

alter table public.propostes enable row level security;
create policy "Tothom pot llegir" on public.propostes for select using (true);

-- Es poden llegir les propostes, però no el token que serveix per esborrar-les.
revoke all on public.propostes from anon, authenticated;
grant select (id, autor, dades, creat) on public.propostes to anon, authenticated;

-- Penjar una proposta només amb la paraula clau de l'esplai.
create or replace function public.penja_proposta(p_autor text, p_dades jsonb, p_clau text)
returns table (out_id uuid, out_token uuid)
language plpgsql security definer set search_path = public
as $$
begin
  if p_clau is distinct from 'CANVIA-AQUESTA-CLAU' then
    raise exception 'Clau incorrecta';
  end if;
  if octet_length(p_dades::text) > 50000 then
    raise exception 'Massa dades';
  end if;
  return query
    insert into propostes (autor, dades) values (trim(p_autor), p_dades)
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

revoke execute on function public.penja_proposta(text, jsonb, text) from public;
revoke execute on function public.esborra_proposta(uuid, uuid) from public;
grant execute on function public.penja_proposta(text, jsonb, text) to anon, authenticated;
grant execute on function public.esborra_proposta(uuid, uuid) to anon, authenticated;
