"""Snapshot CGC without credentials, dependencies or external model installs."""
from pathlib import Path
import hashlib,json,subprocess,zipfile,re,time

repo=Path(__file__).resolve().parents[2]
out=Path('C:/Users/Moqui/Documents/Codex/2026-10-30/you-are-finishing-a-client-website/outputs/CGC-Claude-Transfer-2026-11-02')
out.mkdir(parents=True,exist_ok=True)
docs=repo/'cgc/handoff-to-claude'
def git(*args):
    return subprocess.run(['git',*args],cwd=repo,capture_output=True).stdout
state=b'HEAD\n'+git('rev-parse','HEAD')+b'BRANCH\n'+git('branch','--show-current')+b'STATUS\n'+git('status','--short')+b'RECENT COMMITS\n'+git('log','-12','--oneline')
(out/'git-state.txt').write_bytes(state)
(out/'working-tree.patch').write_bytes(git('diff','--binary','--','cgc'))
(out/'staged.patch').write_bytes(git('diff','--cached','--binary','--','cgc'))
for name in ['START-HERE.md','CURRENT-STATE.md','FREEBUFF-EXPORT-PROMPT.md','CLAUDE-IMPORT-PROMPT.md']:
    (out/name).write_bytes((docs/name).read_bytes())
excluded=[];entries=[]
text_ext={'.py','.js','.mjs','.cjs','.json','.md','.txt','.csv','.html','.css','.svg','.vtt','.srt','.xml','.log','.yaml','.yml','.toml','.ps1','.sh','.bat','.gitignore'}
secret=re.compile(rb'(?:Bearer\s+[A-Za-z0-9_.~-]{24,}|sk-(?:proj-|live_|test_)?[A-Za-z0-9_-]{28,}|\bAKIA[A-Z0-9]{16}\b|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----)')
project=out/'CGC-Claude-Project.zip';media=out/'CGC-Claude-Source-Media.zip'
with zipfile.ZipFile(project,'w',zipfile.ZIP_DEFLATED,compresslevel=3,allowZip64=True) as pzip,zipfile.ZipFile(media,'w',zipfile.ZIP_DEFLATED,compresslevel=1,allowZip64=True) as mzip:
    for path in sorted((repo/'cgc').rglob('*')):
        if not path.is_file():continue
        rel=path.relative_to(repo).as_posix();parts=path.relative_to(repo).parts;name=path.name.lower()
        reason=None
        if any(part.lower() in {'node_modules','.git','.vercel','__pycache__','.venv','venv','.cache','.pytest_cache'} for part in parts):reason='Dependency, cache, credential metadata or Git internals'
        elif name.startswith('.env') or name in {'credentials.json','auth.json','cookies.json','cookies.txt'} or path.suffix.lower() in {'.pem','.key','.pfx','.p12'}:reason='Credential-related path'
        elif path.is_symlink():reason='Symlink; external target not followed'
        if reason:excluded.append(dict(path=rel,reason=reason));continue
        data=path.read_bytes()
        if path.suffix.lower() in text_ext and secret.search(data):
            excluded.append(dict(path=rel,reason='Potential credential pattern; excluded without printing contents'));continue
        group='source-media' if '_raw' in parts or ('_work' in parts and path.suffix.lower() not in text_ext) else 'project'
        target=mzip if group=='source-media' else pzip
        target.writestr(rel,data)
        entries.append(dict(path=rel,bytes=len(data),sha256=hashlib.sha256(data).hexdigest(),archive=group))
    for path in sorted(out.iterdir()):
        if path.suffix in {'.md','.txt','.patch'}:
            data=path.read_bytes()
            if secret.search(data):excluded.append(dict(path=path.name,reason='Potential credential pattern in transfer metadata'));continue
            pzip.writestr(path.name,data)
    inventory=json.dumps(dict(created='2026-11-02',scope='Local CGC snapshot including available Freebuff artifacts; no complete chat export or model weights',files=entries),indent=2)
    exclusions=json.dumps(excluded,indent=2)
    (out/'transfer-manifest.json').write_text(inventory,encoding='utf-8');(out/'transfer-exclusions.json').write_text(exclusions,encoding='utf-8')
    pzip.writestr('transfer-manifest.json',inventory);pzip.writestr('transfer-exclusions.json',exclusions)
checks=[]
for path in [project,media]:
    with zipfile.ZipFile(path) as z:
        bad=z.testzip();assert bad is None,bad
        checks.append(dict(file=path.name,bytes=path.stat().st_size,entries=len(z.infolist()),crc='all passed',sha256=hashlib.file_digest(path.open('rb'),'sha256').hexdigest()))
report=dict(created='2026-11-02',included_files=len(entries),excluded_files=len(excluded),archives=checks)
(out/'EXPORT-VERIFICATION.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print(json.dumps(report,indent=2))
