from pathlib import Path
import subprocess,json
S=Path('cgc/site');p=S/'media/manifest.json';other=json.loads(p.read_text(encoding='utf-8-sig'));ours=json.loads(subprocess.check_output(['git','show','d59a63a:cgc/site/media/manifest.json'],text=True));
if 'photos' in other:
 (Path('cgc/_work')/'alternate-manifest.json').write_text(json.dumps(other,indent=2),encoding='utf-8');ours['alternate_photos']=other['photos'];ours['alternate_pairs']=other['pairs'];ours['alternate_videos']=other['videos']
p.write_text(json.dumps(ours,indent=2),encoding='utf-8')
p=S/'_test/dev-server.mjs';s=p.read_text(encoding='utf-8-sig');a=s.index('// Local-only key');b=s.index('const types=',a);s=s[:a]+'// Authentication uses only an owner-provided CRM_KEY environment variable.\n'+s[b:];s=s.replace(" if(req.headers['x-crm-key']==='dev')req.headers['x-crm-key']=DEV_KEY;\n",'');s=s.replace(" if(url.pathname==='/api/lead'){req.headers['x-forwarded-for']=`127.0.${(ipSeq>>8)&255}.${++ipSeq&255}`;return await lead(req,res);}"," if(url.pathname==='/api/lead')return await lead(req,res);");p.write_text(s,encoding='utf-8')
p=Path('cgc/_work/site.py');s=p.read_text(encoding='utf-8-sig').replace('<body><a class="skip"','<body class="static-film"><a class="skip"');p.write_text(s,encoding='utf-8')
