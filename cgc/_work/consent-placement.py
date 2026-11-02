from pathlib import Path
p=Path('cgc/_work/site.py');s=p.read_text(encoding='utf-8');needle="html=html.replace('BIDFIELDS',fieldhtml).replace('FAQ'";insert='''smsblock=re.search(r'<div class="span"><label class="consent">.*?</small></div>',html).group(0)
html=html.replace(smsblock,'')
fieldhtml=fieldhtml.replace('<label class="field"><span>Your role',smsblock+'<label class="field"><span>Your role')
''';assert needle in s;s=s.replace(needle,insert+needle);p.write_text(s,encoding='utf-8')
p=Path('cgc/site/crm/index.html');s=p.read_text(encoding='utf-8');s=s.replace("if (k === 'smsConsent' || k === 'archived') v = /^(true|yes|1)$/i.test(v);", "if (k === 'smsConsent') v = false; // Imported rows never establish opt-in.\n      if (k === 'archived') v = /^(true|yes|1)$/i.test(v);");p.write_text(s,encoding='utf-8')
