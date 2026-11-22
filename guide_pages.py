"""Lesson navigation, voice prompts, and the interactive practice phone."""
from datetime import datetime, timezone
from html import escape
import json
import streamlit as st
import streamlit.components.v1 as components
from guide_lessons import FLOWS
from guide_ui import w

S = st.session_state
DEMO_CODE = '246810'
APP_KEYS = ('calls','contacts','sms','camera','gallery','internet','wifi','font','login','signup','verify','copy','cert','simple','clock')

def start(key, go):
    S.guide_topic = key
    go('topic')

def voice(text, locale=None):
    if not S.get('guide_voice_value',True): return
    lang=locale or S.lang
    data=json.dumps([text,lang,S.get('guide_speed_value',.9),w('no_voice')],ensure_ascii=True).replace('<','\\u003c')
    iframe=getattr(st,'iframe',components.html)
    iframe(f'''<!doctype html><html lang="{escape(lang)}"><meta charset="utf-8"><title>{escape(w('voice'))}</title><style>
      body{{margin:0;font:16px system-ui;color:#26372b}}button{{cursor:pointer;border:1px solid #c5d5be;border-radius:11px;background:#f3f8ed;padding:10px 15px;min-height:44px;color:#26372b;font:inherit}}button:focus-visible{{outline:3px solid #526f43;outline-offset:1px}}#notice{{margin-left:8px}}</style>
      <button id="s">🔊 {escape(w('listen'))}</button><span id="notice" role="status"></span><script>
      const [text,lang,rate,notice]={data};const syn=window.speechSynthesis;
      if(syn) syn.getVoices();document.getElementById('s').onclick=()=>{{
        const v=syn?.getVoices().find(v=>v.lang.toLowerCase()===lang.toLowerCase())||syn?.getVoices().find(v=>v.lang.split('-')[0]===lang.split('-')[0]&&lang!=='zh-CN');
        const n=document.getElementById('notice');if(!v){{n.textContent=notice;return}} n.textContent='';syn.cancel();
        const u=new SpeechSynthesisUtterance(text);u.voice=v;u.lang=v.lang;u.rate=rate;u.onerror=e=>{{if(e.error!=='interrupted'&&e.error!=='canceled')n.textContent=notice}};syn.speak(u);
      }};window.addEventListener('pagehide',()=>syn?.cancel());</script></html>''',height=78)

def instruction(action):
    kind, key, _ = action
    if S.lang=='ko' and kind in ('open','tap','look'):
        verb={'open':'열어요','tap':'눌러요','look':'확인해요'}[kind]
        noun=w(key)
        has_final='가'<=noun[-1]<='힣' and (ord(noun[-1])-ord('가'))%28
        return f'「{noun}」{"을" if has_final else "를"} {verb}.'
    return w(kind).format(x=w(key))

def launch(key,go):
    S.sim_key=key
    S.sim_at=0
    S.sim_retry=False
    S.sim_selected=False
    S.sim_copied=False
    S.sim_pasted=False
    S.sim_digits=''
    go('sim')

def topic(key,go):
    flow=FLOWS[key]
    steps=S.setdefault('guide_steps',{})
    i=steps.get(key,0)
    i=min(max(0,i),len(flow)-1) if type(i) is int else 0
    S.guide_recent=key
    st.title(w(key))
    if key=='copy': st.caption(w('copy_def'))
    if key=='verify': st.caption(w('verify_safe'))
    if key in ('wifi','font'):
        device=S.get('guide_device_value','Galaxy')
        paths={'wifi':{'Galaxy':w('settings')+' › '+w('wifi'),'iPhone':w('settings')+' › Wi-Fi'},'font':{'Galaxy':w('settings')+' › '+w('font'),'iPhone':w('settings')+' › '+w('font')}}
        st.caption(device+': '+paths[key][device])
    st.progress((i+1)/len(flow),text=f'{w("step")} {i+1} / {len(flow)}')
    text=instruction(flow[i])
    st.markdown(f'<section class="guide-step"><span aria-hidden="true">{flow[i][2]}</span><h2>{escape(text)}</h2></section>',unsafe_allow_html=True)
    voice(text)
    a,b=st.columns(2)
    if a.button('‹ '+w('previous'),disabled=i==0,key='guide_prev',use_container_width=True):
        steps[key]=i-1;st.rerun()
    if b.button(w('finish' if i==len(flow)-1 else 'next')+' ›',key='guide_next',type='primary',use_container_width=True):
        if i==len(flow)-1:
            S.setdefault('guide_completed',{})[key]=datetime.now(timezone.utc).isoformat();S.guide_toast=True;go('resume')
        steps[key]=i+1;st.rerun()
    stars=S.setdefault('guide_stars',[])
    if st.button(('★ ' if key in stars else '☆ ')+w('favorites'),key='topic_star'):
        if key in stars:stars.remove(key)
        else:stars.append(key)
        st.rerun()
    if key!='safe' and st.button('📱 '+w('practice'),key='topic_sim'):launch(key,go)
    with st.expander(w('quiz')):
        q=min(1,len(flow)-1)
        st.write(f'{flow[q][2]}  {w("result")}')
        st.caption(instruction(flow[q]))
        options=[flow[q][1], 'hang' if flow[q][1]!='hang' else 'sample_msg']
        if len(key)%2:options.reverse()
        for option in options:
            if st.button(w(option),key='guide_quiz_'+key+'_'+option):
                if option==flow[q][1]:st.success(w('done'))
                else:st.info(w('retry'))

