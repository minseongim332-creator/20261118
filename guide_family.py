"""Private room chat. The provider is optional and requires two-sided translation consent."""
from base64 import b64decode, b64encode
from datetime import datetime
from io import BytesIO
import os
from uuid import UUID
import wave
from html import escape
import streamlit.components.v1 as components
import requests
from PIL import Image, ImageOps
import streamlit as st
import services
from guide_ui import w

S=st.session_state

def text(ko,en): return ko if S.lang=='ko' else en

def cfg(name): return os.getenv(name) or services.setting(name)

def rpc(db,name,**data):return db.rpc('guide_'+name,data).execute().data

def fail():st.error(text('처리하지 못했어요. 연결을 확인하고 다시 시도해 주세요.','Could not finish. Check your connection and try again.'))

def photo_data(upload):
    with Image.open(upload) as im:
        if im.format not in ('JPEG','PNG') or im.width*im.height>20_000_000:raise ValueError('photo')
        im=ImageOps.exif_transpose(im).convert('RGB');im.thumbnail((1280,1280))
        result=BytesIO();im.save(result,format='JPEG',quality=79,optimize=True)
        return result.getvalue()

def media_data(photo,voice):
    if photo and voice:raise ValueError('one attachment')
    if photo:
        if photo.size>8_000_000:raise ValueError('photo upload size')
        value=photo_data(photo);mime='image/jpeg'
    elif voice:
        value=voice.getvalue();mime='audio/wav'
        with wave.open(BytesIO(value),'rb') as wav:
            if wav.getnchannels()!=1 or not 8000<=wav.getframerate()<=48000 or wav.getnframes()/wav.getframerate()>25:raise ValueError('audio')
    else:return None,None
    encoded=b64encode(value).decode('ascii')
    if len(encoded)>1200000:raise ValueError('attachment too large')
    return mime,encoded

def translate(row):
    endpoint=cfg('GUIDE_TRANSLATE_URL')
    if not endpoint.startswith('https://'):return None
    cache=S.setdefault('guide_translations',{})
    slot=(row['id'],S.lang)
    if slot not in cache:
        try:
            target={'zh-CN':'zh','tl':'tl'}.get(S.lang,S.lang)
            result=requests.post(endpoint,json={'q':row['body'],'source':'auto','target':target,'format':'text','api_key':cfg('GUIDE_TRANSLATE_KEY')},timeout=4,allow_redirects=False)
            result.raise_for_status();value=result.json().get('translatedText')
            if not isinstance(value,str) or not value.strip() or len(value)>4800:return None
            if len(cache)>=100:cache.pop(next(iter(cache)))
            cache[slot]=value.strip()
        except (requests.RequestException,ValueError,TypeError,AttributeError):return None
    return cache[slot]

