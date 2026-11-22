import { Hono } from 'hono';
const app = new Hono();
const now = () => new Date().toISOString();
const uid = () => crypto.randomUUID();
const AL = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const code = () => Array.from(crypto.getRandomValues(new Uint8Array(6)), b => AL[b % AL.length]).join('');
const sha = async s => [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)))].map(b => b.toString(16).padStart(2, '0')).join('');
const clean = (s, n) => String(s ?? '').replace(/\s+/g, ' ').trim().slice(0, n);
const err = (c, status, error) => c.json({ error }, status);

async function member(c, fid) {
  const tok = c.req.header('x-member-token') || c.req.query('t') || '';
  if (tok.length < 20) return null;
  return c.env.DB.prepare('SELECT * FROM family_members WHERE family_id=? AND token_hash=?').bind(fid, await sha(tok)).first();
}
async function newInvite(db, fid) {
  const c = code();
  await db.prepare('INSERT INTO family_invites (id,family_id,invite_code,expires_at,max_uses,used_count,created_at) VALUES (?,?,?,?,?,0,?)')
    .bind(uid(), fid, c, new Date(Date.now() + 7 * 864e5).toISOString(), 10, now()).run();
  return c;
}
async function addMember(db, fid, nick, role) {
  const id = uid(), token = uid() + uid();
  await db.prepare('INSERT INTO family_members (id,family_id,nickname,role,token_hash,joined_at) VALUES (?,?,?,?,?,?)').bind(id, fid, nick, role, await sha(token), now()).run();
  return { id, token };
}

app.post('/api/family', async c => {
  const b = await c.req.json().catch(() => ({}));
  const name = clean(b.name, 30), nick = clean(b.nickname, 20);
  if (!name || !nick) return err(c, 400, 'missing');
  const fid = uid();
  const m = await addMember(c.env.DB, fid, nick, 'owner');
  await c.env.DB.prepare('INSERT INTO family_groups (id,name,owner_member,created_at) VALUES (?,?,?,?)').bind(fid, name, m.id, now()).run();
  const inv = await newInvite(c.env.DB, fid);
  return c.json({ id: fid, name, member_id: m.id, token: m.token, role: 'owner', invite_code: inv }, 201);
});

app.post('/api/join', async c => {
  const b = await c.req.json().catch(() => ({}));
  const cd = clean(b.code, 12).toUpperCase(), nick = clean(b.nickname, 20);
  if (!cd || !nick) return err(c, 400, 'missing');
  const inv = await c.env.DB.prepare('SELECT * FROM family_invites WHERE invite_code=?').bind(cd).first();
  if (!inv) return err(c, 404, 'not_found');
  if (inv.expires_at < now()) return err(c, 410, 'expired');
  if (inv.used_count >= inv.max_uses) return err(c, 409, 'used_up');
  const dup = await c.env.DB.prepare('SELECT 1 FROM family_members WHERE family_id=? AND nickname=?').bind(inv.family_id, nick).first();
  if (dup) return err(c, 409, 'name_taken');
  const upd = await c.env.DB.prepare('UPDATE family_invites SET used_count=used_count+1 WHERE id=? AND used_count<max_uses').bind(inv.id).run();
  if (!upd.meta.changes) return err(c, 409, 'used_up');
  const g = await c.env.DB.prepare('SELECT name FROM family_groups WHERE id=?').bind(inv.family_id).first();
  const m = await addMember(c.env.DB, inv.family_id, nick, 'member');
  return c.json({ id: inv.family_id, name: g.name, member_id: m.id, token: m.token, role: 'member' }, 201);
});

app.get('/api/family/:id', async c => {
  const fid = c.req.param('id'), me = await member(c, fid);
  if (!me) return err(c, 403, 'forbidden');
  const g = await c.env.DB.prepare('SELECT name FROM family_groups WHERE id=?').bind(fid).first();
  const ms = (await c.env.DB.prepare('SELECT id,nickname,role,joined_at FROM family_members WHERE family_id=? ORDER BY joined_at').bind(fid).all()).results;
  let invite = null;
  if (me.role === 'owner') invite = await c.env.DB.prepare('SELECT invite_code,expires_at,max_uses,used_count FROM family_invites WHERE family_id=? ORDER BY created_at DESC LIMIT 1').bind(fid).first();
  return c.json({ name: g?.name, me: { id: me.id, role: me.role, nickname: me.nickname }, members: ms, invite });
});

app.post('/api/family/:id/invite', async c => {
  const fid = c.req.param('id'), me = await member(c, fid);
  if (!me) return err(c, 403, 'forbidden');
  if (me.role !== 'owner') return err(c, 403, 'owner_only');
  await c.env.DB.prepare('UPDATE family_invites SET expires_at=? WHERE family_id=?').bind(now(), fid).run();
  return c.json({ invite_code: await newInvite(c.env.DB, fid) }, 201);
});

app.delete('/api/family/:id/me', async c => {
  const fid = c.req.param('id'), me = await member(c, fid);
  if (!me) return err(c, 403, 'forbidden');
  if (me.role === 'owner') {
    const other = await c.env.DB.prepare("SELECT id FROM family_members WHERE family_id=? AND id<>? ORDER BY joined_at LIMIT 1").bind(fid, me.id).first();
    if (other) {
      await c.env.DB.prepare("UPDATE family_members SET role='owner' WHERE id=?").bind(other.id).run();
      await c.env.DB.prepare('UPDATE family_groups SET owner_member=? WHERE id=?').bind(other.id, fid).run();
    }
  }
  await c.env.DB.prepare('DELETE FROM family_members WHERE id=?').bind(me.id).run();
  return c.json({ ok: true });
});

