// Plain-language legal templates. HAVE A LAWYER REVIEW THESE BEFORE LAUNCH (see HANDOFF.md).
import { REFERRAL_BONUS_CREDITS } from "@/lib/pricing";

export interface LegalDoc {
  title: string;
  description: string;
  sections: { h: string; p: string[] }[];
}

export function legalDocs(brand: string, company: string, email: string): Record<string, LegalDoc> {
  return {
    terms: {
      title: "Terms of Service",
      description: `The rules for using ${brand}.`,
      sections: [
        { h: "Who we are", p: [`${brand} is operated by ${company} ("we", "us"). By creating an account or using the service you agree to these Terms. If you don't agree, don't use ${brand}.`] },
        { h: "Your account", p: ["You must be at least 18 years old. Keep your login secure; you're responsible for activity on your account. One free welcome bonus per person and device."] },
        { h: "Credits", p: ["Generations are paid for with credits. The cost of each generation is shown before you start. Credits are deducted when a generation starts and refunded automatically if it fails.", "Credits have no cash value, can't be transferred, and don't expire while your account is open. Monthly plans add credits each billing cycle and renew until cancelled."] },
        { h: "Your content", p: ["You keep ownership of the photos and text you upload (\"Inputs\"). You grant us a limited license to process Inputs to provide the service, including sending them to our AI model providers.", "Subject to these Terms and our providers' terms, you may use videos and images you generate (\"Outputs\") for any lawful purpose, including commercial advertising. AI outputs may not be unique and similar outputs may be generated for others.", "You're responsible for your Inputs and how you use Outputs, including labeling AI-generated content where platforms or laws require it."] },
        { h: "Acceptable use", p: ["You must follow our Acceptable Use Policy. We may refuse, remove or block content and suspend accounts that violate it, without refund of used credits."] },
        { h: "Free plan watermark", p: ["Outputs generated on the free plan include a small watermark. Removing it is not permitted."] },
        { h: "Availability", p: ["The service relies on third-party AI providers and may change, be interrupted or have models added or removed. We provide the service \"as is\" without warranties to the extent permitted by law."] },
        { h: "Liability", p: [`To the extent permitted by law, ${company}'s total liability is limited to the amount you paid us in the 12 months before the claim.`] },
        { h: "Changes and contact", p: [`We may update these Terms; material changes will be announced in the app or by email. Questions: ${email}.`] },
      ],
    },
    privacy: {
      title: "Privacy Policy",
      description: `How ${brand} collects and uses your data.`,
      sections: [
        { h: "What we collect", p: ["Account data (email, login method), billing data (handled by Stripe — we never see your full card number), the photos and prompts you submit, the videos you generate, and usage data (pages viewed, generations started, purchases).", "To prevent abuse of free credits we store a salted hash of your IP address and a device identifier cookie at signup — never the raw IP."] },
        { h: "How we use it", p: ["To run the service, generate your content, process payments, send transactional emails (receipts, \"your video is ready\"), prevent fraud and abuse, enforce our policies, and improve the product."] },
        { h: "Who we share it with", p: ["Service providers acting for us: Supabase (database, auth, storage), Vercel (hosting), Stripe (payments), AI model providers such as fal.ai (to generate your content), OpenAI (content moderation), Resend (email), PostHog (analytics). We don't sell your personal data."] },
        { h: "Consent records", p: ["When you upload a photo we record your confirmation that you own it and have consent from anyone shown, with a timestamp, IP and browser, so we can respond to complaints."] },
        { h: "Retention", p: ["Generated outputs and uploads are kept while your account is open. Delete requests remove your account data within 30 days, except records we must keep for legal, tax or fraud-prevention reasons."] },
        { h: "Your rights", p: [`You can access, correct, export or delete your data, and object to processing, by emailing ${email}. Depending on where you live (e.g. GDPR, CCPA) you may have additional rights.`] },
        { h: "Cookies", p: ["We use essential cookies for login and abuse prevention, and analytics cookies to understand how the product is used."] },
      ],
    },
    "acceptable-use": {
      title: "Acceptable Use Policy",
      description: `What you can and can't make with ${brand}.`,
      sections: [
        { h: "Never allowed", p: [
          "Sexual or nude content of anyone, of any kind.",
          "Any content involving minors in a sexual, suggestive, violent or exploitative way. Uploading photos of anyone under 18 is not allowed. We report child sexual abuse material to the authorities.",
          "Identifiable real people without their consent — including celebrities, politicians and other public figures — and any deepfake meant to deceive, defame, harass or impersonate.",
          "Trademarked characters, logos or brands you don't own or have rights to.",
          "Harassment, hate, violence, self-harm, illegal products or services, scams, misleading health or financial claims, and election misinformation.",
        ] },
        { h: "Photos of people", p: ["You may only upload photos of yourself, or of adults who have given you permission. You confirm this every time you upload."] },
        { h: "Advertising", p: ["Ads you make must follow the rules of the platform you publish on, including AI-content disclosure requirements, and must not make false claims about products."] },
        { h: "Enforcement", p: [`We use automated and manual moderation. Violations can lead to content removal, loss of credits and account termination. Report abuse to ${email}.`] },
      ],
    },
    refunds: {
      title: "Refund Policy",
      description: `${brand} refunds and cancellations.`,
      sections: [
        { h: "Failed generations", p: ["If a generation fails, the credits it used are returned to your balance automatically."] },
        { h: "Credit packs", p: [`Unused credit packs can be refunded in full within 14 days of purchase — email ${email} from your account email. Once any credits from a pack have been used, that pack is non-refundable. Bonus and referral credits (${REFERRAL_BONUS_CREDITS} per referral) have no cash value.`] },
        { h: "Monthly plan", p: ["Cancel anytime from Billing → Manage subscription. You keep the credits already granted; no further charges are made. Partial months are not refunded."] },
        { h: "Unhappy with a result?", p: ["AI output varies. If a clip is clearly broken (corrupted file, wrong format) contact us and we'll return the credits. Different-than-expected creative results aren't refundable, which is why every generation shows its cost up front."] },
        { h: "Chargebacks", p: ["Please contact us before disputing a charge — we resolve legitimate issues quickly. Accounts with fraudulent chargebacks are closed."] },
      ],
    },
  };
}