def dial_code():
    values=S.get('sim_digits','')
    st.markdown(f'<div class="guide-demo-value">{escape(values or "— — — — — —")}</div>',unsafe_allow_html=True)
    for row in (('1','2','3'),('4','5','6'),('7','8','9'),('⌫','0','✓')):
        for col,char in zip(st.columns(3),row):
            if col.button(char,key='sim_digit_'+char,use_container_width=True):
                if char=='✓':
                    if values==DEMO_CODE:S.sim_at+=1;S.sim_digits='';S.sim_retry=False
                    else:S.sim_retry=True;S.sim_digits=''
                elif char=='⌫': S.sim_digits=values[:-1]
                elif len(values)<6:S.sim_digits=values+char
                st.rerun()

def sim(go):
    st.title('📱 '+w('sim'))
    st.caption(w('demo'))
    mode=st.segmented_control(w('sim'),['free','mission','review'],format_func=w,default='free',label_visibility='collapsed',key='sim_mode') or 'free'
    key=S.get('sim_key')
    i=S.get('sim_at',0)
    flow=FLOWS.get(key,[])
    if flow and i<len(flow):
        text=instruction(flow[i]);st.progress((i+1)/len(flow),text=f'{w("step")} {i+1} / {len(flow)}')
        if mode!='free' or S.get('sim_retry'):st.info(text)
        else:st.write(text)
        voice(text)
    with st.container(key='guide_phone'):
        st.markdown('<div class="guide-phone-status"><span>9:41</span><span aria-hidden="true">▮▮▮ &nbsp;◓ &nbsp;▰</span></div>',unsafe_allow_html=True)
        if not key:
            st.subheader(w('sim'))
            st.caption(w('free_hint'))
            options=APP_KEYS if mode!='review' else tuple(S.get('guide_practiced',[]))
            if not options:st.info(w('empty'))
            for index in range(0,len(options),2):
                for col,app in zip(st.columns(2),options[index:index+2]):
                    glyph=FLOWS.get(app,[('','','🕒')])[0][2]
                    if col.button(glyph+' '+w(app),key='sim_app_'+app,use_container_width=True):launch(app,go)
        elif key=='clock':
            st.subheader('🕒 '+w('clock'));st.metric(w('clock'),'09:41')
        elif i>=len(flow):
            completed=S.setdefault('guide_practiced',[])
            if key not in completed:completed.append(key)
            st.success('✓ '+w('done'))
            if st.button('↻ '+w('practice'),key='sim_repeat'):launch(key,go)
        else:
            _,action,glyph=flow[i]
            st.subheader((('💬 '+w('sms')) if key=='verify' and i in (2,3) else (glyph+' '+w(key))))
            if S.get('sim_retry'):st.warning(w('retry'))
            if key=='verify' and i in (2,3):st.markdown(f'<div class="guide-demo-value">{DEMO_CODE}</div>',unsafe_allow_html=True)
            if key=='verify' and action=='code_input':dial_code()
            else:
                if key=='copy' and i==0:
                    # Native text selection, including touch long-press; simulated clipboard stays inside the app.
                    st.markdown('<div class="guide-demo-value guide-select-text">5837</div>',unsafe_allow_html=True)
                if key=='copy' and i>=2:
                    st.markdown('<div class="guide-demo-value">'+('5837' if S.get('sim_pasted') else '▭')+'</div>',unsafe_allow_html=True)
                if key=='gallery' and i==3:st.image(str(__import__('pathlib').Path(__file__).parent/'assets'/'guide.svg'),width=200)
                if action=='show':st.markdown('<div class="guide-demo-value">••••••••</div>',unsafe_allow_html=True)
                if key=='login' and i==3:st.markdown('<div class="guide-demo-value">Sample#1</div>',unsafe_allow_html=True)
                if action=='sample_id':st.caption('practice-user')
                if action=='sample_num':st.caption('000-0000-0000')
                if st.button(w(action),key=f'sim_step_{key}_{i}',type='primary',use_container_width=True):
                    if key=='copy' and action=='copy_action':S.sim_copied=True
                    if key=='copy' and action=='paste':S.sim_pasted=S.get('sim_copied',False)
                    S.sim_at=i+1;S.sim_retry=False;st.rerun()
                alternate='settings' if action!='settings' else 'clock'
                if st.button(w(alternate),key=f'sim_other_{key}_{i}',use_container_width=True):S.sim_retry=True;st.rerun()
        if key and st.button('⌂ '+w('home'),key='sim_phone_home',use_container_width=True):
            S.sim_key=None;S.sim_digits='';st.rerun()

