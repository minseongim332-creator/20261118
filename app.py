import streamlit as st
import sqlite3
import hashlib
import secrets
from pathlib import Path
from functools import lru_cache

# ------------------------------------------------------------
# 앱잘알 - Streamlit starter project
# 한국어 원문 + Google 번역 기반 다국어 UI
# ------------------------------------------------------------

st.set_page_config(
    page_title="앱잘알 | 스마트폰 배우기",
    page_icon="📱",
    layout="wide",
    initial_sidebar_state="collapsed",
)

DB_PATH = Path("appjalal.db")

LANGUAGES = {
    "한국어": "ko", "English": "en", "日本語": "ja", "中文(简体)": "zh-CN",
    "中文(繁體)": "zh-TW", "Español": "es", "Français": "fr", "Deutsch": "de",
    "Italiano": "it", "Português": "pt", "Русский": "ru", "العربية": "ar",
    "हिन्दी": "hi", "বাংলা": "bn", "اردو": "ur", "Tiếng Việt": "vi",
    "ไทย": "th", "Bahasa Indonesia": "id", "Bahasa Melayu": "ms",
    "Filipino": "tl", "မြန်မာ": "my", "नेपाली": "ne", "සිංහල": "si",
    "தமிழ்": "ta", "తెలుగు": "te", "ಕನ್ನಡ": "kn", "മലയാളം": "ml",
    "ગુજરાતી": "gu", "ਪੰਜਾਬੀ": "pa", "فارسی": "fa", "Türkçe": "tr",
    "Nederlands": "nl", "Polski": "pl", "Українська": "uk", "Ελληνικά": "el",
    "עברית": "iw", "Svenska": "sv", "Norsk": "no", "Dansk": "da",
    "Suomi": "fi", "Čeština": "cs", "Slovenčina": "sk", "Magyar": "hu",
    "Română": "ro", "Български": "bg", "Hrvatski": "hr", "Српски": "sr",
    "বাংলা (ভারত)": "bn", "Afrikaans": "af", "Swahili": "sw"
}

TEXTS = {
    "tagline": "스마트폰 배우기 · 가족과 소통하기",
    "welcome": "모르는 게 생겼나요?",
    "welcome_sub": "앱잘알에게 물어보세요.",
    "welcome_desc": "어려운 스마트폰 사용법도 하나씩 함께 해결해요.",
    "search_placeholder": "궁금한 스마트폰 기능을 검색해 보세요.",
    "what_help": "무엇을 도와드릴까요?",
    "learn_step": "따라 하며 배우기",
    "learn_step_desc": "화면을 보며 한 단계씩 천천히 배워요.",
    "ask_photo": "사진으로 물어보기",
    "ask_photo_desc": "화면을 찍어 올리면 무엇을 눌러야 할지 알려드려요.",
    "categories": "무엇을 배우고 싶으세요?",
    "basic": "스마트폰 기본",
    "message": "문자·카카오톡",
    "call": "전화·연락처",
    "photo": "사진·동영상",
    "internet": "인터넷·검색",
    "map": "지도·교통",
    "life": "생활 편의",
    "safety": "금융·보안",
    "my_progress": "나의 학습 현황",
    "continue": "이어서 배우기",
    "start": "배우기 시작",
    "practice": "직접 연습하기",
    "quiz": "확인 퀴즈",
    "back": "뒤로",
    "next": "다음 단계",
    "complete": "학습 완료",
    "completed": "배우기를 완료했어요!",
    "home": "홈",
    "learn": "배우기",
    "my_page": "내 정보",
    "menu": "메뉴",
    "language": "사용할 언어",
    "login": "로그인",
    "logout": "로그아웃",
    "signup": "회원가입",
    "username": "아이디",
    "password": "비밀번호",
    "login_required": "로그인하면 학습 기록을 저장할 수 있어요.",
    "login_success": "로그인되었습니다.",
    "signup_success": "회원가입이 완료되었습니다. 로그인해 주세요.",
    "wrong_login": "아이디 또는 비밀번호를 확인해 주세요.",
    "user_exists": "이미 사용 중인 아이디입니다.",
    "empty_fields": "아이디와 비밀번호를 모두 입력해 주세요.",
    "question": "궁금한 내용을 적어 주세요.",
    "send": "질문하기",
    "answer_notice": "질문 도우미는 현재 기본 안내 기능입니다. 실제 AI 답변을 연결하려면 AI API 설정이 필요합니다.",
    "no_result": "검색 결과가 없어요. 다른 단어로 검색해 보세요.",
    "choose_category": "배우고 싶은 항목을 선택해 주세요.",
    "step": "단계",
    "step_1": "문자 앱을 찾아보세요.",
    "step_2": "새 메시지 작성 버튼을 눌러보세요.",
    "step_3": "받는 사람의 이름이나 전화번호를 입력해 보세요.",
    "step_4": "전달할 내용을 작성해 보세요.",
    "step_5": "내용을 확인한 뒤 보내기 버튼을 눌러보세요.",
    "tip": "천천히 따라 해도 괜찮아요. 이전 단계로 돌아갈 수 있어요.",
    "profile": "내 학습 기록",
    "progress": "완료한 학습",
    "privacy": "이 앱은 연습용 예시를 제공합니다. 실제 금융 거래나 문자 발송은 하지 않습니다.",
}

