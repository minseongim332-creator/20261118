"""사진으로 물어보기: OpenAI 이미지 분석. API 키는 Streamlit Secrets(또는 환경 변수)에서만 읽는다."""
import base64
import io
import logging
import os

import streamlit as st
from PIL import Image, ImageOps, UnidentifiedImageError

log = logging.getLogger("photo_ai")
MODELS = ("gpt-4o", "gpt-4o-mini")
MAX_BYTES = 8 * 1024 * 1024
MAX_PIXELS = 24_000_000

SYSTEM = """너는 폰잘알의 스마트폰 사용 도우미다.
사용자는 스마트폰 사용이 익숙하지 않은 중장년층이다.
업로드된 이미지를 먼저 자세히 확인하고 사용자의 질문에 답변한다.
답변은 다음 순서와 제목으로 작성한다.
1. 사진에서 확인한 내용
2. 지금 화면의 상황
3. 지금 해야 할 행동
4. 눌러야 할 버튼이나 메뉴의 위치
5. 다음 단계
6. 주의할 점
규칙: 어려운 전문 용어를 쓰지 않는다. 한 번에 하나의 행동만 설명한다. 화면을 보면서 그대로 따라 할 수 있게 쓴다.
사진에 없는 버튼이나 메뉴를 지어내지 않는다. 이미지에서 확인할 수 없는 정보는 추측하지 않는다.
사진이 흐리거나 잘렸거나 스마트폰 화면이 아니면 그렇게 말하고 다시 촬영하도록 안내한다.
사용자를 어린아이처럼 대하지 않고 친절하고 차분한 한국어를 쓴다.
비밀번호, 인증번호, 주민등록번호, 계좌·카드 정보가 사진에 보이면 읽어 주지 말고 가려서 다시 올리라고 안내한다.
금융 거래나 인증을 대신 해 주지 않는다."""

ERR = {
    "no_key": "AI 사진 분석 설정이 아직 끝나지 않았어요. 앱 관리자가 OPENAI_API_KEY를 설정해야 사용할 수 있어요.",
    "auth": "AI 서비스 인증에 실패했어요. 앱 관리자가 API 키를 확인해야 해요.",
    "rate": "지금 사용량이 많아 분석할 수 없어요. 잠시 뒤에 다시 시도해 주세요.",
    "net": "인터넷 연결이 불안정해요. 연결을 확인하고 다시 시도해 주세요.",
    "format": "사진을 읽을 수 없어요. JPG 또는 PNG 사진을 사용해 주세요.",
    "size": "사진이 너무 커요. 8MB 이하의 사진을 올려 주세요.",
    "empty": "분석 결과를 받지 못했어요. 다시 시도해 주세요.",
    "unusable": "이 사진은 분석할 수 없어요. 화면이 또렷하게 보이도록 다시 찍어 주세요.",
    "other": "분석 중 문제가 생겼어요. 잠시 뒤에 다시 시도해 주세요.",
}


class PhotoError(Exception):
    def __init__(self, code):
        super().__init__(code)
        self.code = code


def get_key():
    try:
        key = st.secrets["OPENAI_API_KEY"]
    except Exception:
        key = os.environ.get("OPENAI_API_KEY", "")
    key = str(key or "").strip()
    return key or None


def prepare_image(raw):
    """검증 후 JPEG base64로 변환한다. 원본은 저장하지 않는다."""
    if len(raw) > MAX_BYTES:
        raise PhotoError("size")
    try:
        with Image.open(io.BytesIO(raw)) as im:
            if im.width * im.height > MAX_PIXELS:
                raise PhotoError("size")
            im = ImageOps.exif_transpose(im)
            im.thumbnail((1600, 1600))
            if im.mode in ("RGBA", "LA", "P"):
                bg = Image.new("RGB", im.size, "white")
                im = im.convert("RGBA")
                bg.paste(im, mask=im.split()[-1])
                im = bg
            else:
                im = im.convert("RGB")
            out = io.BytesIO()
            im.save(out, format="JPEG", quality=85)
    except PhotoError:
        raise
    except (UnidentifiedImageError, OSError, ValueError):
        raise PhotoError("format")
    return base64.b64encode(out.getvalue()).decode("ascii")


def _client(key):
    from openai import OpenAI
    return OpenAI(api_key=key, timeout=60, max_retries=1)


def ask(history, key, client=None):
    """history: OpenAI 형식 메시지 목록(시스템 제외). (답변, 사용 모델)을 돌려준다."""
    import openai
    client = client or _client(key)
    messages = [{"role": "system", "content": SYSTEM}] + history
    last = None
    for model in MODELS:
        try:
            res = client.chat.completions.create(model=model, messages=messages, max_tokens=900, temperature=0.2)
            text = (res.choices[0].message.content or "").strip() if res.choices else ""
            if not text:
                raise PhotoError("empty")
            return text, model
        except PhotoError:
            raise
        except openai.AuthenticationError as e:
            log.error("auth failed: %s", type(e).__name__)
            raise PhotoError("auth")
        except openai.RateLimitError as e:
            log.error("rate limit: %s", type(e).__name__)
            raise PhotoError("rate")
        except (openai.APIConnectionError, openai.APITimeoutError) as e:
            log.error("network: %s", type(e).__name__)
            raise PhotoError("net")
        except openai.NotFoundError as e:
            log.error("model unavailable %s: %s", model, type(e).__name__)
            last = "other"
            continue
        except openai.PermissionDeniedError as e:
            log.error("model denied %s: %s", model, type(e).__name__)
            last = "other"
            continue
        except openai.BadRequestError as e:
            log.error("bad request: %s", type(e).__name__)
            raise PhotoError("unusable")
        except Exception as e:
            log.error("unexpected: %s", type(e).__name__)
            raise PhotoError("other")
    raise PhotoError(last or "other")