def show_messages(db,rid,actor,current,members,help_only,automatic):
    q=db.table('guide_messages').select('id,sender_id,body,kind,lang,allow_translation,media_type,created_at').eq('room_id',rid)
    if help_only:q=q.eq('kind','help')
    oldest=S.get('guide_before_'+rid)
    if oldest:q=q.lt('created_at',oldest)
    messages=q.order('created_at',desc=True).order('id',desc=True).limit(21).execute().data
    if not messages:st.info(w('empty'));return
    if not help_only and not oldest and messages[0]['created_at']>current['read_at']:
        rpc(db,'read',rid=rid,seen=messages[0]['created_at'])
        if messages[0]['sender_id']!=actor:st.toast(text('새 메시지가 왔어요.','New message.'))
    if len(messages)>20 and st.button(text('이전 메시지','Older messages'),key='guide_old_'+rid):
        S['guide_before_'+rid]=messages[19]['created_at'];st.rerun()
    if oldest and st.button(text('최신 메시지','Latest messages'),key='guide_latest_'+rid):
        S.pop('guide_before_'+rid,None);st.rerun()
    names={m['user_id']:m['display_name'] for m in members}
    newest={row['id'] for row in [r for r in messages[:20] if r['allow_translation'] and r['sender_id']!=actor and r['lang']!=S.lang][:2]}
    for row in reversed(messages[:20]):
        own=row['sender_id']==actor
        with st.chat_message('user' if own else 'assistant',avatar='👤' if own else '💬'):
            stamp=datetime.fromisoformat(row['created_at']).astimezone().strftime('%Y-%m-%d %H:%M %Z')
            reads=sum(m['user_id']!=actor and m['read_at']>=row['created_at'] for m in members)
            st.text(names.get(row['sender_id'],text('이전 구성원','Former member'))+' · '+stamp+' · '+row['lang']+(' · '+text('읽음','Read')+f' {reads}' if own and reads else ''))
            if row['kind']=='help':st.caption('♡ '+w('help'))
            if row['body']:
                st.text(row['body'])
                if automatic and row['allow_translation'] and not own and row['lang']!=S.lang:
                    attempted=S.setdefault('guide_translate_attempted',set())
                    auto=row['id'] in newest and (row['id'],S.lang) not in attempted and len(attempted)<200
                    if auto or (row['id'],S.lang) in S.get('guide_translations',{}) or st.button(text('번역 보기','Show translation'),key='translate_'+row['id']):
                        if auto:attempted.add((row['id'],S.lang))
                        translated=translate(row)
                        if translated:st.caption(text('자동 번역','Automatic translation'));st.text(translated)
                        else:st.caption(text('번역할 수 없어요. 위 원문을 봐 주세요.','Translation unavailable. Read the original above.'))
            if row['media_type'] and st.toggle(text('첨부 열기','Open attachment'),key='attach_'+row['id']):
                attachment=db.table('guide_messages').select('media').eq('id',row['id']).eq('room_id',rid).limit(1).execute().data
                if attachment:
                    try:
                        raw=b64decode(attachment[0]['media'],validate=True)
                        inline=b64encode(raw).decode('ascii')
                        if row['media_type']=='image/jpeg':
                            label=escape(text('가족이 보낸 사진','Photo from family'))
                            st.markdown(f'<img class="guide-chat-img" src="data:image/jpeg;base64,{inline}" alt="{label}" decoding="async" loading="lazy">',unsafe_allow_html=True)
                        else:
                            label=escape(text('가족이 보낸 음성 메시지','Voice message from family'))
                            components.html(f'<audio controls preload="none" style="width:100%" aria-label="{label}" src="data:audio/wav;base64,{inline}"></audio>',height=66)
                    except (ValueError,TypeError):fail()

@st.fragment(run_every='12s')
def feed(rid,actor,help_only,automatic):
    try:
        db=services.client();members=db.table('guide_members').select('user_id,display_name,read_at,lang').eq('room_id',rid).execute().data
        current=next((x for x in members if x['user_id']==actor),None)
        if not current:st.warning(text('더 이상 이 대화를 볼 수 없어요.','You no longer have access to this chat.'));return
        show_messages(db,rid,actor,current,members,help_only,automatic)
    except Exception:fail()

