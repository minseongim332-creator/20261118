"""Non-destructive first checks, with an explicit language fallback."""
from html import escape
import streamlit as st
from guide_ui import w

CHECKS=[
 ('🌐','인터넷이 안 돼요','Internet is not working',['비행기 모드가 켜져 있는지 확인해요. 켜져 있으면 꺼요.','다른 웹 페이지를 하나 열어 봐요.','와이파이가 연결되어 있는지 확인해요.'],['Check Airplane Mode and turn it off if it is on.','Try opening one other website.','Check whether Wi-Fi is connected.']),
 ('📶','와이파이가 연결되지 않아요','Wi-Fi will not connect',['설정에서 와이파이가 켜져 있는지 확인해요.','집에서 쓰던 와이파이 이름을 골라요.','공유기 가까이에서 다시 연결해 봐요.'],['Check that Wi-Fi is on in Settings.','Select your usual home network.','Move closer to your router and try again.']),
 ('🔈','소리가 나지 않아요','There is no sound',['소리가 나야 하는 앱을 열어요.','휴대폰 옆의 소리 높이기 버튼을 한 번 눌러요.','이어폰이 연결되어 있는지 확인해요.'],['Open the app that should play sound.','Press Volume Up on the side of your phone once.','Check whether headphones are connected.']),
 ('☀️','화면이 어두워요','The screen is too dark',['설정에서 화면 또는 디스플레이를 열어요.','밝기 막대를 오른쪽으로 살짝 움직여요.'],['Open Display in Settings.','Move the brightness slider a little to the right.']),
 ('🔠','글자가 작아요','Text is too small',['설정 검색칸에 글자 크기를 찾아요.','글자 크기를 한 단계 높여 봐요.'],['Search Settings for text size.','Increase the text size by one step.']),
 ('🖼️','사진을 찾을 수 없어요','I cannot find a photo',['갤러리 또는 사진 앱을 열어요.','최근 사진에서 촬영 날짜 근처를 찾아봐요.','삭제했을 수도 있다면 최근 삭제된 항목을 열어봐요.'],['Open Gallery or Photos.','Look around the date you took it.','If it may have been deleted, check Recently Deleted.']),
 ('📱','앱이 실행되지 않아요','An app will not open',['앱을 닫고 다시 열어요.','다른 작업을 끝낸 뒤 휴대폰을 다시 켜 봐요.','평소 쓰던 앱 스토어에서 업데이트가 있는지 확인해요.'],['Close the app and open it again.','Finish other work, then restart your phone.','Check for an update in your usual app store.']),
 ('💾','저장 공간이 부족해요','Storage is full',['설정에서 저장 공간을 확인해요.','사진이나 앱을 지우기 전에 가족과 백업을 확인해요.'],['Check Storage in Settings.','Check your backup with family before deleting photos or apps.']),
 ('💬','문자가 오지 않아요','A text did not arrive',['신호가 있는지 화면 위쪽을 확인해요.','메시지 앱의 스팸함을 확인해요.','상대에게 내 번호를 맞게 적었는지 물어봐요.'],['Check signal bars at the top of your screen.','Check the spam folder in Messages.','Ask the sender to check the number.']),
 ('🔢','인증번호가 오지 않아요','The verification code did not arrive',['인증 화면에 적은 번호를 확인해요.','메시지 앱의 스팸함을 확인해요.','잠시 기다린 뒤 재전송 버튼을 한 번 눌러요.'],['Check the number on the verification screen.','Look in the spam folder in Messages.','Wait briefly and request a new code once.']),
 ('🔐','로그인이 되지 않아요','I cannot log in',['아이디의 오타나 빈칸을 확인해요.','비밀번호가 기억나지 않으면 서비스의 공식 비밀번호 찾기를 사용해요.'],['Check the account name for typos or spaces.','If you forgot your password, use the service’s official password reset.']),
 ('🪪','공동인증서가 보이지 않아요','The digital certificate is missing',['인증서가 저장된 기기를 확인해요.','발급한 곳의 공식 안내에서 만료일과 갱신 방법을 확인해요.'],['Check which device contains your certificate.','Use your provider’s official instructions to check expiration and renewal.']),
 ('📋','복사·붙여넣기가 안 돼요','Copy and paste is not working',['글자를 길게 누른 뒤 복사 버튼을 눌러요.','글자를 넣을 수 있는 칸을 길게 눌러 붙여넣기를 골라요.'],['Hold the text, then tap Copy.','Hold a field that accepts text and choose Paste.']),
]

def render(go):
    s=st.session_state
    st.title(w('fix'))
    if s.lang not in ('ko','en'):st.caption('Troubleshooting steps are currently shown in English.')
    pick=s.get('fix_pick')
    if pick is None:
        st.caption(w('problem_choice'))
        for i,(icon,ko,en,_,__) in enumerate(CHECKS):
            if st.button(icon+' '+(ko if s.lang=='ko' else en),key=f'fix_{i}',use_container_width=True):s.fix_pick=i;s.fix_at=0;st.rerun()
        if st.button(w('legacy')):go('assistant')
        return
    icon,ko,en,ks,es=CHECKS[pick];steps=ks if s.lang=='ko' else es;i=s.fix_at
    st.subheader(ko if s.lang=='ko' else en)
    st.progress((i+1)/len(steps),text=f'{w("step")} {i+1}/{len(steps)}')
    st.markdown(f'<section class="guide-step"><span aria-hidden="true">{icon}</span><h2>{escape(steps[i])}</h2></section>',unsafe_allow_html=True)
    from guide_pages import voice
    voice(steps[i], locale='ko' if s.lang=='ko' else 'en')
    a,b,c=st.columns(3)
    if a.button(w('previous')):
        if i:s.fix_at-=1
        else:s.pop('fix_pick',None)
        st.rerun()
    if b.button(w('next'),disabled=i>=len(steps)-1):s.fix_at+=1;st.rerun()
    if c.button(w('fixed'),type='primary'):s.pop('fix_pick',None);go('home')
