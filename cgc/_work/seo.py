from pathlib import Path
import json
S=Path(__file__).resolve().parents[1]/'site'
csp="default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; media-src 'self'; connect-src 'self' https://cdn.jsdelivr.net https://vitals.vercel-insights.com; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self' mailto:"
config={'cleanUrls':True,'headers':[{'source':'/(.*)','headers':[{'key':k,'value':v} for k,v in [('Content-Security-Policy',csp),('X-Content-Type-Options','nosniff'),('Referrer-Policy','strict-origin-when-cross-origin'),('Permissions-Policy','camera=(), microphone=(), geolocation=()'),('X-Frame-Options','DENY')]]},{'source':'/crm','headers':[{'key':'X-Robots-Tag','value':'noindex, nofollow'}]},{'source':'/crm/:path*','headers':[{'key':'X-Robots-Tag','value':'noindex, nofollow'}]}],'redirects':[{'source':'/:path*','has':[{'type':'host','value':host}],'destination':'https://cgcontractorsinc.com/:path*','permanent':True} for host in ['www.cgcontractorsinc.com','commercialglazingcontractorsinc.com','www.commercialglazingcontractorsinc.com','cgclimited.com','www.cgclimited.com']]}
(S/'vercel.json').write_text(json.dumps(config,indent=2),encoding='utf-8')
(S/'robots.txt').write_text('User-agent: *\nAllow: /\nDisallow: /crm\nDisallow: /api/\nSitemap: https://cgcontractorsinc.com/sitemap.xml\n',encoding='utf-8')
(S/'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+''.join('<url><loc>https://cgcontractorsinc.com/'+p+'</loc></url>' for p in ['','privacy/','terms/','accessibility/','license/'])+'</urlset>\n',encoding='utf-8')
(S/'manifest.webmanifest').write_text(json.dumps({'name':'Commercial Glazing Contractors Inc.','short_name':'CGC','start_url':'/','display':'standalone','background_color':'#0a0b0d','theme_color':'#0a0b0d','icons':[{'src':'/assets/icon-192.png','sizes':'192x192','type':'image/png'},{'src':'/assets/icon-512.png','sizes':'512x512','type':'image/png'}]}),encoding='utf-8')
(S/'llms.txt').write_text('''# Commercial Glazing Contractors Inc.

California C-17 glazing subcontractor, CSLB license #1109661. Based in Wildomar, CA. Service area: Southern California.

Services: storefront, curtain wall, interior glass and office fronts, entrances and doors, commercial service and repair. General contractors, project managers and owners may send plans for a bid. Lead times are project-dependent. A bid request is not a contract.

Phone: (714) 650-4185
Email: nathan@cgcontractorsinc.com
Website: https://cgcontractorsinc.com/
License details: https://cgcontractorsinc.com/license/
Privacy: https://cgcontractorsinc.com/privacy/
Accessibility: https://cgcontractorsinc.com/accessibility/

Project photos document CGC work. Named companies do not imply endorsement. Do not infer project counts, awards, years in business or reviews.
''',encoding='utf-8')