LESSONS = {
    "문자 보내기": ["문자 앱을 찾아보세요.", "새 메시지 작성 버튼을 눌러보세요.", "받는 사람의 이름이나 전화번호를 입력해 보세요.", "전달할 내용을 작성해 보세요.", "내용을 확인한 뒤 보내기 버튼을 눌러보세요."],
    "사진 보내기": ["사진 또는 갤러리 앱을 열어보세요.", "보내고 싶은 사진을 선택해 보세요.", "공유 버튼을 눌러보세요.", "문자나 카카오톡을 선택해 보세요.", "받는 사람을 확인하고 전송 버튼을 눌러보세요."],
    "전화 걸기": ["전화 앱을 열어보세요.", "연락처에서 통화할 사람을 찾아보세요.", "이름을 누르면 상세 정보가 보여요.", "초록색 전화 버튼을 눌러보세요.", "통화가 끝나면 종료 버튼을 눌러보세요."],
    "와이파이 연결": ["설정 앱을 열어보세요.", "Wi-Fi 또는 무선 인터넷 메뉴를 선택하세요.", "사용 가능한 네트워크 목록을 확인하세요.", "연결할 와이파이 이름을 누르세요.", "필요하면 비밀번호를 입력하고 연결을 누르세요."],
    "지도에서 길 찾기": ["지도 앱을 열어보세요.", "검색창에 가고 싶은 장소를 입력하세요.", "검색 결과에서 목적지를 선택하세요.", "길찾기 버튼을 누르세요.", "이동 방법을 선택하고 안내를 확인하세요."],
    "카카오톡 친구에게 메시지 보내기": ["카카오톡을 열어보세요.", "친구 목록에서 대화할 사람을 선택하세요.", "아래쪽 입력창을 눌러보세요.", "전달할 내용을 입력하세요.", "전송 버튼을 눌러 메시지를 보내세요."],
    "스미싱 문자 구별하기": ["모르는 사람이 보낸 문자인지 확인하세요.", "급하게 누르라고 재촉하는 문구가 있는지 살펴보세요.", "출처가 불분명한 인터넷 주소는 누르지 마세요.", "기관이나 은행을 사칭한다면 공식 대표번호로 직접 확인하세요.", "의심스러운 문자는 삭제하거나 주변에 도움을 요청하세요."],
}

CATEGORY_ITEMS = {
    "스마트폰 기본": ["와이파이 연결", "화면 글자 크게 보기", "블루투스 켜고 끄기"],
    "문자·카카오톡": ["문자 보내기", "사진 보내기", "카카오톡 친구에게 메시지 보내기"],
    "전화·연락처": ["전화 걸기", "연락처 저장하기"],
    "사진·동영상": ["사진 촬영하기", "사진 보내기"],
    "인터넷·검색": ["인터넷에서 정보 검색하기"],
    "지도·교통": ["지도에서 길 찾기"],
    "생활 편의": ["QR코드 사용하기", "병원 예약 알아보기"],
    "금융·보안": ["스미싱 문자 구별하기", "안전한 모바일 금융 이용하기"],
}