def compose(db,rid,help_mode,stage):
    k='help' if help_mode else 'message'
    nonce=S.get('guide_write_nonce',0)
    st.caption(w('privacy'))
    pending=S.get('guide_pending')
    if pending and (pending['rid'],pending['msg_kind'])!=(rid,k):
        S.pop('guide_pending',None);pending=None
    if pending:
        st.subheader(w('preview'));st.text(pending['message'])
        if pending['attachment']:st.caption(text('첨부 1개를 같이 보내요.','One attachment will be sent.'))
        a,b=st.columns(2)
        if a.button(w('cancel'),key='guide_send_cancel'):
            S.pop('guide_pending',None);st.rerun()
        if b.button(w('send'),key='guide_send_real',type='primary'):
            try:
                rpc(db,'send',**pending);S.pop('guide_pending',None);S.guide_write_nonce=nonce+1;S.guide_sent=True;st.rerun()
            except Exception:fail()
        return
    if S.pop('guide_sent',False):st.success(text('가족에게 보냈어요.','Sent to your family.'))
    with st.form(f'guide_write_{rid}_{k}_{nonce}'):
        body=st.text_area(w('question' if help_mode else 'sms'),max_chars=1200,key=f'guide_body_{rid}_{k}_{nonce}')
        add_stage=st.checkbox(text('현재 학습 단계도 보내기','Include this lesson step'),value=False,disabled=not stage) if help_mode else False
        photo=st.file_uploader(text('사진 첨부 (JPG, PNG)','Attach a photo (JPG, PNG)'),type=['jpeg','jpg','png'],key=f'guide_photo_{nonce}') if not help_mode else None
        recording=st.audio_input(text('음성 메시지 (최대 25초)','Voice message (up to 25 seconds)'),sample_rate=16000,key=f'guide_audio_{nonce}') if not help_mode else None
        translate_ok=st.checkbox(text('이 메시지의 외부 자동 번역을 허용해요','Allow this message to be sent to the translation provider'),value=False) if cfg('GUIDE_TRANSLATE_URL') else False
        if st.form_submit_button(w('preview'),type='primary'):
            try:
                mime,attachment=media_data(photo,recording)
            except (ValueError, OSError, wave.Error, EOFError):
                st.error(text('JPG·PNG 사진 한 장 또는 25초 이하 음성 중 하나만 첨부해 주세요.','Attach one JPG/PNG photo or one voice clip up to 25 seconds.'));return
            message='\n'.join(s for s in (stage if add_stage else '',body.strip()) if s)
            if not message and not attachment:st.info(w('empty'));return
            S.guide_pending=dict(rid=rid,message=message,msg_kind=k,locale=S.lang,translate_ok=translate_ok,mime=mime,attachment=attachment);st.rerun()