def render(client=None):
    ss = st.session_state
    ss.setdefault("pai_history", [])
    ss.setdefault("pai_model", "")
    ss.setdefault("pai_nonce", 0)
    key = get_key()

    st.subheader("AI에게 사진으로 물어보기")
    st.write("막힌 스마트폰 화면을 찍거나 캡처해서 올리면, AI가 사진에 보이는 내용만 보고 쉬운 말로 알려 드려요.")
    st.warning("비밀번호, 인증번호(OTP), 주민등록번호, 계좌·카드 정보가 보이는 사진은 올리지 마세요. 올린 사진은 분석을 위해 AI 서비스(OpenAI)로 전송되며, 이 앱은 따로 저장하지 않아요.")
    if not key:
        st.info("지금은 AI 사진 분석을 사용할 수 없어요. 이 앱은 사진을 분석하지 않았어요. 대신 아래 '가족에게 사진 보내기'에서 사진과 질문을 남기면 가족이 보고 알려 줄 수 있어요.")
        return
    agreed = st.checkbox("위 내용을 확인했고, 사진에 민감한 정보가 없어요.", key="pai_ok")

    if not ss.pai_history:
        method = st.radio("사진 가져오기", ["사진 선택", "카메라로 찍기"], horizontal=True, key="pai_method")
        n = ss.pai_nonce
        if method == "카메라로 찍기":
            pic = st.camera_input("스마트폰 화면을 찍어 주세요", key=f"pai_cam_{n}")
        else:
            pic = st.file_uploader("사진 선택 (JPG, JPEG, PNG)", type=["jpg", "jpeg", "png"], key=f"pai_file_{n}")
        if pic is not None:
            st.image(pic, caption="선택한 사진", use_container_width=True)
            if st.button("사진 지우고 다시 선택", key="pai_clear"):
                ss.pai_nonce += 1
                st.rerun()
        question = st.text_area("궁금한 점", max_chars=500, placeholder="예: 다음에 어디를 눌러야 해요?", key="pai_q")
        if st.button("AI 분석 시작", type="primary", use_container_width=True, key="pai_go"):
            if not key:
                st.error(ERR["no_key"])
            elif pic is None:
                st.error("먼저 사진을 선택해 주세요.")
            elif not agreed:
                st.error("민감한 정보가 없는지 확인하고 체크해 주세요.")
            else:
                try:
                    data = prepare_image(pic.getvalue())
                    content = [
                        {"type": "text", "text": question.strip() or "이 화면에서 지금 무엇을 해야 하는지 알려 주세요."},
                        {"type": "image_url", "image_url": {"url": "data:image/jpeg;base64," + data, "detail": "high"}},
                    ]
                    history = [{"role": "user", "content": content}]
                    with st.spinner("사진을 살펴보고 있어요. 잠시만 기다려 주세요."):
                        answer, model = ask(history, key, client)
                    ss.pai_history = history + [{"role": "assistant", "content": answer}]
                    ss.pai_model = model
                    st.rerun()
                except PhotoError as e:
                    st.error(ERR[e.code])
        return

    st.success("분석 결과")
    for m in ss.pai_history:
        if m["role"] == "assistant":
            with st.chat_message("assistant"):
                st.markdown(m["content"])
        else:
            text = m["content"] if isinstance(m["content"], str) else m["content"][0]["text"]
            with st.chat_message("user"):
                st.write(text)
    st.caption(f"분석에 사용한 모델: {ss.pai_model}. AI 답변은 틀릴 수 있어요. 중요한 일은 가족과 한 번 더 확인해 주세요.")
    with st.form("pai_follow", clear_on_submit=True):
        follow = st.text_input("추가로 궁금한 점", max_chars=500, key="pai_follow_q")
        sent = st.form_submit_button("추가 질문 보내기", use_container_width=True)
    if sent and follow.strip():
        history = ss.pai_history + [{"role": "user", "content": follow.strip()}]
        try:
            with st.spinner("답을 준비하고 있어요."):
                answer, model = ask(history, key, client)
            ss.pai_history = history + [{"role": "assistant", "content": answer}]
            ss.pai_model = model
            st.rerun()
        except PhotoError as e:
            st.error(ERR[e.code])
    c1, c2 = st.columns(2)
    if c1.button("다시 분석하기", use_container_width=True, key="pai_redo"):
        first = ss.pai_history[0]
        try:
            with st.spinner("다시 살펴보고 있어요."):
                answer, model = ask([first], key, client)
            ss.pai_history = [first, {"role": "assistant", "content": answer}]
            ss.pai_model = model
            st.rerun()
        except PhotoError as e:
            st.error(ERR[e.code])
    if c2.button("새 사진으로 시작", use_container_width=True, key="pai_new"):
        ss.pai_history = []
        ss.pai_nonce += 1
        st.rerun()