app.get('/api/family/:id/messages', async c => {
  const fid = c.req.param('id'), me = await member(c, fid);
  if (!me) return err(c, 403, 'forbidden');
  const after = Number(c.req.query('after') || 0);
  const rows = (await c.env.DB.prepare("SELECT id,sender_id,sender_name,message_type,message_content,created_at,(image_data IS NOT NULL) AS has_image FROM family_messages WHERE family_id=? AND id>? ORDER BY id DESC LIMIT 100").bind(fid, after).all()).results.reverse();
  return c.json({ messages: rows });
});

app.post('/api/family/:id/messages', async c => {
  const fid = c.req.param('id'), me = await member(c, fid);
  if (!me) return err(c, 403, 'forbidden');
  const b = await c.req.json().catch(() => ({}));
  const text = String(b.text ?? '').trim().slice(0, 1000);
  const img = typeof b.image === 'string' && /^data:image\/(jpeg|png|webp);base64,/.test(b.image) && b.image.length <= 400000 ? b.image : null;
  if (b.image && !img) return err(c, 413, 'image_too_big');
  if (!text && !img) return err(c, 400, 'empty');
  const r = await c.env.DB.prepare('INSERT INTO family_messages (family_id,sender_id,sender_name,message_type,message_content,image_data,created_at) VALUES (?,?,?,?,?,?,?)')
    .bind(fid, me.id, me.nickname, img ? 'image' : 'text', text, img, now()).run();
  return c.json({ id: r.meta.last_row_id }, 201);
});

app.get('/api/family/:id/messages/:mid/image', async c => {
  const fid = c.req.param('id'), me = await member(c, fid);
  if (!me) return err(c, 403, 'forbidden');
  const row = await c.env.DB.prepare('SELECT image_data FROM family_messages WHERE id=? AND family_id=?').bind(c.req.param('mid'), fid).first();
  if (!row?.image_data) return err(c, 404, 'not_found');
  const [head, data] = row.image_data.split(',');
  const bin = Uint8Array.from(atob(data), ch => ch.charCodeAt(0));
  return new Response(bin, { headers: { 'content-type': head.slice(5, head.indexOf(';')), 'cache-control': 'private, max-age=86400' } });
});

const AI_SYSTEM = `너는 폰잘알의 스마트폰 사용 도우미다. 사용자는 스마트폰이 익숙하지 않은 중장년층이다.
사진을 먼저 자세히 보고 질문에 답한다. 답은 다음 순서의 짧은 문단으로 쓴다: 사진에서 확인한 내용, 지금 화면의 상황, 지금 해야 할 행동, 눌러야 할 버튼이나 메뉴의 위치, 다음 단계, 주의할 점.
규칙: 어려운 전문 용어를 쓰지 않는다. 한 번에 하나의 행동만 설명한다. 사진에 없는 버튼이나 메뉴를 지어내지 않는다. 보이지 않는 정보는 추측하지 않는다.
사진이 흐리거나 잘렸거나 스마트폰 화면이 아니면 그렇게 말하고 다시 찍도록 안내한다. 어린아이처럼 대하지 않고 차분한 한국어로 말한다.
비밀번호, 인증번호, 주민등록번호, 계좌·카드 정보가 보이면 읽지 말고 가려서 다시 올리라고 안내한다. 금융 거래나 인증을 대신 해 주지 않는다.
마크다운 기호(별표, 샵, 하이픈 목록)를 쓰지 말고 일반 문장으로만 답한다.`;

app.post('/api/ask-photo', async c => {
  if (!c.env.BAZE_API_KEY || !c.env.BAZE_API_BASE) return err(c, 503, 'no_key');
  const b = await c.req.json().catch(() => ({}));
  const msgs = Array.isArray(b.messages) ? b.messages.slice(-12) : [];
  const clean_msgs = [];
  let imgs = 0;
  for (const m of msgs) {
    if (m.role === 'assistant' && typeof m.content === 'string') clean_msgs.push({ role: 'assistant', content: m.content.slice(0, 4000) });
    else if (m.role === 'user' && typeof m.content === 'string') clean_msgs.push({ role: 'user', content: m.content.slice(0, 300) });
    else if (m.role === 'user' && Array.isArray(m.content)) {
      const t = m.content.find(x => x.type === 'text'), im = m.content.find(x => x.type === 'image_url');
      const url = im?.image_url?.url;
      if (!url || !/^data:image\/(jpeg|png|webp);base64,/.test(url) || url.length > 2_500_000) return err(c, 413, 'too_big');
      imgs++;
      clean_msgs.push({ role: 'user', content: [{ type: 'text', text: String(t?.text ?? '').slice(0, 300) }, { type: 'image_url', image_url: { url } }] });
    }
  }
  if (!clean_msgs.length || clean_msgs[clean_msgs.length - 1].role !== 'user' || imgs !== 1) return err(c, 400, 'bad_request');
  try {
    const r = await fetch(`${c.env.BAZE_API_BASE}/chat/completions`, {
      method: 'POST',
      headers: { authorization: `Bearer ${c.env.BAZE_API_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({ model: 'claude-sonnet-5-5', max_tokens: 900, messages: [{ role: 'system', content: AI_SYSTEM }, ...clean_msgs] }),
    });
    if (!r.ok) { console.log('ai status', r.status); return err(c, 502, 'ai_failed'); }
    const j = await r.json();
    const answer = String(j.choices?.[0]?.message?.content ?? '').trim();
    if (!answer) return err(c, 502, 'ai_failed');
    return c.json({ answer });
  } catch (e) { console.log('ai error', e?.name); return err(c, 502, 'ai_failed'); }
});

app.all('/api/*', c => c.json({ error: 'not found' }, 404));
export default app;
