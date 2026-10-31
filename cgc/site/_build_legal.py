import os, re

SITE = os.path.dirname(os.path.abspath(__file__))
UPDATED = "October 30, 2026"
PHONE = '<a href="tel:+17146504185">(714) 650-4185</a>'
EMAIL = '<a href="mailto:nathan@cgcontractorsinc.com">nathan@cgcontractorsinc.com</a>'
CONTACT_BLOCK = f"""<address class="contact">
<strong>Commercial Glazing Contractors Inc.</strong><br>
22746 Queensbury Ct<br>
Wildomar, CA 92595<br>
Phone: {PHONE}<br>
Email: {EMAIL}
</address>"""

CSS = """@font-face{font-family:Archivo;src:url('/assets/fonts/archivo.woff2') format('woff2');font-weight:100 900;font-stretch:62% 125%;font-display:swap}@font-face{font-family:'JetBrains Mono';src:url('/assets/fonts/jetbrains-mono.woff2') format('woff2');font-weight:100 800;font-display:swap}
:root{
  --bg:#ffffff;--bg-2:#edf3f6;--line:#d4dde2;--fg:#1d282f;--mute:#57656e;
  --steel:#636466;--amber:#39586c;--glass:#9ec9d6;
  --f-display:"Archivo",system-ui,sans-serif;
  --f-body:"Archivo",system-ui,sans-serif;
  --f-mono:"JetBrains Mono",ui-monospace,monospace;
}
*,*::before,*::after{box-sizing:border-box}
html{-webkit-text-size-adjust:100%;text-size-adjust:100%}
@media (prefers-reduced-motion:no-preference){html{scroll-behavior:smooth}}
body{margin:0;background:var(--bg);color:var(--fg);font-family:var(--f-body);font-variation-settings:"wdth" 100;font-size:1.0625rem;line-height:1.65;overflow-wrap:break-word}
a{color:var(--fg);text-decoration:underline;text-decoration-color:var(--amber);text-decoration-thickness:1px;text-underline-offset:3px}
a:hover{color:var(--amber)}
:focus-visible{outline:2px solid var(--amber);outline-offset:3px}
.skip{position:absolute;left:16px;top:-200px;z-index:10;background:var(--amber);color:#fff;padding:10px 14px;border-radius:4px;font-weight:600;text-decoration:none}
.skip:focus{top:12px;color:#fff}
.site-head{border-bottom:1px solid var(--line)}
.bar{max-width:1120px;margin:0 auto;padding:14px 16px;display:flex;align-items:center;justify-content:space-between;gap:16px}
.logo{font-family:var(--f-display);font-variation-settings:"wdth" 112;font-weight:800;font-size:1.5rem;letter-spacing:-0.03em;color:var(--amber);text-decoration:none;line-height:1}
.logo:hover{color:var(--amber)}
.btn{min-height:44px;min-width:44px;display:inline-block;background:var(--amber);color:#fff;border-radius:4px;padding:10px 16px;font-weight:600;font-size:.9375rem;line-height:1.2;text-decoration:none}
.btn:hover{background:#243e50;color:#fff}
main{display:block;max-width:calc(68ch + 32px);margin:0 auto;padding:48px 16px 80px}
.label{font-family:var(--f-mono);font-size:.75rem;font-weight:500;letter-spacing:.08em;text-transform:uppercase;color:var(--mute)}
h1,h2,h3{font-family:var(--f-display);font-variation-settings:"wdth" 112;letter-spacing:-0.03em;line-height:1.1}
h1{font-weight:800;font-size:clamp(2.25rem,8vw,3.5rem);margin:12px 0 16px}
h2{font-weight:700;font-size:1.5rem;margin:8px 0 16px}
h3{font-weight:600;font-size:1.125rem;letter-spacing:-0.01em;margin:28px 0 8px}
p,ul,ol,dl,table,address{margin:0 0 16px}
ul,ol{padding-left:1.3em}
li{margin-bottom:6px}
strong{font-weight:600}
.lede{font-size:1.1875rem;color:var(--fg)}
.updated{margin-top:0}
.toc{border:1px solid var(--line);background:var(--bg-2);padding:20px 20px 8px;margin:32px 0 16px}
.toc ol{padding-left:0;list-style:none;counter-reset:toc}
.toc li{counter-increment:toc;display:flex;gap:12px}
.toc li::before{content:counter(toc,decimal-leading-zero);font-family:var(--f-mono);font-size:.75rem;letter-spacing:.08em;color:var(--mute);padding-top:.3em;flex:none;white-space:nowrap}
section{border-top:1px solid var(--line);margin-top:48px;padding-top:24px;scroll-margin-top:16px}
.table-wrap{overflow-x:auto;margin:0 0 16px;border:1px solid var(--line)}
table{width:100%;border-collapse:collapse;font-size:1rem;margin:0}
th,td{text-align:left;vertical-align:top;padding:10px 12px;border-bottom:1px solid var(--line)}
tr:last-child th,tr:last-child td{border-bottom:0}
thead th{font-family:var(--f-mono);font-size:.75rem;font-weight:500;letter-spacing:.08em;text-transform:uppercase;color:var(--mute);background:var(--bg-2)}
.facts{border:1px solid var(--line);margin:24px 0}
.facts div{display:grid;grid-template-columns:minmax(0,11rem) minmax(0,1fr);gap:4px 16px;padding:12px 16px;border-bottom:1px solid var(--line)}
.facts div:last-child{border-bottom:0}
.facts dt{font-family:var(--f-mono);font-size:.75rem;letter-spacing:.08em;text-transform:uppercase;color:var(--mute);padding-top:.3em}
.facts dd{margin:0;font-weight:500}
@media (max-width:520px){.facts div{grid-template-columns:1fr}}
.status{display:inline-block;font-family:var(--f-mono);font-size:.75rem;letter-spacing:.08em;text-transform:uppercase;border:1px solid var(--amber);color:var(--amber);border-radius:4px;padding:2px 8px}
.note{border-left:2px solid var(--steel);padding:4px 0 4px 16px;color:var(--fg)}
.small{font-size:1rem;color:var(--mute)}
.contact{font-style:normal;border:1px solid var(--line);background:var(--bg-2);padding:16px 20px}
.visually-hidden{position:absolute!important;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
.site-foot{border-top:1px solid var(--line);background:var(--bg-2)}
.foot{max-width:1120px;margin:0 auto;padding:32px 16px 40px;display:grid;gap:16px}
.foot ul{list-style:none;padding:0;margin:0;display:flex;flex-wrap:wrap;gap:8px 24px}
.foot li{margin:0}
.foot a[aria-current="page"]{color:var(--amber)}
.foot p{margin:0}
"""

