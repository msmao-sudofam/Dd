# DNS plan — owner applies after preview approval

Primary URL: **https://cgcontractorsinc.com/**. `www.cgcontractorsinc.com` redirects permanently to the apex. Both alternate domains and their www names redirect to the same primary URL, preserving paths and queries. The host redirects are defined with Vercel permanent redirects (308) in `site/vercel.json`.

No DNS records, credentials, production deployment or Deployment Protection settings were changed during this build.

## Protect email first

The primary domain already carries email. In GoDaddy, export the full DNS zone and take screenshots before editing. Record every existing MX record with priority and every TXT value, especially SPF, DKIM selectors and `_dmarc`. Preserve every mail-related CNAME, autodiscover, verification record and any mail host's A/AAAA record. **Do not replace the zone, change nameservers, reset DNS, or delete email records.** Check MX and mail records on the alternate domains too; their email setup is unknown.

## Apply web records only

1. In the correct Vercel project, add `cgcontractorsinc.com` and `www.cgcontractorsinc.com`. Record the exact A and CNAME targets Vercel displays. No account-specific targets have been retrieved by this build.
2. Edit only conflicting web-host records at `@` and `www` in GoDaddy. Do not delete unrelated records. A stale web AAAA record can conflict too; confirm its purpose before changing it.

| Domain | Type | Host | Target | TTL |
| --- | --- | --- | --- | --- |
| cgcontractorsinc.com | A | @ | **Exact apex IP shown by Vercel**; general-purpose reference is `76.76.21.21` | 600 seconds, if available |
| cgcontractorsinc.com | CNAME | www | **Exact CNAME target shown by Vercel**; older general reference is `cname.vercel-dns.com` | 600 seconds, if available |

Vercel may recommend a project-specific target. Do not blindly substitute the general examples: its current setup documentation lists `cname.vercel-dns-0.com` among general values and instructs using the project's supplied records. See [Vercel custom domain setup](https://vercel.com/docs/domains/set-up-custom-domain) and [Vercel A record guidance](https://vercel.com/kb/guide/a-record-and-caa-with-vercel).

3. Add `commercialglazingcontractorsinc.com`, `www.commercialglazingcontractorsinc.com`, `cgclimited.com` and `www.cgclimited.com` to the same Vercel project. For each apex set only its web A record to the target Vercel supplies; for each www set its CNAME to Vercel's supplied target. Preserve all mail records. The checked-in host rules return 308 to `https://cgcontractorsinc.com/:path*` once these domains reach the project.
4. Keep GoDaddy nameservers. Let Vercel verify the records and issue HTTPS certificates. Confirm all six hostnames use the intended project.

## Verify and roll back

Before the change, confirm the owner has configured private Blob storage, CRM_KEY and the intended Deployment Protection settings, and tested a request end to end on preview. Production promotion is an owner step; only a preview deploy is authorized here.

After the owner promotes: verify home, legal pages, the bid request and the CRM on the primary domain. Check `www` and both alternates with an example path and query (`/license/?ref=dns-check`): they should return **308** to that path/query on the apex primary, then load over HTTPS. Confirm inbound and outbound email still works and compare MX/TXT/CNAME records with the saved zone. Check SPF, DKIM and DMARC through the owner's email service. Restore only the changed web records from the export if web delivery fails; leave the mail configuration intact. Return TTLs to the owner's normal values after verification.
