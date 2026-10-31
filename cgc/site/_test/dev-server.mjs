import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import lead from '../api/lead.js';
import leads from '../api/leads.js';
import {setStore,memoryStore} from '../api/_lib/store.js';
const root=fileURLToPath(new URL('../',import.meta.url));
setStore(memoryStore());
// Use only an owner-provided environment key. Never generate or print a key.
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp','.jpg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml','.mp4':'video/mp4','.webm':'video/webm','.vtt':'text/vtt','.ico':'image/x-icon','.xml':'application/xml','.txt':'text/plain','.webmanifest':'application/manifest+json'};
const config=JSON.parse(await readFile(path.join(root,'vercel.json'),'utf8').catch(()=>'{}'));
const server=http.createServer(async(req,res)=>{
 try {
 const url=new URL(req.url,'http://localhost');
 for(const rule of config.headers||[]) { if(rule.source==='/(.*)' || (rule.source.includes('crm')&&/^\/crm(?:\/|$)/.test(url.pathname))) for(const h of rule.headers)res.setHeader(h.key,h.value); }
 if(url.pathname==='/api/lead')return await lead(req,res);
 if(url.pathname==='/api/leads')return await leads(req,res);
 if(url.pathname==='/_vercel/insights/script.js'){res.writeHead(200,{'Content-Type':'text/javascript'});return res.end('// Local analytics placeholder.');}
 let relative=decodeURIComponent(url.pathname).replace(/^\/+/, '');
 if(relative.startsWith('api/')||relative.startsWith('_')||relative.split('/').some(s=>s.startsWith('.'))||relative.endsWith('.md')||relative.endsWith('.py')||relative.startsWith('node_modules')||relative.startsWith('package')){res.writeHead(404);return res.end('Not found');}
 let file=path.resolve(root,relative||'index.html');
 if(!file.startsWith(root)){res.writeHead(403);return res.end();}
 let info=await stat(file).catch(()=>null);
 if(info?.isDirectory())file=path.join(file,'index.html');
 const body=await readFile(file);res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});res.end(body);
 }catch{res.writeHead(404);res.end('Not found');}
});
server.listen(Number(process.env.PORT||4173),'127.0.0.1',()=>console.log('CGC local preview: http://127.0.0.1:4173 — in-memory leads; SAMPLE mode needs no key.'));
