export const isIOSSafari = () => {
    if (typeof window === 'undefined') return false;

    const ua = window.navigator.userAgent.toLowerCase();

    // 1. Detect iOS (iPhone/iPod)
    const isIphone = /iphone|ipod/.test(ua);

    // 2. Detect iPad (including iPadOS 13+ which reports as Macintosh)
    // Check for "MacIntel" platform AND usage of touch points.
    const isIpad = /ipad/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    const isIOS = isIphone || isIpad;

    // 3. Detect Safari (exclude Chrome 'crios', Firefox 'fxios', Edge 'EdgiOS', Opera 'OPiOS'/'OPT', DuckDuckGo 'DDC')
    // We want to target "Pure" Safari which has the issues.
    const isExcluded = ua.includes('crios') ||
        ua.includes('fxios') ||
        ua.includes('edgios') ||
        ua.includes('opios') ||
        ua.includes('opt') ||
        ua.includes('ddc'); // DuckDuckGo often

    const isSafari = ua.includes('safari') && !isExcluded;

    return isIOS && isSafari;
};

export const isBrave = async () => {
    if (typeof window === 'undefined') return false;
    // Brave often exposes navigator.brave, even on iOS in some versions, or we rely on user reports.
    // However, if strict parsing fails, we assume Safari.
    // Notes: Brave iOS standard UA is indistinguishable from Safari. 
    // Trying navigator.brave.isBrave() is the standard way.
    try {
        if (navigator.brave && typeof navigator.brave.isBrave === 'function') {
            return await navigator.brave.isBrave();
        }
    } catch (e) { }
    return false;
};
