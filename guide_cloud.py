"""Add guide progress to the original account's private learning record."""
import json
import os
import streamlit as st

FIELDS = {'completed':{}, 'steps':{}, 'favorites':[], 'quiz_scores':{}, 'profile_name':'',
          'lesson':'install', 'guide_steps':{}, 'guide_completed':{}, 'guide_stars':[],
          'guide_practiced':[], 'guide_recent':'', 'guide_voice_value':True,
          'guide_speed_value':.9, 'guide_device_value':'Galaxy'}

def bind(services):
    if getattr(services,'_guide_bound',False):return
    original_setting=services.setting

    def setting(name,default=''):
        return os.getenv(name) or original_setting(name,default)

    def load():
        s=st.session_state;user=s.get('account')
        if not user:return
        s['_guide_sync_ok']=False
        result=services.client().table('learning_state').select('payload').eq('user_id',user['id']).execute()
        payload=result.data[0]['payload'] if result.data else {}
        if not isinstance(payload,dict):raise ValueError('learning data')
        for key,default in FIELDS.items():
            val=payload.get(key,default)
            if type(val)==type(default):s[key]=val.copy() if isinstance(val,(dict,list)) else val
        s['_guide_prior_payload']=payload
        s['_last_payload']=json.dumps(payload,sort_keys=True,ensure_ascii=False)
        s['_guide_sync_ok']=True

    def save():
        s=st.session_state;user=s.get('account')
        if not user:return
        if not s.get('_guide_sync_ok'):return
        payload={**s.get('_guide_prior_payload',{}),**{key:s.get(key,default) for key,default in FIELDS.items()}}
        value=json.dumps(payload,sort_keys=True,ensure_ascii=False)
        if value==s.get('_last_payload'):return
        services.client().table('learning_state').upsert({'user_id':user['id'],'payload':payload},on_conflict='user_id').execute()
        s['_last_payload']=value

    services.setting=setting;services.load_progress=load;services.save_progress=save;services._guide_bound=True
