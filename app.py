import streamlit as st
import streamlit.components.v1 as components

SITE = "https://20261118-7dmaxzfnotja7njkkadwsq.baze.cloud/"

st.set_page_config(page_title="폰잘알", page_icon="📱", layout="wide", initial_sidebar_state="collapsed")
st.markdown(
    """
    <style>
    header[data-testid="stHeader"], footer, #MainMenu {display:none !important;}
    .block-container {padding:0 !important; max-width:100% !important;}
    iframe {border:0 !important;}
    </style>
    """,
    unsafe_allow_html=True,
)
components.html(
    f"""
    <iframe src="{SITE}" title="폰잘알"
      allow="display-capture; clipboard-write; clipboard-read; camera; microphone; fullscreen"
      style="width:100%;height:100vh;border:0;display:block"></iframe>
    <p style="font:14px sans-serif;text-align:center;margin:6px">
      화면이 보이지 않으면 <a href="{SITE}" target="_blank" rel="noopener">여기를 눌러 새 창에서 열어 주세요</a>.
    </p>
    """,
    height=1000,
    scrolling=False,
)
