from pathlib import Path
import re,json
S=Path('cgc/site');p=S/'crm/index.html';s=p.read_text(encoding='utf-8');s=s.replace("ls.set('cgc_crm_key', k)","ls.del('cgc_crm_key')").replace("const k = ls.get('cgc_crm_key');","ls.del('cgc_crm_key'); const k = ''; // Keys stay in tab memory only.")
s=s.replace('It stays in this browser.','It stays in memory for this tab until you lock or reload.')
s=s.replace('<a class="btn" href="sms:${esc(tel)}">Text</a>',"${l.smsConsent ? `<a class=\"btn\" href=\"sms:${esc(tel)}\">Text</a>` : ''}")
s=s.replace('<body>','<body><a href="#main" class="skip">Skip to content</a>',1).replace('<style>','<style>.skip{position:fixed;top:-100px;left:12px;z-index:200;background:white;color:black;padding:12px}.skip:focus{top:12px}',1)
p.write_text(s,encoding='utf-8')
p=S/'api/lead.js';s=p.read_text(encoding='utf-8');legal=(S/'LEGAL-NOTES.md').read_text(encoding='utf-8');copy=re.findall(r'^> (.+)$',legal,re.M)[0];s=s.replace("ua: String((req.headers",'smsConsentVersion: "2026-10-30",\n    smsConsentText: '+json.dumps(copy)+',\n    ua: String((req.headers');p.write_text(s,encoding='utf-8')
# Make legal generator relocatable and preserve verified accessibility refinements on regeneration.
p=S/'_build_legal.py';s=p.read_text(encoding='utf-8-sig');s=re.sub(r'SITE = r"[^"]+"','SITE = os.path.dirname(os.path.abspath(__file__))',s);s=s.replace('CSS = """','CSS = """'+(S.parent/'_work/font.css').read_text(encoding='utf-8'),1);s=s.replace('.btn{display:inline-block','.btn{min-height:44px;min-width:44px;display:inline-block');p.write_text(s,encoding='utf-8')
for p in [S/x/'index.html' for x in ['privacy','terms','license','accessibility']]:
 s=p.read_text(encoding='utf-8').replace('.btn{display:inline-block','.btn{min-height:44px;min-width:44px;display:inline-block');p.write_text(s,encoding='utf-8')
