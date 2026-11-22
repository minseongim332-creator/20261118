"""Streamlit opening route and authentic step references; no invented artwork."""
from html import escape

import streamlit as st

from guide_words import LANGS
from lesson_assets import FAMILIES, resolve

TEXT = {
    'intro': ('어려웠던 스마트폰 사용법, 이제 하나씩 쉽게 배워보세요.', 'Learn to use your smartphone, one step at a time.', 'Học cách dùng điện thoại thông minh, từng bước một.', 'スマートフォンの使い方を、一つずつ学びましょう。', '一步一步，轻松学习使用智能手机。', 'เรียนรู้การใช้สมาร์ตโฟนทีละขั้น', 'Matutong gumamit ng smartphone, isa-isang hakbang.', 'Ухаалаг утсаа алхам алхмаар ашиглаж сураарай.'),
    'start': ('앱 시작하기', 'Get started', 'Bắt đầu', 'アプリを始める', '开始使用', 'เริ่มใช้งาน', 'Magsimula', 'Эхлэх'),
    'unknown': ('잘 모르겠어요', 'Not sure', 'Không rõ', 'わかりません', '不太确定', 'ไม่แน่ใจ', 'Hindi sigurado', 'Сайн мэдэхгүй'),
    'original': ('제조사 원본 화면 열기', 'Open the original screenshot', 'Mở ảnh chụp màn hình gốc', '元のスクリーンショットを開く', '打开原始截图', 'เปิดภาพหน้าจอต้นฉบับ', 'Buksan ang orihinal na screenshot', 'Дэлгэцийн эх зургийг нээх'),
    'source': ('제조사 공식 안내', 'Official manufacturer guide', 'Hướng dẫn chính thức', 'メーカー公式ガイド', '制造商官方指南', 'คู่มืออย่างเป็นทางการ', 'Opisyal na gabay', 'Үйлдвэрлэгчийн албан ёсны заавар'),
    'missing': ('이 기종의 이 단계에 맞는 원본 화면을 아직 확인하지 못했어요.', 'A matching screenshot for this step and device has not been verified.', 'Chưa xác minh ảnh phù hợp với bước này và thiết bị này.', 'この手順と機種に合う画面は未確認です。', '尚未确认适用于此步骤和机型的截图。', 'ยังไม่ได้ยืนยันภาพหน้าจอสำหรับขั้นตอนและอุปกรณ์นี้', 'Hindi pa nakumpirma ang screenshot para sa hakbang at device na ito.', 'Энэ алхам, төхөөрөмжид тохирох зураг баталгаажаагүй байна.'),
    'link_only': ('앱 안에 표시할 권한이 확인되지 않아 제조사 원본 링크로 제공해요.', 'Permission to embed has not been confirmed. Use the manufacturer’s link.', 'Chưa xác nhận quyền nhúng ảnh. Hãy mở liên kết của nhà sản xuất.', '埋め込みの許可を確認できていません。メーカーのリンクをご利用ください。', '尚未确认嵌入权限，请打开制造商链接。', 'ยังไม่ยืนยันสิทธิ์ในการฝังภาพ โปรดเปิดลิงก์ของผู้ผลิต', 'Hindi pa kumpirmado ang pahintulot na i-embed ang larawan. Buksan ang link ng gumawa.', 'Зургийг оруулах зөвшөөрөл баталгаажаагүй. Үйлдвэрлэгчийн холбоосыг нээнэ үү.'),
}


def label(key):
    lang = st.session_state.get('lang', 'ko')
    return TEXT[key][LANGS.index(lang) if lang in LANGS else 0]


def device_choice(value):
    return 'Samsung Galaxy' if value == 'Galaxy' else 'Apple iPhone' if value == 'iPhone' else label('unknown')


def save_device(device):
    st.session_state.guide_device_value = device
    st.query_params['device'] = device


def opening(go):
    st.title('폰잘알')
    st.write(label('intro'))
    if st.button(label('start'), key='v3_start', type='primary', use_container_width=True):
        go('home' if st.query_params.get('device') in (*FAMILIES, 'Unknown') else 'device_setup')


def setup(go, w):
    st.title(w('device'))
    for device in (*FAMILIES, 'Unknown'):
        if st.button(device_choice(device), key=f'v3_setup_{device}', use_container_width=True):
            save_device(device)
            go('home')
    if st.button(w('previous'), key='v3_setup_back'):
        go('welcome')


def screenshot(device, topic, index):
    asset, source = resolve(device, topic, index)
    if not asset:
        st.caption(label('missing'))
    elif asset['license_status'] != 'verified':
        st.caption(label('link_only'))
    else:
        # The manifest gates inline rendering; no image is downloaded by the app server.
        alt = asset['label'][0 if st.session_state.get('lang') == 'ko' else 1]
        marker = ''
        if target := asset.get('target'):
            x, y, width, height = (100 * v for v in target)
            marker = f'<span aria-hidden="true" style="position:absolute;left:{x}%;top:{y}%;width:{width}%;height:{height}%;border:3px solid #ffd744;outline:2px solid #392e00;pointer-events:none"><b style="position:absolute;bottom:100%;background:#ffd744;color:#201700;padding:0 .3rem">{index+1} ↓</b></span>'
        st.markdown(f'<figure style="position:relative;width:100%;max-width:{min(480, round(496*asset["width"]/asset["height"]))}px;margin:0"><img src="{escape(asset["original_image_url"], quote=True)}" alt="{escape(alt, quote=True)}" referrerpolicy="no-referrer" style="display:block;width:100%;height:auto">{marker}</figure>', unsafe_allow_html=True)
    if asset:
        st.link_button(label('original'), asset['original_image_url'])
    if source:
        st.link_button(f'{label("source")} · {source["publisher"]}', source['page'])
