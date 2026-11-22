"""Export current session data without a temporary media-file URL."""
from base64 import b64encode
from html import escape
import json

import streamlit as st
from streamlit.components.v1 import html


def download(label: str, data: bytes, filename: str, mime: str, lang: str = 'ko') -> None:
    # Base64 keeps CSV content out of executable markup and preserves its exact bytes.
    payload = json.dumps([b64encode(data).decode('ascii'), filename, mime]).replace('<', '\\u003c')
    error = ('파일을 내려받지 못했어요. 다시 눌러 주세요.' if lang == 'ko'
             else 'The download did not start. Please try again.')
    frame = f'''<!doctype html><html lang="{escape(lang, quote=True)}">
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>{escape(label)}</title>
<style>
  body {{margin:0;padding:4px;word-break:keep-all;color:#26372b;
    font-family:Pretendard,-apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo","Malgun Gothic","Noto Sans KR",system-ui,sans-serif}}
  button {{width:100%;min-height:46px;padding:7px 12px;border:1px solid #dce5d5;border-radius:12px;
    background:#fffef9;color:inherit;font:inherit;font-weight:600;cursor:pointer;touch-action:manipulation;
    word-break:keep-all;overflow-wrap:anywhere}}
  button:hover {{background:#edf3e7;border-color:#779b62}}
  button:focus-visible {{outline:3px solid #4d6c3e;outline-offset:1px}}
  #status {{margin-top:3px;font-size:.85rem;color:#922d23}}
</style>
<button id="download" type="button">{escape(label)}</button>
<div id="status" role="status" aria-live="polite"></div>
<script>
const [encoded, filename, mime] = {payload};
const button = document.getElementById('download');
const status = document.getElementById('status');
let fileUrl;
button.addEventListener('click', () => {{
  status.textContent = '';
  try {{
    if (!fileUrl) {{
      const content = atob(encoded);
      const bytes = new Uint8Array(content.length);
      for (let i = 0; i < content.length; i++) bytes[i] = content.charCodeAt(i);
      fileUrl = URL.createObjectURL(new Blob([bytes], {{type:mime}}));
    }}
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
  }} catch {{
    status.textContent = {json.dumps(error)};
  }}
}});
</script></html>'''
    # The browser releases the object URL when Streamlit removes this frame.
    getattr(st, 'iframe', html)(frame, height=78)
