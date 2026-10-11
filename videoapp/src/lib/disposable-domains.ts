// Common disposable / throwaway email domains (BUILD_PLAN Phase 5 abuse limits). Extend as abuse appears.
export const DISPOSABLE_DOMAINS = new Set([
  "10minutemail.com", "10minutemail.net", "20minutemail.com", "33mail.com", "anonaddy.me", "burnermail.io",
  "byom.de", "discard.email", "discardmail.com", "dispostable.com", "dropmail.me", "emailondeck.com",
  "fakeinbox.com", "fakemail.net", "getairmail.com", "getnada.com", "guerrillamail.biz", "guerrillamail.com",
  "guerrillamail.de", "guerrillamail.info", "guerrillamail.net", "guerrillamail.org", "guerrillamailblock.com",
  "harakirimail.com", "inboxbear.com", "incognitomail.org", "jetable.org", "mail.tm", "mail-temp.com",
  "mailcatch.com", "maildrop.cc", "mailinator.com", "mailinator.net", "mailinator2.com", "mailnesia.com",
  "mailpoof.com", "mailsac.com", "mintemail.com", "moakt.com", "mohmal.com", "mytemp.email", "nada.email",
  "throwawaymail.com", "trashmail.com", "trashmail.de", "trashmail.io", "trashmail.net", "spamgourmet.com",
  "sharklasers.com", "grr.la", "pokemail.net", "spam4.me", "temp-mail.io", "temp-mail.org", "tempail.com",
  "tempinbox.com", "tempm.com", "tempmail.com", "tempmail.dev", "tempmail.net", "tempmail.plus", "tempmailo.com",
  "tempr.email", "tmpmail.net", "tmpmail.org", "yopmail.com", "yopmail.fr", "yopmail.net", "cool.fr.nf",
  "jetable.fr.nf", "nospam.ze.tc", "nomail.xl.cx", "mega.zik.dj", "speed.1s.fr", "courriel.fr.nf",
  "moncourrier.fr.nf", "monemail.fr.nf", "monmail.fr.nf", "emailfake.com", "fakemailgenerator.com",
  "luxusmail.org", "minuteinbox.com", "mailnull.com", "spambox.us", "trbvm.com", "linshiyouxiang.net",
  "emltmp.com", "inboxkitten.com", "1secmail.com", "1secmail.net", "1secmail.org", "esiix.com", "wwjmp.com",
  "xojxe.com", "yoggm.com", "vjuum.com", "laafd.com", "txcct.com", "rteet.com", "dpptd.com", "kzccv.com",
  "qiott.com", "wuuvo.com", "icznn.com", "ezztt.com", "tmail.ws", "tmails.net", "tempmailaddress.com",
  "mailto.plus", "fexpost.com", "fexbox.org", "mailbox.in.ua", "rover.info", "chitthi.in", "fextemp.com",
  "any.pink", "merepost.com", "spymail.one", "dmailx.com", "smail.pw", "crazymailing.com", "armyspy.com",
  "cuvox.de", "dayrep.com", "einrot.com", "fleckens.hu", "gustr.com", "jourrapide.com", "rhyta.com",
  "superrito.com", "teleworm.us",
]);

export function isDisposableEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase().trim();
  if (!domain) return true;
  if (DISPOSABLE_DOMAINS.has(domain)) return true;
  // subdomains of known services (e.g. abc.mailinator.com)
  const parts = domain.split(".");
  for (let i = 1; i < parts.length - 1; i++) if (DISPOSABLE_DOMAINS.has(parts.slice(i).join("."))) return true;
  return false;
}
