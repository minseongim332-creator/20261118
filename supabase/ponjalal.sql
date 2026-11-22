-- Additive migration for the new family space. Apply after schema.sql.
begin;
create table if not exists public.pon_families (
 id uuid primary key default gen_random_uuid(), title text not null check(char_length(title) between 1 and 60),
 created_at timestamptz not null default now());
create table if not exists public.pon_members (
 family uuid references public.pon_families on delete cascade, actor uuid references auth.users on delete cascade,
 nick text not null check(char_length(nick) between 1 and 32), admin boolean not null default false,
 lang text not null, device text not null check(device in ('Galaxy','iPhone','Unknown')),
 read_at timestamptz not null default '-infinity', primary key(family,actor));
create table if not exists public.pon_invites (
 family uuid primary key references public.pon_families on delete cascade, code text not null unique,
 expires timestamptz not null, remaining integer not null check(remaining between 0 and 6));
create table if not exists public.pon_requests (
 family uuid references public.pon_families on delete cascade, actor uuid references auth.users on delete cascade,
 nick text not null check(char_length(nick) between 1 and 32), lang text not null,
 device text not null check(device in ('Galaxy','iPhone','Unknown')), created_at timestamptz not null default now(), primary key(family,actor));
create table if not exists public.pon_attempts (actor uuid primary key references auth.users on delete cascade, started timestamptz not null, tries integer not null);
create table if not exists public.pon_blocks (family uuid references public.pon_families on delete cascade,actor uuid references auth.users on delete cascade,primary key(family,actor));
create table if not exists public.pon_messages (
 id uuid primary key default gen_random_uuid(), family uuid not null references public.pon_families on delete cascade,
 actor uuid references auth.users on delete set null, nick text not null, body text not null check(char_length(body)<=1200),
 kind text not null check(kind in ('chat','help','lesson')), lesson text check(lesson ~ '^[a-z_]{1,40}$'),
 photo boolean not null default false, translate_ok boolean not null default false, source_lang text not null default 'ko', created_at timestamptz not null default now());
create table if not exists public.pon_photos (id uuid primary key references public.pon_messages on delete cascade, jpg text not null check(length(jpg)<=650000 AND jpg ~ '^/9j/[A-Za-z0-9+/]+={0,2}$'));
alter table public.pon_messages add column if not exists lesson_step smallint check(lesson_step between 1 and 20 and lesson is not null);
create index if not exists pon_members_actor on public.pon_members(actor);
create index if not exists pon_messages_family on public.pon_messages(family,created_at desc,id desc);

create or replace function public.pon_in(fid uuid, require_admin boolean default false) returns boolean
language sql stable security definer set search_path='' as $$ select exists(select 1 from public.pon_members where family=fid and actor=auth.uid() and (not require_admin or admin)); $$;
revoke all on function public.pon_in(uuid,boolean) from public,anon;
grant execute on function public.pon_in(uuid,boolean) to authenticated;

alter table public.pon_families enable row level security;
alter table public.pon_members enable row level security;
alter table public.pon_invites enable row level security;
alter table public.pon_requests enable row level security;
alter table public.pon_messages enable row level security;
alter table public.pon_photos enable row level security;
alter table public.pon_attempts enable row level security;
alter table public.pon_blocks enable row level security;
revoke all on public.pon_families,public.pon_members,public.pon_invites,public.pon_requests,public.pon_messages,public.pon_photos,public.pon_attempts,public.pon_blocks from public,anon,authenticated;
grant select on public.pon_families,public.pon_invites,public.pon_requests,public.pon_messages,public.pon_photos to authenticated;
grant select(family,actor,nick,admin,read_at) on public.pon_members to authenticated;
drop policy if exists pon_family_read on public.pon_families;
create policy pon_family_read on public.pon_families for select to authenticated using(public.pon_in(id));
drop policy if exists pon_member_read on public.pon_members;
create policy pon_member_read on public.pon_members for select to authenticated using(public.pon_in(family));
drop policy if exists pon_invite_read on public.pon_invites;
create policy pon_invite_read on public.pon_invites for select to authenticated using(public.pon_in(family,true));
drop policy if exists pon_request_read on public.pon_requests;
create policy pon_request_read on public.pon_requests for select to authenticated using(actor=auth.uid() or public.pon_in(family,true));
drop policy if exists pon_message_read on public.pon_messages;
create policy pon_message_read on public.pon_messages for select to authenticated using(public.pon_in(family));
drop policy if exists pon_photo_read on public.pon_photos;
create policy pon_photo_read on public.pon_photos for select to authenticated using(exists(select 1 from public.pon_messages m where m.id=pon_photos.id and public.pon_in(m.family)));

