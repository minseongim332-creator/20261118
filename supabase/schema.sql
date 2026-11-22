-- Run once in your project's SQL editor. No service-role key is used by the app.
create table if not exists public.learning_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null default '{}' check (octet_length(payload::text)<200000),
  updated_at timestamptz not null default now()
);
alter table public.learning_state enable row level security;
drop policy if exists guide_own_learning on public.learning_state;
create policy guide_own_learning on public.learning_state to authenticated using (user_id=(select auth.uid())) with check (user_id=(select auth.uid()));
revoke all on public.learning_state from anon;
grant select,insert,update,delete on public.learning_state to authenticated;

create schema if not exists guide_private;
revoke all on schema guide_private from public;
create table if not exists public.guide_rooms (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (length(title) between 1 and 50),
  kind text not null check (kind in ('group','direct'))
);
create table if not exists public.guide_members (
  room_id uuid references public.guide_rooms(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  display_name text not null check (length(display_name) between 1 and 30),
  lang text not null check (length(lang) between 2 and 10),
  read_at timestamptz not null default now(),
  primary key (room_id,user_id)
);
create index if not exists guide_room_member_lookup on public.guide_members(user_id,room_id);
create table if not exists guide_private.invites (
  id uuid primary key default gen_random_uuid(), room_id uuid not null references public.guide_rooms(id) on delete cascade,
  expires timestamptz not null default (now()+interval '1 day')
);
create table if not exists public.guide_messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.guide_rooms(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (length(body)<=1600),
  kind text not null check (kind in ('message','help')),
  lang text not null check (length(lang) between 2 and 10),
  allow_translation boolean not null default false,
  media_type text check (media_type in ('image/jpeg','audio/wav')),
  media text check (length(media)<=1200000),
  created_at timestamptz not null default now(),
  check ((media is null)=(media_type is null)),
  check (length(trim(body))>0 or media is not null)
);
create index if not exists guide_message_history on public.guide_messages(room_id,created_at desc,id);

create or replace function public.guide_in_room(rid uuid) returns boolean
language sql stable security definer set search_path='' as $$
  select exists(select 1 from public.guide_members where room_id=rid and user_id=(select auth.uid()));
$$;
revoke all on function public.guide_in_room(uuid) from public,anon;
grant execute on function public.guide_in_room(uuid) to authenticated;
alter table public.guide_rooms enable row level security;
alter table public.guide_members enable row level security;
alter table public.guide_messages enable row level security;
alter table guide_private.invites enable row level security;
revoke all on public.guide_rooms,public.guide_members,public.guide_messages from anon,authenticated;
grant select on public.guide_rooms,public.guide_members,public.guide_messages to authenticated;
drop policy if exists guide_room_access on public.guide_rooms;
create policy guide_room_access on public.guide_rooms for select to authenticated using (public.guide_in_room(id));
drop policy if exists guide_member_access on public.guide_members;
create policy guide_member_access on public.guide_members for select to authenticated using (public.guide_in_room(room_id));
drop policy if exists guide_message_access on public.guide_messages;
create policy guide_message_access on public.guide_messages for select to authenticated using (public.guide_in_room(room_id));

create or replace function public.guide_create_room(label text, room_kind text, nick text, locale text) returns uuid
language plpgsql security definer set search_path='' as $$
declare rid uuid; actor uuid:=auth.uid();
begin
 if actor is null then raise exception 'sign in required'; end if;
 perform pg_advisory_xact_lock(hashtext('guide:'||actor::text));
 if (select count(*) from public.guide_rooms where owner_id=actor)>=12 then raise exception 'room limit'; end if;
 insert into public.guide_rooms(owner_id,title,kind) values(actor,trim(label),room_kind) returning id into rid;
 insert into public.guide_members(room_id,user_id,display_name,lang) values(rid,actor,trim(nick),locale);
 return rid;
end $$;

create or replace function public.guide_invite(rid uuid) returns uuid
language plpgsql security definer set search_path='' as $$
declare code uuid;
begin
 if not public.guide_in_room(rid) or not exists(select 1 from public.guide_rooms where id=rid and owner_id=auth.uid()) then raise exception 'not allowed'; end if;
 perform pg_advisory_xact_lock(hashtext('guide:'||rid::text));
 delete from guide_private.invites where room_id=rid;
 insert into guide_private.invites(room_id) values(rid) returning id into code;
 return code;
end $$;

create or replace function public.guide_accept(code uuid, nick text, locale text) returns uuid
language plpgsql security definer set search_path='' as $$
declare rid uuid; cap integer; actor uuid:=auth.uid();
begin
 if actor is null then raise exception 'sign in required'; end if;
 select i.room_id into rid from guide_private.invites i where i.id=code and i.expires>now();
 if rid is null then raise exception 'invite unavailable'; end if;
 perform pg_advisory_xact_lock(hashtext('guide:'||rid::text));
 if not exists(select 1 from guide_private.invites i where i.id=code and i.expires>now()) then raise exception 'invite unavailable'; end if;
 if public.guide_in_room(rid) then return rid; end if;
 select case when kind='direct' then 2 else 10 end into cap from public.guide_rooms where id=rid;
 if (select count(*) from public.guide_members where room_id=rid)>=cap then raise exception 'room full'; end if;
 insert into public.guide_members(room_id,user_id,display_name,lang) values(rid,actor,trim(nick),locale);
 delete from guide_private.invites where id=code;
 return rid;
end $$;

create or replace function public.guide_leave(rid uuid, member uuid default null) returns void
language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); owner uuid;
begin
 if not public.guide_in_room(rid) then raise exception 'not allowed'; end if;
 perform pg_advisory_xact_lock(hashtext('guide:'||rid::text));
 select owner_id into owner from public.guide_rooms where id=rid;
 if member is not null and member<>actor and owner<>actor then raise exception 'not allowed'; end if;
 if coalesce(member,actor)=owner then delete from public.guide_rooms where id=rid;
 else delete from public.guide_members where room_id=rid and user_id=coalesce(member,actor); end if;
