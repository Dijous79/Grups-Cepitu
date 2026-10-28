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

-- Vots: un per proposta i navegador (votant és un identificador anònim desat al navegador).
-- La taula no es pot llegir directament, perquè ningú pugui canviar el vot d'un altre.
create table public.vots (
  proposta uuid not null references public.propostes (id) on delete cascade,
  votant uuid not null,
  valor smallint not null check (valor in (-1, 1)),
  primary key (proposta, votant)
);

alter table public.vots enable row level security;
revoke all on public.vots from anon, authenticated;

-- p_valor: 1 a favor, -1 en contra, 0 treu el vot.
create or replace function public.vota_proposta(p_id uuid, p_votant uuid, p_valor int)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  if p_valor = 0 then
    delete from vots where proposta = p_id and votant = p_votant;
  elsif p_valor in (-1, 1) then
    insert into vots (proposta, votant, valor) values (p_id, p_votant, p_valor)
    on conflict (proposta, votant) do update set valor = excluded.valor;
  else
    raise exception 'Vot no vàlid';
  end if;
end $$;

-- Propostes amb els vots a favor i en contra, i el vot de qui pregunta.
create or replace function public.llista_propostes(p_votant uuid)
returns table (id uuid, titol text, dades jsonb, creat timestamptz, positius int, negatius int, meu int)
language sql stable security definer set search_path = public
as $$
  select p.id, p.titol, p.dades, p.creat,
    (count(v.valor) filter (where v.valor = 1))::int,
    (count(v.valor) filter (where v.valor = -1))::int,
    coalesce(max(v.valor) filter (where v.votant = p_votant), 0)::int
  from propostes p
  left join vots v on v.proposta = p.id
  group by p.id
  order by p.creat desc
  limit 200;
$$;

revoke execute on function public.vota_proposta(uuid, uuid, int) from public;
revoke execute on function public.llista_propostes(uuid) from public;
grant execute on function public.vota_proposta(uuid, uuid, int) to anon, authenticated;
grant execute on function public.llista_propostes(uuid) to anon, authenticated;