create or replace function public.pon_action(op text, fid uuid default null, arg jsonb default '{}'::jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare me uuid:=auth.uid(); target uuid; code_new text; display text:=left(trim(coalesce(arg->>'nick','')),32);
 locale text:=coalesce(arg->>'lang','ko'); phone text:=coalesce(arg->>'device','Unknown');
 tries_now integer; inv public.pon_invites; req public.pon_requests; is_admin boolean; mid uuid;
 msg text:=trim(coalesce(arg->>'body','')); jpg text:=nullif(arg->>'jpg',''); msg_kind text:=coalesce(arg->>'kind','chat');
begin
 if me is null then raise exception 'not_signed_in'; end if;
 if op in ('create','join') then
   perform pg_advisory_xact_lock(hashtextextended(me::text,18));
   if display='' or locale not in ('ko','en','vi','ja','zh-CN','th','tl','mn') or phone not in ('Galaxy','iPhone','Unknown') then raise exception 'invalid_profile'; end if;
 end if;
 if op='create' then
   if (select count(*) from public.pon_members where actor=me)>=8 then raise exception 'family_limit'; end if;
   insert into public.pon_families(title) values(trim(arg->>'title')) returning id into fid;
   insert into public.pon_members(family,actor,nick,admin,lang,device) values(fid,me,display,true,locale,phone);
   op:='invite';
 end if;
 if op in ('join','inspect_invite') then
   insert into public.pon_attempts as a(actor,started,tries) values(me,now(),1)
   on conflict(actor) do update set started=case when a.started<now()-interval '15 minutes' then now() else a.started end,
   tries=case when a.started<now()-interval '15 minutes' then 1 else least(a.tries+1,100) end returning tries into tries_now;
   if tries_now>8 then return jsonb_build_object('status','limited'); end if;
   select * into inv from public.pon_invites where code=regexp_replace(upper(coalesce(arg->>'code','')),'[[:space:]-]','','g') and expires>now() and remaining>0;
   if not found then return jsonb_build_object('status','unavailable'); end if;
   -- Read the invitation again with the room lock used by revocation and approval.
   perform pg_advisory_xact_lock(hashtextextended(inv.family::text,29));
   select * into inv from public.pon_invites where code=regexp_replace(upper(coalesce(arg->>'code','')),'[[:space:]-]','','g') and expires>now() and remaining>0;
   if not found then return jsonb_build_object('status','unavailable'); end if;
   if exists(select 1 from public.pon_blocks where family=inv.family and actor=me) then return jsonb_build_object('status','unavailable'); end if;
   if op='inspect_invite' then return jsonb_build_object('status','ok','title',(select title from public.pon_families where id=inv.family)); end if;
   if public.pon_in(inv.family) then return jsonb_build_object('status','member','id',inv.family); end if;
   if not exists(select 1 from public.pon_requests where family=inv.family and actor=me) then
     if (select count(*) from public.pon_requests where actor=me)>=8 then return jsonb_build_object('status','limited'); end if;
     insert into public.pon_requests(family,actor,nick,lang,device) values(inv.family,me,display,locale,phone);
     update public.pon_invites set remaining=remaining-1 where family=inv.family;
   end if;
   return jsonb_build_object('status','pending','title',(select title from public.pon_families where id=inv.family));
 end if;
 if op='cancel_request' then delete from public.pon_requests where family=fid and actor=me; return '{}'::jsonb; end if;
 if fid is null then raise exception 'family_required'; end if;
 perform pg_advisory_xact_lock(hashtextextended(fid::text,29));
 if not public.pon_in(fid) then raise exception 'not_a_member'; end if;
 is_admin:=public.pon_in(fid,true);
 if op='member_devices' then
   if not is_admin then raise exception 'not_admin'; end if;
   return coalesce((select jsonb_agg(jsonb_build_object('actor',actor,'lang',lang,'device',device)) from public.pon_members where family=fid),'[]'::jsonb);
 end if;
 if op='my_device' then
   if locale not in ('ko','en','vi','ja','zh-CN','th','tl','mn') or phone not in ('Galaxy','iPhone','Unknown') then raise exception 'invalid_profile'; end if;
   update public.pon_members set lang=locale,device=phone where family=fid and actor=me;
   return '{}'::jsonb;
 end if;
 if op in ('invite','revoke','rename','approve','reject','role','remove','delete') and not is_admin then raise exception 'not_admin'; end if;
 if op='invite' then
   code_new:=upper(left(replace(gen_random_uuid()::text,'-',''),12));
   insert into public.pon_invites(family,code,expires,remaining) values(fid,code_new,now()+interval '24 hours',6)
   on conflict(family) do update set code=excluded.code,expires=excluded.expires,remaining=excluded.remaining;
 elsif op='revoke' then delete from public.pon_invites where family=fid;
 elsif op='rename' then update public.pon_families set title=trim(arg->>'title') where id=fid;
 elsif op in ('approve','reject') then
   target:=(arg->>'actor')::uuid;
   select * into req from public.pon_requests where family=fid and actor=target and created_at>now()-interval '7 days';
   if op='approve' and not found then raise exception 'request_unavailable'; end if;
   if op='approve' then
     if (select count(*) from public.pon_members where family=fid)>=24 then raise exception 'member_limit'; end if;
     insert into public.pon_members(family,actor,nick,lang,device) values(fid,target,req.nick,req.lang,req.device) on conflict do nothing;
   end if;
   delete from public.pon_requests where family=fid and actor=target;
 elsif op in ('remove','role','leave') then
   target:=case when op='leave' then me else (arg->>'actor')::uuid end;
   if exists(select 1 from public.pon_members where family=fid and actor=target and admin) and not exists(select 1 from public.pon_members where family=fid and actor<>target and admin) then raise exception 'last_admin'; end if;
   if op='role' then update public.pon_members set admin=(arg->>'admin')::boolean where family=fid and actor=target;
   else
     if op='remove' and exists(select 1 from public.pon_members where family=fid and actor=target) then
       insert into public.pon_blocks(family,actor) values(fid,target) on conflict do nothing;
     end if;
     delete from public.pon_members where family=fid and actor=target;
   end if;
 elsif op='delete' then delete from public.pon_families where id=fid;
 elsif op='read' then update public.pon_members set read_at=greatest(read_at,least(now(),(arg->>'through')::timestamptz)) where family=fid and actor=me;
 elsif op='delete_message' then delete from public.pon_messages where family=fid and actor=me and id=(arg->>'id')::uuid;
 elsif op='send' then
   if not exists(select 1 from public.pon_members where family=fid and actor<>me) then raise exception 'no_recipient'; end if;
   if char_length(msg)>1200 or (msg='' and jpg is null and nullif(arg->>'lesson','') is null) then raise exception 'message_required'; end if;
   if nullif(arg->>'lesson','') is not null and (msg_kind not in ('lesson','help') or arg->>'lesson' not in ('calls','contacts','sms','camera','gallery','internet','wifi','font','copy','safe')) then raise exception 'lesson_not_shareable'; end if;
   if (select count(*) from public.pon_messages where family=fid and actor=me and created_at>now()-interval '1 minute')>=15 then raise exception 'send_limit'; end if;
   if (select count(*) from public.pon_messages where family=fid and photo)>=250 and jpg is not null then raise exception 'photo_limit'; end if;
   insert into public.pon_messages(family,actor,nick,body,kind,lesson,photo,translate_ok,source_lang,lesson_step) select fid,me,nick,msg,msg_kind,nullif(arg->>'lesson',''),jpg is not null,coalesce((arg->>'translate')::boolean,false),case when locale in ('ko','en','vi','ja','zh-CN','th','tl','mn') then locale else lang end,(arg->>'lessonStep')::smallint from public.pon_members where family=fid and actor=me returning id into mid;
   if jpg is not null then insert into public.pon_photos(id,jpg) values(mid,jpg); end if;
 else raise exception 'unknown_operation'; end if;
 return jsonb_build_object('id',coalesce(mid,fid),'code',code_new);
end; $$;
revoke all on function public.pon_action(text,uuid,jsonb) from public,anon;
grant execute on function public.pon_action(text,uuid,jsonb) to authenticated;
do $$ begin
 if exists(select 1 from pg_publication where pubname='supabase_realtime') and not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='pon_messages') then
   alter publication supabase_realtime add table public.pon_messages;
 end if;
end $$;
commit;
