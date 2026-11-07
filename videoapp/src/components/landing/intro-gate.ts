export const INTRO_KEY = "rf-intro";

/**
 * Runs in <head> (app/layout.tsx), before the first paint, and decides whether the landing page's loading screen
 * (<Intro/>) plays: once per browser tab, never for reduced motion, crawlers or automated browsers (tests),
 * always with `?intro`. It only adds a class to <html>, so the
 * server HTML and the hydrated tree stay the same.
 */
export const INTRO_GATE = `try{var d=document.documentElement,q=location.search.indexOf('intro')>-1;if(location.pathname==='/'&&(q||(!sessionStorage.getItem('${INTRO_KEY}')&&!navigator.webdriver&&!/bot|crawl|spider|slurp/i.test(navigator.userAgent)&&!matchMedia('(prefers-reduced-motion: reduce)').matches)))d.classList.add('intro-on')}catch(e){}`;
