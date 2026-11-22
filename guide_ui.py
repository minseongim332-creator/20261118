"""Home, shared navigation and presentation for the Streamlit guide."""
from html import escape
from pathlib import Path
import streamlit as st
from guide_words import WORDS, LANGS

ROOT = Path(__file__).parent
LOGO = (ROOT/'assets/logo.svg').read_text()
ART = (ROOT/'assets/guide.svg').read_text()
CARDS = [
    ('calls','phone','sage'), ('family','chat','blue'), ('gallery','camera','peach'), ('internet','globe','mint'),
    ('login','lock','yellow'), ('signup','person','lilac'), ('verify','code','blue'), ('copy','copy','sage'),
    ('sim','mobile','sage'), ('help','heart','yellow'),
]
PATHS = {
    'phone':'M5 4h4l2 5-3 2c1 3 2 4 5 5l2-3 5 2v4c0 1-1 2-2 2C10 20 4 14 3 6c0-1 1-2 2-2Z',
    'chat':'M4 5h16v12H9l-5 4V5Zm4 5h8m-8 3h5',
    'camera':'M3 7h4l2-3h6l2 3h4v13H3V7Zm13 6a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
    'globe':'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0ZM2 12h20M12 2a17 17 0 0 1 0 20m0-20a17 17 0 0 0 0 20',
    'lock':'M5 10h14v11H5V10Zm3 0V7a4 4 0 1 1 8 0v3m-4 5v2',
    'person':'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM5 21v-2a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v2M2 11h4m-2-2v4',
    'code':'M4 4h16v16H4V4Zm6 4-1 8m6-8-1 8m-7-5h10m-11 2h10',
    'copy':'M9 8h11v13H9V8Zm6-3V3H4v13h2',
    'mobile':'M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm3 4h4m-3 12h2',
    'heart':'M12 21 4 13a5 5 0 0 1 8-6 5 5 0 0 1 8 6l-8 8Z',
    'book':'M3 4h5a4 4 0 0 1 4 4v13a6 6 0 0 0-5-3H3V4Zm18 0h-5a4 4 0 0 0-4 4v13a6 6 0 0 1 5-3h4V4Z',
    'star':'m12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1 3-6Z',
    'shield':'M12 2 4 6v6c0 4 3 8 8 10 5-2 8-6 8-10V6l-8-4Zm-4 10 3 3 5-5',
}


def icon(name, size=24):
    return f'<svg aria-hidden="true" width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="{PATHS[name]}"/></svg>'


def w(key):
    row = WORDS.get(key)
    if not row:
        return key
    lang = st.session_state.get('lang', 'ko')
    return row[LANGS.index(lang)] if lang in LANGS else row[1]


def skin():
    css = (ROOT/'assets/guide.css').read_text()
    scale = {'normal':'1','large':'1.14','xl':'1.3'}.get(st.session_state.get('guide_font'), '1')
    st.markdown(f'<style>:root{{--guide-scale:{scale}}}{css}</style>', unsafe_allow_html=True)


def home(go, start):
    st.markdown(f'''<section class="guide-hero" aria-labelledby="guide-title"><div>
      <p class="guide-tag"><span></span>{escape(w('tag'))}</p><h1 id="guide-title">{escape(w('hero'))}</h1>
      <p class="guide-lead">{escape(w('lead'))}</p></div><div class="guide-art" aria-hidden="true">{ART}</div></section>''', unsafe_allow_html=True)
    st.markdown(f'<div class="guide-section"><h2>{escape(w("topics"))}</h2><p>{escape(w("pick"))}</p></div>',unsafe_allow_html=True)
    with st.container(key='guide_grid'):
        for key,name,tone in CARDS:
            with st.container(key='guide_card_'+key):
                st.markdown(f'''<div class="guide-card-head"><span class="guide-icon {tone}">{icon(name,27)}</span><span class="guide-arrow" aria-hidden="true">›</span></div><div class="guide-card-title">{escape(w(key))}</div><p class="guide-card-info">{escape(w(key+"_d"))}</p>''',unsafe_allow_html=True)
                if st.button(w(key),key='guide_pick_'+key,use_container_width=True):
                    if key in ('sim','family','help'):go(key)
                    else:start(key)
    with st.container(key='guide_quick'):
        for key,name in [('family','person'),('resume','book'),('favorites','star'),('safe','shield')]:
            with st.container(key='guide_link_'+key):
                st.markdown(f'<div class="guide-quick-text">{icon(name,20)}{escape(w(key))}</div>',unsafe_allow_html=True)
                if st.button(w(key),key='guide_quick_'+key,use_container_width=True):go(key)
    with st.container(key='guide_more'):
        for key in ('catalog','fix'):
            if st.button(w(key),key='guide_more_'+key):go(key)


def header(go, names):
    def change_language():
        st.session_state.lang=st.session_state.guide_language
        st.query_params['lang']=st.session_state.lang

    with st.container(key='guide_header'):
        st.markdown(f'<div class="guide-brand"><span aria-hidden="true">{LOGO}</span><div><strong>{escape(w("brand"))}</strong><small>{escape(w("brand_d"))}</small></div></div>',unsafe_allow_html=True)
        with st.popover('🌐 '+names.get(st.session_state.lang,'한국어')):
            st.selectbox('언어 / Language', list(names), index=list(names).index(st.session_state.lang), format_func=lambda code:names[code]+(' · English UI' if code not in LANGS else ''), key='guide_language',on_change=change_language)
        if st.button('⚙ '+w('settings'),key='guide_header_settings'):
            go('prefs')
        if st.button('♙ '+w('profile'),key='guide_header_profile'):
            go('account')