def render(page,go):
    st.title(w(page))
    if S.lang not in ('ko','en'):st.caption('The family setup below is shown in English.')
    help_mode=page=='help'
    if help_mode:st.caption(text('다른 앱의 화면은 캡처하지 않아요. 질문과 현재 학습 단계만 선택해 보낼 수 있어요.','Other apps are not captured. You can choose to share your question and the current lesson step.'))
    if not services.configured():
        st.info(w('not_ready'))
        if st.button(w('legacy'),key='guide_old_chat'):go('photo' if help_mode else 'chat')
        return
    account=S.get('account')
    if not account:
        st.info(text('가족과 연결하려면 내 계정으로 들어가 주세요. 연습은 로그인 없이 할 수 있어요.','Sign in to connect with your family. Practice is available without an account.'))
        if st.button(w('profile'),type='primary'):go('account')
        return
    try:
        db=services.client();actor=account['id']
        rooms=db.table('guide_rooms').select('id,title,kind,owner_id').order('title').limit(50).execute().data
        if not help_mode:
            with st.expander(text('가족 연결 · 대화 만들기','Connect family · Create a chat'),expanded=not rooms):
                st.caption(text('코드를 받은 가족이 수락하면 연결돼요. 새로 연결한 구성원도 이 방의 기록을 볼 수 있어요.','Family joins by accepting your invite. New members can also read this room’s history.'))
                nick=st.text_input(text('가족에게 보일 이름','Name shown to family'),max_chars=30,value=S.get('profile_name',''))
                code=st.text_input(text('받은 초대 코드','Received invite code'),max_chars=36,autocomplete='off')
                if st.button(text('초대 수락','Accept invite')):
                    if not nick.strip():st.warning(text('이름을 먼저 적어 주세요.','Enter your name first.'))
                    else:
                        try:UUID(code.strip())
                        except ValueError:st.error(text('초대 코드를 확인해 주세요.','Check the invite code.'));return
                        rpc(db,'accept',code=code.strip(),nick=nick,locale=S.lang);st.rerun()
                title=st.text_input(text('새 채팅방 이름','New chat name'),max_chars=50)
                kind=st.radio(text('채팅 유형','Chat type'),['direct','group'],horizontal=True,format_func=lambda k:text('1:1 채팅','One-to-one') if k=='direct' else text('가족 단체 채팅','Family group'))
                if st.button(text('채팅방 만들기','Create chat')):
                    if not nick.strip() or not title.strip():st.warning(text('이름과 채팅방 이름을 적어 주세요.','Enter your name and a chat name.'))
                    else:rpc(db,'create_room',label=title,room_kind=kind,nick=nick,locale=S.lang);st.rerun()
        if not rooms:
            st.info(w('empty'))
            if help_mode and st.button(w('family')):go('family')
            return
        by_id={r['id']:r for r in rooms}
        rid=st.selectbox(text('채팅방','Chat room'),list(by_id),format_func=lambda i:by_id[i]['title'],key='guide_room_'+page)
        members=db.table('guide_members').select('user_id,display_name,lang').eq('room_id',rid).execute().data
        if not help_mode:
            room=by_id[rid]
            with st.expander(text('가족 구성원과 초대','Members and invites')):
                is_owner=room['owner_id']==actor
                for member in members:st.text(member['display_name']+' · '+member['lang'])
                if is_owner:
                    if st.button(text('초대 코드 만들기','Create invite code')):S['room_invite_'+rid]=rpc(db,'invite',rid=rid)
                    if S.get('room_invite_'+rid):
                        st.code(S['room_invite_'+rid]);st.caption(text('24시간 동안 한 사람만 쓸 수 있어요.','One person can use this code within 24 hours.'))
                    others={m['user_id']:m['display_name'] for m in members if m['user_id']!=actor}
                    if others:
                        remove=st.selectbox(text('연결 해제할 가족','Member to remove'),[None,*others],format_func=lambda i:others.get(i,'—'))
                        if remove and st.checkbox(text('이 가족의 채팅 접근을 끊어요.','Remove this member’s access.')) and st.button(text('연결 해제','Remove member')):
                            rpc(db,'leave',rid=rid,member=remove);st.rerun()
                if st.checkbox(text('이 방을 닫으면 모두의 대화가 삭제돼요.' if is_owner else '나가면 이 방의 대화를 열 수 없어요.','Closing removes this chat for everyone.' if is_owner else 'Leaving removes your access to this chat.')):
                    if st.button(text('채팅방 닫기' if is_owner else '채팅방 나가기','Close chat' if is_owner else 'Leave chat')):
                        rpc(db,'leave',rid=rid);st.rerun()
            st.caption(text('채팅을 열어 둔 동안 새 메시지를 확인해요.','New messages are checked while the chat is open.'))
            mode=st.segmented_control(text('보기','View'),['all','help'],format_func=lambda i:w('help') if i=='help' else w('family'),default='all',label_visibility='collapsed')
            automatic=st.toggle(text('외부 번역 보기','Show external translations'),value=False) if cfg('GUIDE_TRANSLATE_URL') else False
            feed(rid,actor,mode=='help',automatic)
            if mode=='help':return
        if len(members)<2:
            st.info(text('가족이 초대를 수락하면 보낼 수 있어요.','You can send once a family member accepts an invite.'));return
        stage=''
        if help_mode:
            from guide_lessons import FLOWS
            key=S.get('guide_recent')
            if key in FLOWS and key not in ('login','signup','verify','cert','simple'):
                i=S.get('guide_steps',{}).get(key,0)
                stage=f'📚 {w(key)} · {w("step")} {i+1}/{len(FLOWS[key])}'
        compose(db,rid,help_mode,stage)
    except Exception:fail()