end $$;

create or replace function public.guide_send(rid uuid, message text, msg_kind text, locale text, translate_ok boolean, mime text default null, attachment text default null) returns uuid
language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); mid uuid;
begin
 perform pg_advisory_xact_lock(hashtext('guide:'||rid::text));
 if not public.guide_in_room(rid) then raise exception 'not allowed'; end if;
 if (select count(*) from public.guide_members where room_id=rid)<2 then raise exception 'no recipient'; end if;
 if (select count(*) from public.guide_messages where room_id=rid and sender_id=actor and created_at>now()-interval '1 minute')>=20 then raise exception 'message limit'; end if;
 if attachment is not null and ((mime='image/jpeg' and attachment not like '/9j/%') or (mime='audio/wav' and attachment not like 'UklGR%')) then raise exception 'unsupported attachment'; end if;
 insert into public.guide_messages(room_id,sender_id,body,kind,lang,allow_translation,media_type,media)
  values(rid,actor,trim(message),msg_kind,locale,translate_ok,mime,attachment) returning id into mid;
 return mid;
end $$;

create or replace function public.guide_read(rid uuid, seen timestamptz) returns void
language sql security definer set search_path='' as $$
 update public.guide_members set read_at=greatest(read_at,least(seen,now())) where room_id=rid and user_id=auth.uid();
$$;

create or replace function public.guide_delete_self() returns void
language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null then raise exception 'sign in required'; end if;
 delete from auth.users where id=auth.uid();
end $$;

revoke all on function public.guide_create_room(text,text,text,text),public.guide_invite(uuid),public.guide_accept(uuid,text,text),public.guide_leave(uuid,uuid),public.guide_send(uuid,text,text,text,boolean,text,text),public.guide_read(uuid,timestamptz),public.guide_delete_self() from public,anon;
grant execute on function public.guide_create_room(text,text,text,text),public.guide_invite(uuid),public.guide_accept(uuid,text,text),public.guide_leave(uuid,uuid),public.guide_send(uuid,text,text,text,boolean,text,text),public.guide_read(uuid,timestamptz),public.guide_delete_self() to authenticated;