def prefs(go):
    st.title(w('settings'))
    current=st.query_params.get('size','normal')
    if current not in ('normal','large','xl'):current='normal'
    size=st.radio(w('font'),['normal','large','xl'],index=['normal','large','xl'].index(current),format_func=w,horizontal=True)
    if size!=current:
        S.guide_font=size;st.query_params['size']=size;st.rerun()
    S.guide_device_value=st.selectbox(w('device'),['Galaxy','iPhone'],index=int(S.get('guide_device_value')=='iPhone'),key='guide_device')
    S.guide_voice_value=st.toggle(w('voice'),value=S.get('guide_voice_value',True),key='guide_voice')
    speeds=[.75,.9,1.0]
    speed=S.get('guide_speed_value',.9)
    S.guide_speed_value=st.radio(w('speed'),speeds,index=speeds.index(speed) if speed in speeds else 1,key='guide_speed',horizontal=True)
    if st.button(w('legacy')):go('settings')

def render(page,go):
    if st.button('‹ '+w('home'),key='guide_back'):go('home')
    if page not in ('family','help','prefs'):
        if st.button('♡ '+w('help'),key='guide_help_everywhere'):go('help')
    if page in ('family','help'):
        from guide_family import render as family
        family(page,go)
    elif page=='prefs':prefs(go)
    elif page=='sim':sim(go)
    elif page=='safe':
        topic('safe',go)
        with st.expander(w('contacts_kr')):
            st.caption(w('independent'))
            st.link_button(w('police')+' · 112','https://www.fsc.go.kr/no040102?cnId=913&curPage=1')
            st.link_button(w('fss')+' · 1332','https://www.fss.or.kr/fss/main/contents.do?menuNo=201178')
    elif page=='fix':
        from guide_fix import render as troubleshoot
        troubleshoot(go)
    elif page=='topic':topic(S.get('guide_topic','calls'),go)
    elif page in ('catalog','favorites','resume'):
        st.title(w(page))
        if S.pop('guide_toast',False):st.success(w('done'))
        if page=='catalog':keys=tuple(k for k in FLOWS if k!='safe')
        elif page=='favorites':keys=S.get('guide_stars',[])
        else:
            keys=list(dict.fromkeys([S.get('guide_recent')]+list(S.get('guide_completed',{}))))
            keys=[k for k in keys if k in FLOWS]
        if not keys:st.info(w('empty'))
        for key in keys:
            status='✓ ' if key in S.get('guide_completed',{}) else ''
            if st.button(status+w(key),key=page+'_'+key,use_container_width=True):start(key,go)
        if page in ('catalog','resume') and st.button(w('legacy'),key=page+'_legacy'):go({'catalog':'learn','resume':'record'}[page])