FONTS = "https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&family=JetBrains+Mono:wght@400;500&display=swap"

LEGAL_LINKS = [("/privacy/", "Privacy Policy"), ("/terms/", "Terms of Use"),
               ("/accessibility/", "Accessibility"), ("/license/", "License &amp; Insurance")]


def page(path, title, desc, label, h1, lede, sections, after_toc="", tail=""):
    toc = "\n".join(f'<li><a href="#{sid}">{name}</a></li>' for sid, name, _ in sections)
    body = "\n".join(
        f'<section id="{sid}" aria-labelledby="{sid}-h">\n<p class="label">&sect; {i:02d}</p>\n<h2 id="{sid}-h">{name}</h2>\n{html.strip()}\n</section>'
        for i, (sid, name, html) in enumerate(sections, 1))
    foot_links = "\n".join(
        f'<li><a href="{href}"{" aria-current=\"page\"" if href == "/" + path + "/" else ""}>{name}</a></li>'
        for href, name in LEGAL_LINKS)
    doc = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="canonical" href="https://cgcontractorsinc.com/{path}/">
<meta name="theme-color" content="#ffffff">
<meta name="color-scheme" content="light">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="{FONTS}">
<style>{CSS}</style>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="site-head">
<div class="bar">
<a class="logo" href="/" aria-label="CGC home">CGC</a>
<a class="btn" href="/#bid">Request a bid</a>
</div>
</header>
<main id="main" tabindex="-1">
<p class="label">{label}</p>
<h1>{h1}</h1>
<p class="label updated">Last updated: {UPDATED}</p>
<p class="lede">{lede}</p>
{after_toc}
<nav class="toc" aria-label="On this page">
<p class="label">On this page</p>
<ol>
{toc}
</ol>
</nav>
{body}
{tail}
</main>
<footer class="site-foot">
<div class="foot">
<nav aria-label="Legal">
<ul>
{foot_links}
</ul>
</nav>
<p>{PHONE} &middot; {EMAIL}</p>
<p class="label">CSLB Lic. #1109661 &middot; C-17 Glazing</p>
<p class="small">&copy; 2026 Commercial Glazing Contractors Inc.</p>
</div>
</footer>
</body>
</html>
"""
    out = os.path.join(SITE, path, "index.html")
    with open(out, "w", encoding="utf-8", newline="\n") as f:
        f.write(doc)
    print("wrote", out, len(doc))


# ---------------------------------------------------------------- PRIVACY
privacy = [
("who", "Who we are", f"""
<p>This policy covers cgcontractorsinc.com, run by Commercial Glazing Contractors Inc. (&ldquo;CGC,&rdquo; &ldquo;we,&rdquo; &ldquo;us&rdquo;), a California corporation and licensed glazing contractor (CSLB #1109661). It explains what we collect through this website, why, who handles it for us, and the choices you have.</p>
<p>It does not cover information we receive through signed contracts, job sites or other business dealings outside this website. Those are handled under the terms of the contract or relationship involved.</p>
"""),
("collect", "What we collect", """
<h3>Information you give us</h3>
<p>When you send a bid request, we collect what you type into the form:</p>
<ul>
<li>Name and company</li>
<li>Email address and phone number</li>
<li>Project location (site address or city)</li>
<li>Scope of work and timeline</li>
<li>An optional link to plans or files</li>
<li>Whether you checked the box to receive text messages</li>
</ul>
<p>If you send a link to plans or files, we open that link to review the documents and may download copies to prepare the bid. The files stay wherever you host them; we only keep the copies we need for the bid.</p>
<p>If you email or call us, we keep what you send and notes from the conversation.</p>
<h3>Information collected automatically</h3>
<p>We use Vercel Web Analytics to count visits. It does not use cookies and does not build a profile of you. It reports aggregated figures such as page views, referring sites, approximate country, and browser and device type.</p>
<p>Our hosting provider processes technical data such as your IP address and browser details to deliver pages, keep logs and block abuse. We don&rsquo;t use this data to identify you.</p>
<h3>What we don&rsquo;t collect</h3>
<p>We don&rsquo;t ask for, and don&rsquo;t want, sensitive personal information such as Social Security numbers, driver&rsquo;s license numbers, financial account numbers, health information or precise geolocation of your device. Please don&rsquo;t include it in the form.</p>
"""),
("use", "How we use it", """
<p>We use the information from your bid request to:</p>
<ul>
<li>Review your project and prepare a bid or quote</li>
<li>Contact you by email or phone about that request</li>
<li>Send text messages, but only if you checked the separate SMS box</li>
<li>Keep records of bids and, if we&rsquo;re hired, run the project and meet contract, tax and licensing obligations</li>
<li>Protect the site and our business against spam, fraud and abuse</li>
</ul>
<p>We use aggregated analytics to see which pages get used and to fix problems. We don&rsquo;t use your information for advertising, and we don&rsquo;t add you to a marketing list from a bid request.</p>
"""),
("sms", "Text messages (SMS)", """
<p>Text messages are optional. The bid form has a separate SMS checkbox that is unchecked by default. We text you only if you check it.</p>
<ul>
<li><strong>What we send:</strong> messages about your bid request and project, such as follow-up questions, scheduling and status updates. These may be sent using automated technology.</li>
<li><strong>Frequency:</strong> message frequency varies with your project.</li>
<li><strong>Cost:</strong> message and data rates may apply, depending on your mobile plan.</li>
<li><strong>Opt out:</strong> reply <strong>STOP</strong> to any message. We&rsquo;ll send one confirmation and then stop texting you.</li>
<li><strong>Help:</strong> reply <strong>HELP</strong>, call (714) 650-4185 or email nathan@cgcontractorsinc.com.</li>
<li><strong>Not required:</strong> consent to texts is not a condition of getting a bid or buying anything from us.</li>
</ul>
<p>We do not sell, rent or share mobile numbers or SMS consent with third parties or affiliates for their marketing. Carriers are not liable for delayed or undelivered messages.</p>
"""),
("share", "Who we share it with", """
<p>We don&rsquo;t sell your personal information, and we don&rsquo;t share it for cross-context behavioral advertising. We have not done either in the past 12 months.</p>
<p>We disclose information only to service providers that help us run the site and the business, under contracts that limit their use of it to providing their service to us:</p>
<div class="table-wrap" role="region" aria-label="Service providers" tabindex="0">
<table>
<thead><tr><th scope="col">Provider</th><th scope="col">What they do</th><th scope="col">Data involved</th></tr></thead>
<tbody>
<tr><td>Vercel Inc. (United States)</td><td>Hosts this website, our lead database (CRM) and cookieless web analytics</td><td>Bid request details, technical request data, aggregated analytics</td></tr>
<tr><td>Email service provider</td><td>Sends notification emails about new bid requests and our replies</td><td>Name, contact details and request details included in the email</td></tr>
<tr><td>SMS provider (only if you opt in)</td><td>Delivers text messages</td><td>Phone number and message content</td></tr>
</tbody>
</table>
</div>
<p>We may also disclose information when the law requires it, to protect our rights or safety or those of others, or to a buyer or successor if the business is sold or reorganized. If you hire us, we may share project details with the general contractor, owner, suppliers, inspectors or others working on that project as needed to do the job.</p>
"""),
("cookies", "Cookies, tracking and Global Privacy Control", """
<p>This site doesn&rsquo;t set advertising or tracking cookies. We don&rsquo;t use ad pixels (such as Meta or Google ad tags), session recording or cross-site tracking. Our analytics are cookieless and aggregated.</p>
<p>We honor Global Privacy Control (GPC). If your browser sends a GPC signal, we treat it as a request to opt out of the sale or sharing of your personal information. Because we don&rsquo;t sell or share personal information, nothing changes in how the site works for you, but the signal is respected.</p>
<p>Links to other sites, such as our Instagram, are covered by those sites&rsquo; own privacy policies.</p>
"""),
("retention", "How long we keep it", """
<div class="table-wrap" role="region" aria-label="Retention periods" tabindex="0">
<table>
<thead><tr><th scope="col">Record</th><th scope="col">How long</th></tr></thead>
<tbody>
<tr><td>Bid requests that lead to a bid or contract, and related project records</td><td>Up to 7 years after the bid or project closes, for contract, warranty, tax and licensing purposes</td></tr>
<tr><td>Bid requests that don&rsquo;t lead to a bid or contract</td><td>24 months from our last contact, then deleted</td></tr>
<tr><td>SMS opt-out records</td><td>As long as needed to make sure we don&rsquo;t text you again</td></tr>
<tr><td>Aggregated analytics</td><td>Kept in aggregate form only; it does not identify you</td></tr>
</tbody>
</table>
</div>
<p>We may keep information longer if the law requires it or if it&rsquo;s needed for a legal claim or dispute.</p>
"""),
("security", "Security", """
<p>The site is served over HTTPS. Lead data is stored in our own CRM, hosted on Vercel in the United States, and access is limited to authorized CGC staff with a key. Our providers use standard industry safeguards.</p>
<p>No system is perfectly secure. If we learn of a breach that affects your personal information, we&rsquo;ll notify you as required by California law.</p>
"""),
("california", "Your California privacy rights", f"""
<p>If you live in California, the California Consumer Privacy Act, as amended by the California Privacy Rights Act (CCPA/CPRA), gives you rights over your personal information. We honor these requests from California residents whether or not the law requires it of a business our size.</p>
<h3>Categories collected in the past 12 months</h3>
<div class="table-wrap" role="region" aria-label="Categories of personal information" tabindex="0">
<table>
<thead><tr><th scope="col">Category</th><th scope="col">Examples</th><th scope="col">Source</th><th scope="col">Disclosed to</th></tr></thead>
<tbody>
<tr><td>Identifiers</td><td>Name, email, phone number</td><td>You</td><td>Service providers</td></tr>
<tr><td>Professional or commercial information</td><td>Company, project location, scope, timeline, plans</td><td>You</td><td>Service providers; project parties if you hire us</td></tr>
<tr><td>Internet or network activity</td><td>Aggregated page views, browser type, IP address in server logs</td><td>Your browser</td><td>Hosting provider</td></tr>
</tbody>
</table>
</div>
<p>We collect these for the purposes in <a href="#use">How we use it</a>. We collect no sensitive personal information as defined by the CCPA.</p>
<h3>Your rights</h3>
<ul>
<li><strong>Right to know:</strong> ask what personal information we have about you, where it came from, why we have it and who we disclosed it to, and get a copy.</li>
<li><strong>Right to delete:</strong> ask us to delete it, subject to legal exceptions (for example, records we must keep for contracts or taxes).</li>
<li><strong>Right to correct:</strong> ask us to fix information that&rsquo;s wrong.</li>
<li><strong>Right to opt out of sale or sharing:</strong> we don&rsquo;t sell or share personal information, so there is nothing to opt out of. GPC signals are honored anyway.</li>
<li><strong>Right to limit use of sensitive personal information:</strong> we don&rsquo;t collect any.</li>
<li><strong>Non-discrimination:</strong> we won&rsquo;t deny you a bid, charge you differently or treat you worse for using these rights.</li>
</ul>
<h3>How to make a request</h3>
<p>Email {EMAIL} with &ldquo;Privacy request&rdquo; in the subject line, or call {PHONE}. Tell us which right you&rsquo;re using.</p>
<p><strong>Verification.</strong> To protect you, we confirm your identity before acting. We&rsquo;ll usually ask you to confirm the email address or phone number you gave us and one or two details of your request, such as the project location. We only use that information to verify you.</p>
<p><strong>Authorized agents.</strong> Someone else can make a request for you. We&rsquo;ll ask for your signed permission for them to act on your behalf, and we may ask you to confirm your identity with us directly.</p>
<p><strong>Response time.</strong> We confirm receipt within 10 business days and respond within 45 calendar days. If we need more time, we&rsquo;ll tell you why, and we may take up to 45 more days. You can make a request to know up to twice in a 12-month period at no charge.</p>
<h3>Shine the Light</h3>
<p>California Civil Code &sect;1798.83 lets California residents ask what personal information a business shared with third parties for their direct marketing. We don&rsquo;t share personal information for anyone&rsquo;s direct marketing.</p>
"""),
("children", "Children", """
<p>This site is for businesses and adults planning commercial construction work. It isn&rsquo;t directed to children under 16, and we don&rsquo;t knowingly collect their personal information. If you believe a child has sent us information, contact us and we&rsquo;ll delete it.</p>
"""),
("changes", "Changes to this policy", """
<p>If we change how we handle personal information, we&rsquo;ll update this page and the &ldquo;Last updated&rdquo; date at the top. If a change is significant, such as a new use of your information, we&rsquo;ll post a clear notice on the site before it takes effect.</p>
"""),
("contact", "Contact", f"""
<p>Questions about this policy or your information:</p>
{CONTACT_BLOCK}
"""),
]

page("privacy", "Privacy Policy | CGC",
     "How Commercial Glazing Contractors Inc. collects, uses and protects information from bid requests on cgcontractorsinc.com, including California privacy rights and SMS terms.",
     "Legal &middot; Privacy",
     "Privacy Policy",
     "The short version: we collect what you put in a bid request so we can bid your job. We don&rsquo;t sell it, we don&rsquo;t share it for advertising, and we don&rsquo;t run ad trackers on this site.",
     privacy)

# ---------------------------------------------------------------- TERMS
terms = [
("about", "About this site", """
<p>cgcontractorsinc.com is run by Commercial Glazing Contractors Inc. (&ldquo;CGC,&rdquo; &ldquo;we,&rdquo; &ldquo;us&rdquo;), a California corporation licensed by the Contractors State License Board (CSLB #1109661, C-17 Glazing). The site describes our commercial glazing work and lets you request a bid.</p>
<p>By using the site you agree to these terms. If you don&rsquo;t agree, please don&rsquo;t use it.</p>
"""),
("bids", "Bid requests are not contracts", """
<p>Sending a bid request through this site, by email or by phone does not create a contract, a commitment to bid, or a reservation of our schedule. We may decline any request.</p>
<p>Any bid, quote or estimate we send is based on the information, plans and specifications available at the time. Prices and scope can change with revised drawings, field conditions, material lead times and pricing, and the time limits stated in the bid.</p>
"""),
("contracts", "Written contracts", """
<p>All work we perform is governed by a separate written contract or subcontract signed by CGC and the hiring party. That contract sets the scope, price, schedule, payment terms, warranties and other terms. If anything on this website conflicts with a signed contract, the contract controls.</p>
<p>California&rsquo;s home improvement contract rules (Business and Professions Code &sect;7159) apply to residential home improvement work, not the commercial work we do. We still put every job in writing before work starts.</p>
"""),
("content", "Website content", """
<p>Content on this site, including service descriptions, project write-ups and general information about glazing systems, is provided for general information. It isn&rsquo;t engineering, design, code-compliance or legal advice for your project. Product performance, code requirements and suitability depend on the specific project, drawings and governing jurisdiction.</p>
<p>We try to keep the site accurate and current, but it&rsquo;s provided &ldquo;as is&rdquo; and &ldquo;as available,&rdquo; without warranties of any kind, express or implied, including warranties of accuracy, merchantability, fitness for a particular purpose or non-infringement. We don&rsquo;t promise the site will be uninterrupted or error-free.</p>
"""),
("photos", "Project photos", """
<p>Project photos and videos on this site show work performed by CGC crews. Some were taken during construction, before final cleaning, punch list or other trades&rsquo; finishes. Where a project was built for or with a general contractor, owner or developer, naming them describes our role on the job and does not imply that they endorse this site.</p>
<p>If you appear in a photo or video and want it removed, contact us and we&rsquo;ll take care of it.</p>
"""),
("ip", "Intellectual property", """
<p>The CGC name and logo, site design, text, photos and videos are owned by Commercial Glazing Contractors Inc. or used with permission. You may view the site and print or save pages for your own use in evaluating our services, such as including our information in a bid package. You may not copy, republish or use our content, name or logo for other purposes, including to present our work as someone else&rsquo;s, without our written permission.</p>
<p>Product names and manufacturer trademarks mentioned on the site belong to their owners.</p>
"""),
("use", "Acceptable use", """
<p>Don&rsquo;t use the site to send spam or false bid requests, upload or link to malicious files, try to get into systems or data you&rsquo;re not authorized to access, scrape the site in a way that burdens it, or break the law. We may block access or delete submissions that do any of these.</p>
"""),
("links", "Links to other sites", """
<p>The site links to outside sites, such as Instagram and the CSLB license lookup. We don&rsquo;t control those sites and aren&rsquo;t responsible for their content or practices.</p>
"""),
("liability", "Limitation of liability", """
<p>To the fullest extent California law allows, CGC and its officers, employees and agents are not liable for any indirect, incidental, special, consequential or punitive damages, or for lost profits, data or business, arising from your use of this website or reliance on its content, even if we were told such damages were possible. Our total liability for any claim arising from use of the website is limited to $100.</p>
<p>This section applies only to use of the website. Liability for construction work is governed by the written contract for that work and by applicable law. Nothing in these terms limits liability that cannot be limited under California law.</p>
"""),
("law", "Governing law and venue", """
<p>These terms are governed by the laws of the State of California, without regard to conflict-of-law rules. Any dispute arising from these terms or your use of the website will be brought in the state or federal courts located in Riverside County, California, and you agree to the jurisdiction of those courts. Disputes about construction work are resolved as provided in the written contract for that work.</p>
"""),
("changes", "Changes to these terms", """
<p>We may update these terms. The new version takes effect when posted, and the &ldquo;Last updated&rdquo; date at the top shows when it last changed. Continuing to use the site after a change means you accept the updated terms.</p>
"""),
("contact", "Contact", f"""
<p>Questions about these terms:</p>
{CONTACT_BLOCK}
"""),
]

page("terms", "Terms of Use | CGC",
     "Terms of use for cgcontractorsinc.com: bid requests are not contracts, all work is under a separate written contract, and California law applies.",
     "Legal &middot; Terms",
     "Terms of Use",
     "These terms cover use of this website. Construction work is never done under these terms; it&rsquo;s done under a separate written contract signed by both sides.",
     terms)

# ---------------------------------------------------------------- ACCESSIBILITY
access = [
("commitment", "Our goal", """
<p>We want everyone to be able to read about our work and request a bid, including people who use screen readers, keyboards, magnification, voice control or other assistive technology.</p>
<p>Our target is the Web Content Accessibility Guidelines (WCAG) 2.2, Level AA. We believe the site substantially meets that target, with the exceptions listed under <a href="#limits">Known limitations</a>.</p>
"""),
("measures", "What we&rsquo;ve done", """
<ul>
<li><strong>Keyboard access:</strong> every link, button and form field can be reached and used with a keyboard, in a logical order, with a visible focus outline. A &ldquo;Skip to content&rdquo; link is the first item on every page.</li>
<li><strong>Reduced motion:</strong> the animated hero on the home page respects your device&rsquo;s &ldquo;reduce motion&rdquo; setting. When it&rsquo;s on, the animation is replaced with a still image.</li>
<li><strong>Text alternatives:</strong> meaningful images have descriptive alt text. Decorative images and animation are hidden from screen readers so they don&rsquo;t add noise.</li>
<li><strong>Contrast and text:</strong> text and controls meet WCAG AA contrast ratios against the dark background. Body text is at least 16px, and pages reflow to a 360px-wide screen and to 400% zoom without sideways scrolling.</li>
<li><strong>Structure:</strong> pages use real headings, landmarks and lists, and set the page language, so assistive technology can navigate them.</li>
<li><strong>Forms:</strong> the bid form has visible labels, marks required fields in text (not color alone), and explains errors in words next to the field.</li>
<li><strong>Video:</strong> captions are provided where a video has speech. Videos don&rsquo;t autoplay with sound.</li>
</ul>
"""),
("limits", "Known limitations", """
<ul>
<li><strong>Animated / 3D hero:</strong> the moving hero graphic on the home page is decorative. It carries no information that isn&rsquo;t also in the page text, and it has a static fallback for reduced-motion settings and browsers that can&rsquo;t run it.</li>
<li><strong>Older project videos:</strong> some project videos were originally posted to Instagram and have music or site sound but no spoken narration. They show completed work visually; the project descriptions in text next to them carry the key information.</li>
<li><strong>Outside sites and documents:</strong> links to Instagram, the CSLB lookup and documents from manufacturers or other parties are outside our control and may not meet the same standard.</li>
</ul>
<p>If any of these gets in your way, contact us and we&rsquo;ll get you the information another way.</p>
"""),
("compat", "Compatibility", """
<p>The site is built with standard HTML and CSS and is designed to work with current versions of Chrome, Edge, Safari and Firefox, and with common screen readers such as NVDA, JAWS, VoiceOver and TalkBack.</p>
"""),
("feedback", "Report a problem", f"""
<p>If you have trouble using any part of this site, or need information in a different format, tell us. Please include the page and what went wrong if you can.</p>
<ul>
<li>Email: {EMAIL} (subject &ldquo;Accessibility&rdquo;)</li>
<li>Phone: {PHONE}</li>
</ul>
<p>We aim to reply within 2 business days. If you need to request a bid and the form isn&rsquo;t working for you, call or email and we&rsquo;ll take your request directly.</p>
"""),
("review", "Last review", """
<p>This statement was last reviewed on October 30, 2026. We review it when the site changes significantly, and at least once a year.</p>
"""),
]

page("accessibility", "Accessibility Statement | CGC",
     "Accessibility statement for cgcontractorsinc.com: WCAG 2.2 AA target, measures taken, known limitations and how to report a problem.",
     "Legal &middot; Accessibility",
     "Accessibility Statement",
     "Commercial Glazing Contractors Inc. wants this site to work for everyone. Here&rsquo;s what we&rsquo;ve done, where we fall short, and how to reach us if something doesn&rsquo;t work.",
     access)

# ---------------------------------------------------------------- LICENSE
CSLB_URL = "https://www.cslb.ca.gov/OnlineServices/CheckLicenseII/LicenseDetail.aspx?LicNum=1109661"
lic = [
("license", "Contractor&rsquo;s license", f"""
<dl class="facts">
<div><dt>Business name</dt><dd>Commercial Glazing Contractors Inc.</dd></div>
<div><dt>License number</dt><dd>1109661</dd></div>
<div><dt>Classification</dt><dd>C-17 Glazing</dd></div>
<div><dt>Entity type</dt><dd>Corporation</dd></div>
<div><dt>Status</dt><dd><span class="status">Active</span></dd></div>
<div><dt>Issued</dt><dd><time datetime="2023-09-05">September 5, 2023</time></dd></div>
<div><dt>Expires</dt><dd><time datetime="2027-09-30">September 30, 2027</time></dd></div>
<div><dt>RMO</dt><dd>Nathan Paul Hernandez</dd></div>
</dl>
<p>The RMO (Responsible Managing Officer) is the person who qualifies the license for the corporation and is responsible for supervising its construction work.</p>
<p><a class="btn" href="{CSLB_URL}" rel="noopener">Verify on CSLB<span class="visually-hidden"> (opens the CSLB license lookup)</span></a></p>
<p class="small">Data as listed by CSLB on Oct 30, 2026. The CSLB record is the official source and is updated by the board, not by us.</p>
"""),
("bond", "Contractor&rsquo;s bond", """
<dl class="facts">
<div><dt>Bond type</dt><dd>Contractor&rsquo;s bond</dd></div>
<div><dt>Amount</dt><dd>$25,000</dd></div>
<div><dt>Surety</dt><dd>Western Surety Company</dd></div>
</dl>
<p>California requires every licensed contractor to carry this bond. It is a license requirement, not a performance or payment bond for a specific project. Project bonds, when a job requires them, are arranged separately for that project.</p>
"""),
("workers-comp", "Workers&rsquo; compensation", """
<dl class="facts">
<div><dt>Coverage</dt><dd>Workers&rsquo; compensation insurance</dd></div>
<div><dt>Carrier</dt><dd>State Compensation Insurance Fund</dd></div>
</dl>
<p>Our crews are covered by workers&rsquo; compensation insurance, as recorded on our CSLB license.</p>
"""),
("coi", "Certificates of insurance", f"""
<p>General contractors and owners can request certificates of insurance for a specific project. Email {EMAIL} with the project name and the certificate holder&rsquo;s details.</p>
"""),
("cslb", "Check any contractor&rsquo;s license", """
<p class="note">California law requires anyone who performs construction work of $1,000 or more (labor and materials combined) to hold a license from the Contractors State License Board. You can check any contractor&rsquo;s license, bond and workers&rsquo; compensation status, and any complaints or disciplinary history, at <a href="https://www.cslb.ca.gov" rel="noopener">www.cslb.ca.gov</a> or by calling 800-321-CSLB (2752).</p>
<p class="small">This page is provided for general information and is not legal advice to visitors.</p>
"""),
]

LIC_CSS_EXTRA = ""
page("license", "License &amp; Insurance | CGC",
     "CSLB license #1109661 (C-17 Glazing, active), contractor's bond and workers' compensation details for Commercial Glazing Contractors Inc., with a link to verify on CSLB.",
     "C-17 &middot; LIC 1109661",
     "License &amp; Insurance",
     "Commercial Glazing Contractors Inc. is licensed by the California Contractors State License Board. Here are the details as the board lists them, and how to check them yourself.",
     lic)
