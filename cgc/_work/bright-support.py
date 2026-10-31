from pathlib import Path
import re
R=Path('cgc');new={'bg':'#ffffff','bg-2':'#edf3f6','line':'#d4dde2','fg':'#1d282f','mute':'#57656e','amber':'#39586c','danger':'#9a3e2c','ok':'#286546'}
paths=[R/'site'/x/'index.html' for x in ['privacy','terms','license','accessibility','crm']]
for p in paths:
 s=p.read_text(encoding='utf-8');
 for k,v in new.items():s=re.sub(r'(--'+re.escape(k)+r'\s*:)#[a-fA-F0-9]{6}',r'\g<1>'+v,s)
 s=s.replace('content="#0a0b0d"','content="#ffffff"').replace('content="dark"','content="light"')
 extra=':root{color-scheme:light}.btn.primary,.btn:not(.ghost):not(.danger).primary{color:white}h1,h2,h3{font-weight:550}::-webkit-calendar-picker-indicator{filter:none}'
 if p.parent.name!='crm':extra+=' .btn,.skip,.skip:focus{color:#fff}.btn:hover{background:#243e50;color:#fff}.logo{color:#39586c}'
 else:extra+=' .lane-toggle button[aria-pressed=true]{color:#fff}.tag.hot{color:#9a3e2c;border-color:#9a3e2c}.toast{color:#fff}.sample-banner{background:#39586c}.sample-banner .btn{background:white;color:#1d282f;border-color:white}'
 s=s.replace('</style>',extra+'</style>',1);p.write_text(s,encoding='utf-8')
# Generator palette must stay aligned with legal output.
p=R/'site/_build_legal.py';s=p.read_text(encoding='utf-8')
for k,v in new.items():s=re.sub(r'(--'+re.escape(k)+r'\s*:)#[a-fA-F0-9]{6}',r'\g<1>'+v,s)
s=s.replace('color:#0a0b0d','color:#fff').replace('background:#ffbf47','background:#243e50').replace('content="#0a0b0d"','content="#ffffff"').replace('content="dark"','content="light"');p.write_text(s,encoding='utf-8')