# CSS: 디자인 변수와 컴포넌트를 한곳에서 관리
st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=Gowun+Dodum&family=Pretendard:wght@400;500;600;700;800&display=swap');
:root {
  --blue: #477DAF;
  --blue-dark: #263E59;
  --blue-soft: #EAF2F8;
  --cream: #F7F2E9;
  --yellow: #F1D58A;
  --ink: #26384B;
  --muted: #718092;
  --line: #E8E9EC;
}
html, body, [class*="css"] { font-family: 'Pretendard','Gowun Dodum',sans-serif; color:var(--ink); }
.stApp { background: #FCFCFB; }
.block-container { max-width: 1120px; padding-top: 1.5rem; padding-bottom: 3rem; }
h1,h2,h3 { color:var(--blue-dark); letter-spacing:-0.04em; }
div[data-testid="stButton"] > button {
  border-radius: 16px; border: 1px solid #DCE5EC; min-height: 3rem;
  font-weight: 650; color: var(--blue-dark); background: white;
  transition: all .15s ease;
}
div[data-testid="stButton"] > button:hover {
  border-color: var(--blue); color: var(--blue); background: var(--blue-soft);
}
div[data-testid="stTextInput"] input, div[data-testid="stSelectbox"] div[data-baseweb="select"] > div {
  border-radius: 14px; min-height: 48px;
}
.hero {
  background: var(--cream); border-radius: 28px; padding: 30px 32px;
  border: 1px solid #F0E9DE; margin-bottom: 22px;
}
.hero-kicker { color:var(--blue); font-weight:700; font-size:.92rem; margin-bottom:8px; }
.hero-title { color:var(--blue-dark); font-size:2rem; font-weight:800; line-height:1.35; letter-spacing:-.05em; }
.hero-sub { color:#647386; font-size:1.05rem; margin-top:8px; line-height:1.6; }
.soft-card {
  background:white; border:1px solid var(--line); border-radius:22px;
  padding:20px; min-height:150px; box-shadow:0 5px 18px rgba(40,60,80,.035);
}
.soft-card h3 { margin:0 0 8px 0; font-size:1.15rem; }
.soft-card p { color:var(--muted); margin:0; line-height:1.55; }
.pill { display:inline-block; padding:6px 12px; background:var(--blue-soft); color:var(--blue-dark); border-radius:99px; font-size:.85rem; font-weight:650; }
.small-muted { color:var(--muted); font-size:.92rem; }
.step-box { background:#F5F8FB; border:1px solid #E4EDF4; border-radius:22px; padding:24px; }
.logo-mark { background:#EAF2F8; border-radius:20px; width:58px; height:58px; display:flex; align-items:center; justify-content:center; font-size:30px; }
hr { border-color:#E9EDF0; }
</style>
""", unsafe_allow_html=True)


def db():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.execute("""CREATE TABLE IF NOT EXISTS users (
        username TEXT PRIMARY KEY, password_hash TEXT NOT NULL, salt TEXT NOT NULL
    )""")
    conn.execute("""CREATE TABLE IF NOT EXISTS progress (
        username TEXT NOT NULL, lesson TEXT NOT NULL,
        PRIMARY KEY(username, lesson)
    )""")
    conn.commit()
    return conn


def hash_password(password, salt):
    return hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 180000).hex()


def register(username, password):
    conn = db()
    salt = secrets.token_hex(16)
    try:
        conn.execute("INSERT INTO users VALUES (?, ?, ?)", (username, hash_password(password, salt), salt))
        conn.commit()
        return True
    except sqlite3.IntegrityError:
        return False
    finally:
        conn.close()


def authenticate(username, password):
    conn = db()
    row = conn.execute("SELECT password_hash, salt FROM users WHERE username=?", (username,)).fetchone()
    conn.close()
    return bool(row and secrets.compare_digest(row[0], hash_password(password, row[1])))


def save_progress(username, lesson):
    conn = db()
    conn.execute("INSERT OR IGNORE INTO progress VALUES (?, ?)", (username, lesson))
    conn.commit()
    conn.close()


def get_progress(username):
    conn = db()
    rows = conn.execute("SELECT lesson FROM progress WHERE username=?", (username,)).fetchall()
    conn.close()
    return [r[0] for r in rows]


@lru_cache(maxsize=4096)
def translate_text(text, target):
    if target == "ko":
        return text
    try:
        from deep_translator import GoogleTranslator
        return GoogleTranslator(source="ko", target=target).translate(text) or text
    except Exception:
        return text


def t(key):
    """누락된 번역 키가 있어도 KeyError로 앱이 중단되지 않도록 처리."""
    raw = TEXTS.get(key, key)
    target = st.session_state.get("lang_code", "ko")
    if target == "ko":
        return raw
    return translate_text(raw, target)


def tx(raw):
    """동적 한국어 문장/학습 문구 번역."""
    target = st.session_state.get("lang_code", "ko")
    return raw if target == "ko" else translate_text(raw, target)


def header():
    c1, c2 = st.columns([1, 3])
    with c1:
        st.markdown('<div class="logo-mark">📱</div>', unsafe_allow_html=True)
    with c2:
        st.markdown("### 앱잘알")
        st.caption(t("tagline"))


if "lang_name" not in st.session_state:
    st.session_state.lang_name = "한국어"
if "lang_code" not in st.session_state:
    st.session_state.lang_code = "ko"
if "page" not in st.session_state:
    st.session_state.page = "home"
if "user" not in st.session_state:
    st.session_state.user = None
if "lesson" not in st.session_state:
    st.session_state.lesson = None
if "step_index" not in st.session_state:
    st.session_state.step_index = 0

header()

# 상단 언어 설정은 모든 화면에서 유지
lang_col, menu_col = st.columns([3, 1])
with lang_col:
    selected_lang = st.selectbox(
        t("language"), list(LANGUAGES.keys()),
        index=list(LANGUAGES.keys()).index(st.session_state.lang_name),
        key="language_selector"
    )
    if selected_lang != st.session_state.lang_name:
        st.session_state.lang_name = selected_lang
        st.session_state.lang_code = LANGUAGES[selected_lang]
        st.rerun()
with menu_col:
    st.write("")
    with st.popover("☰ " + t("menu"), use_container_width=True):
        if st.session_state.user:
            st.write(f"👤 {st.session_state.user}")
            if st.button(t("logout"), use_container_width=True):
                st.session_state.user = None
                st.rerun()
        else:
            if st.button(t("login"), use_container_width=True):
                st.session_state.page = "auth"
                st.rerun()
        if st.button(t("home"), use_container_width=True):
            st.session_state.page = "home"
            st.rerun()
        if st.button(t("learn"), use_container_width=True):
            st.session_state.page = "learn"
            st.rerun()
        if st.button(t("my_page"), use_container_width=True):
            st.session_state.page = "mypage"
            st.rerun()

st.divider()

# ---------------- HOME ----------------
if st.session_state.page == "home":
    st.markdown(f"""
    <div class="hero">
      <div class="hero-kicker">📱 APPJALAL</div>
      <div class="hero-title">{t('welcome')}<br>{t('welcome_sub')}</div>
      <div class="hero-sub">{t('welcome_desc')}</div>
    </div>
    """, unsafe_allow_html=True)

    query = st.text_input("🔎 " + t("search_placeholder"), label_visibility="collapsed")
    if query:
        matches = []
        for cat, items in CATEGORY_ITEMS.items():
            for item in items:
                if query.lower() in item.lower() or query.lower() in cat.lower():
                    matches.append(item)
        st.markdown("#### " + t("categories"))
        if matches:
            for item in sorted(set(matches)):
                if st.button("📘 " + tx(item), key="search_" + item, use_container_width=True):
                    st.session_state.lesson = item
                    st.session_state.step_index = 0
                    st.session_state.page = "lesson"
                    st.rerun()
        else:
            st.info(t("no_result"))

    st.markdown("## " + t("what_help"))
    col1, col2 = st.columns(2)
    with col1:
        st.markdown('<div class="soft-card"><h3>📖 따라 하며 배우기</h3><p>화면을 보며 한 단계씩 천천히 배워요.</p></div>', unsafe_allow_html=True)
        if st.button("📖 " + t("learn_step"), use_container_width=True):
            st.session_state.page = "learn"
            st.rerun()
    with col2:
        st.markdown('<div class="soft-card"><h3>💬 궁금한 걸 물어보기</h3><p>어려운 기능을 쉬운 말로 질문해 보세요.</p></div>', unsafe_allow_html=True)
        if st.button("💬 " + t("ask_photo"), use_container_width=True):
            st.session_state.page = "ask"
            st.rerun()

    st.markdown("## " + t("categories"))
    cols = st.columns(4)
    for i, (cat, items) in enumerate(CATEGORY_ITEMS.items()):
        with cols[i % 4]:
            st.markdown(f'<div class="soft-card"><h3>{tx(cat)}</h3><p>{len(items)}개 배우기</p></div>', unsafe_allow_html=True)
            if st.button(tx(cat), key=f"cat_{i}", use_container_width=True):
                st.session_state.selected_category = cat
                st.session_state.page = "learn"
                st.rerun()

    if st.session_state.user:
        done = get_progress(st.session_state.user)
        st.markdown("## " + t("my_progress"))
        st.progress(min(len(done) / max(len(LESSONS), 1), 1.0))
        st.caption(f"{len(done)} / {len(LESSONS)}")

# ---------------- LEARN ----------------
elif st.session_state.page == "learn":
    st.title("📚 " + t("learn"))
    st.write(t("choose_category"))
    chosen_cat = st.session_state.get("selected_category")
    for cat, items in CATEGORY_ITEMS.items():
        with st.expander("📂 " + tx(cat), expanded=(chosen_cat == cat)):
            for item in items:
                if st.button("▶ " + tx(item), key="lesson_" + item, use_container_width=True):
                    st.session_state.lesson = item
                    st.session_state.step_index = 0
                    st.session_state.page = "lesson"
                    st.rerun()
    if st.button("← " + t("home")):
        st.session_state.page = "home"
        st.rerun()

# ---------------- LESSON DETAIL ----------------
elif st.session_state.page == "lesson":
    lesson = st.session_state.lesson or "문자 보내기"
    steps = LESSONS.get(lesson, [
        f"{lesson} 기능을 사용할 앱을 찾아보세요.",
        "화면에 보이는 안내를 천천히 읽어보세요.",
        "원하는 메뉴를 선택해 보세요.",
        "화면의 안내에 따라 필요한 내용을 입력하세요.",
        "마지막으로 입력한 내용을 확인하세요."
    ])
    idx = st.session_state.step_index
    st.title("📖 " + tx(lesson))
    st.caption(f"{t('step')} {idx+1} / {len(steps)}")
    st.progress((idx + 1) / len(steps))
    st.markdown(f'<div class="step-box"><div class="pill">{t("step")} {idx+1}</div><h2 style="margin-top:18px">{tx(steps[idx])}</h2><p class="small-muted">{t("tip")}</p></div>', unsafe_allow_html=True)
    left, right = st.columns(2)
    with left:
        if st.button("← " + t("back"), disabled=(idx == 0), use_container_width=True):
            st.session_state.step_index -= 1
            st.rerun()
    with right:
        if idx < len(steps) - 1:
            if st.button(t("next") + " →", type="primary", use_container_width=True):
                st.session_state.step_index += 1
                st.rerun()
        else:
            if st.button("✓ " + t("complete"), type="primary", use_container_width=True):
                if st.session_state.user:
                    save_progress(st.session_state.user, lesson)
                st.success(t("completed"))
                st.session_state.page = "learn"
                st.rerun()
    if st.button("목록으로 돌아가기"):
        st.session_state.page = "learn"
        st.rerun()

# ---------------- ASK ----------------
elif st.session_state.page == "ask":
    st.title("💬 " + t("ask_photo"))
    st.write(t("answer_notice"))
    question = st.text_area(t("question"), placeholder="예: 사진을 문자로 보내고 싶어요.")
    photo = st.file_uploader("화면 사진 첨부하기 (선택)", type=["png", "jpg", "jpeg"])
    if st.button(t("send"), type="primary"):
        if question.strip():
            # AI API를 아직 연결하지 않은 안전한 기본 응답
            st.info("질문을 확인했어요. 현재 버전에서는 자주 묻는 질문과 학습 메뉴를 안내합니다.")
            st.write("관련 학습: 문자 보내기, 사진 보내기, 카카오톡 친구에게 메시지 보내기")
        else:
            st.warning(t("question"))
    if st.button("← " + t("home")):
        st.session_state.page = "home"
        st.rerun()

# ---------------- AUTH ----------------
elif st.session_state.page == "auth":
    st.title("👤 " + t("login") + " / " + t("signup"))
    st.caption(t("login_required"))
    tab1, tab2 = st.tabs([t("login"), t("signup")])
    with tab1:
        u = st.text_input(t("username"), key="login_user")
        p = st.text_input(t("password"), type="password", key="login_pass")
        if st.button(t("login"), type="primary", key="login_btn"):
            if authenticate(u.strip(), p):
                st.session_state.user = u.strip()
                st.success(t("login_success"))
                st.session_state.page = "home"
                st.rerun()
            else:
                st.error(t("wrong_login"))
    with tab2:
        nu = st.text_input(t("username"), key="new_user")
        np = st.text_input(t("password"), type="password", key="new_pass")
        if st.button(t("signup"), type="primary", key="signup_btn"):
            if not nu.strip() or not np:
                st.warning(t("empty_fields"))
            elif len(np) < 8:
                st.warning("비밀번호는 8자 이상으로 입력해 주세요.")
            elif register(nu.strip(), np):
                st.success(t("signup_success"))
            else:
                st.error(t("user_exists"))
    if st.button("← " + t("home")):
        st.session_state.page = "home"
        st.rerun()

# ---------------- MY PAGE ----------------
elif st.session_state.page == "mypage":
    st.title("👤 " + t("my_page"))
    if not st.session_state.user:
        st.info(t("login_required"))
        if st.button(t("login")):
            st.session_state.page = "auth"
            st.rerun()
    else:
        st.write(f"{t('username')}: **{st.session_state.user}**")
        done = get_progress(st.session_state.user)
        st.metric(t("progress"), f"{len(done)} / {len(LESSONS)}")
        for item in done:
            st.write("✓ " + tx(item))
        if st.button(t("logout")):
            st.session_state.user = None
            st.rerun()

st.divider()
st.caption(t("privacy"))
