# CGC legal pages: notes for the owner and site builder

Pages: `/privacy/`, `/terms/`, `/accessibility/`, `/license/`. Drafted Oct 30, 2026. These are working drafts, not reviewed by a lawyer.

## Form copy

Paste these exactly. If the form changes (new fields, new providers, marketing emails), the privacy policy has to change too.

**SMS checkbox** (separate checkbox, unchecked by default, not required, placed next to the phone field):

> Text me about this bid request. By checking this box, I agree to receive text messages from Commercial Glazing Contractors Inc. at the number I provided about my bid request and project, including messages sent with automated technology. Message frequency varies. Msg & data rates may apply. Reply STOP to opt out, HELP for help. Consent is not a condition of purchase. See our [Privacy Policy](/privacy/#sms) and [Terms](/terms/).

**Submit notice** (plain text directly above or below the submit button):

> By submitting this form, you agree that Commercial Glazing Contractors Inc. may contact you by phone or email about your bid request. A bid request is not a contract. We use your information only to respond to your request and run your project, and we never sell or share it. See our [Privacy Policy](/privacy/).

Builder rules for the form:
- The SMS box must never be pre-checked, and the form must submit fine with it unchecked.
- Store the consent record with the lead: checkbox value, the exact consent text version, timestamp, IP/user agent, and the phone number it applies to. Keep it as long as the lead record.
- Don't send SMS to anyone whose `sms_consent` is false.
- Mark required fields in text, give each input a visible `<label>`, and show errors in words next to the field (the accessibility page says this is done).

## Owner / lawyer checklist

- [ ] **Business address.** Legal pages show 22746 Queensbury Ct, Wildomar, CA 92595 (the CSLB mailing address). Confirm it's OK to publish, or give a PO box / office address to use instead.
- [ ] **General liability insurance.** CSLB only lists the bond and workers' comp. If you carry GL (and umbrella), decide whether to publish carrier and limits on `/license/`. Policy numbers are intentionally not shown. The page says GCs can request COIs by email; confirm that's true.
- [ ] **Officer listing.** Kelly Elizabeth Hernandez is listed on CSLB as an officer but is not named on the site. Add if wanted.
- [ ] **Email service provider and SMS provider names.** The privacy policy names Vercel and describes the email and SMS providers generically. Once chosen (e.g. Resend, Twilio), you can name them; generic is legally fine as long as the description stays accurate.
- [ ] **A2P 10DLC registration.** Before sending any business SMS from a 10-digit number, register the brand and campaign with your SMS provider (The Campaign Registry). Use the privacy page `/privacy/#sms` as the opt-in/privacy URL and the checkbox text above as the sample opt-in. Unregistered traffic gets filtered or blocked.
- [ ] **SMS opt-out handling.** STOP, END, CANCEL, UNSUBSCRIBE, QUIT, and plain-language "stop texting me" must all be honored. Send one confirmation, then nothing. HELP must return the business name, phone and email.
- [ ] **CAN-SPAM.** Bid follow-ups are transactional. If you ever send newsletters or promotional email, you need a separate opt-in, the physical mailing address in every email, a working unsubscribe honored within 10 business days, and an update to the privacy policy (it currently says leads are not added to marketing lists).
- [ ] **CCPA/CPRA applicability.** CCPA likely doesn't legally apply yet (thresholds: annual revenue over roughly $26.6M (indexed for inflation each year), or 100k+ CA consumers' data, or 50%+ revenue from selling/sharing data). The policy honors the rights voluntarily. Keep it that way; it costs little and avoids disputes. Respond to requests within 45 days and confirm receipt within 10 business days, as the policy promises.
- [ ] **Retention.** Policy promises: unconverted leads deleted 24 months after last contact; bid/project records kept up to 7 years. The CRM needs a way (even manual, quarterly) to actually delete old unconverted leads.
- [ ] **Global Privacy Control.** Nothing to build since nothing is sold or shared, but don't add Meta/Google/TikTok pixels or ad retargeting without rewriting the privacy policy first. Adding them would mean "sharing" under CCPA and require an opt-out link and GPC handling.
- [ ] **Spanish versions.** Not legally required for this site (English-only marketing). Required only if you start advertising in Spanish; then translated privacy/SMS terms are expected. Consider for crew-facing or customer-facing Spanish content later.
- [ ] **SB 478 (junk fees / all-in pricing).** Not applicable: no prices are shown and work is B2B under contract. Revisit if the site ever shows prices or fees.
- [ ] **B&P §7159.** Doesn't apply to commercial work (home improvement only). Terms page says so and says all work is under written contract. If CGC ever does residential home improvement over $500, those contracts need the §7159 form requirements.
- [ ] **License number in ads.** B&P §7030.5 requires the license number on advertising, including the website, social profiles, vehicles and business cards. The footer covers the site; check the Instagram bio and trucks.
- [ ] **ADA demand-letter risk.** California sees a lot of web-accessibility demand letters (ADA + Unruh Act). Risk is lower for a B2B contractor site but not zero. Main exposures: missing alt text, unlabeled form fields, keyboard traps, motion that can't be stopped, low-contrast text over photos, uncaptioned video with speech. The accessibility page makes specific claims (keyboard access, reduced-motion fallback, alt text, AA contrast, 360px reflow, 400% zoom, form labels/errors, captions where there's speech). The builder must make each one true before launch, and someone should run an axe/Lighthouse pass plus a keyboard-only walkthrough. Don't install an accessibility overlay widget; they don't fix the issues and are often cited in lawsuits.
- [ ] **Photos and named clients.** Terms page says photos are CGC's own work and naming a GC/owner doesn't imply endorsement. Confirm no contract with Pacific Tusk, Irvine Company, Meritage, Esplanade, Ono Hawaiian BBQ etc. restricts publicity. If any workers' faces are prominent, get their OK.
- [ ] **Venue.** Terms set Riverside County courts (Wildomar is in Riverside County). Confirm with counsel; construction contracts will have their own dispute clauses.
- [ ] **Liability cap.** Terms cap website-use liability at $100. Confirm with counsel. It explicitly does not touch construction liability.
- [ ] **Annual review.** Recheck CSLB data on `/license/` when the license renews (expires Sept 30, 2027) and update the "Data as listed by CSLB on ..." date. Re-review the accessibility statement at least yearly.
