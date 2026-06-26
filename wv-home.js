(function initEntranceWhooshes() {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
        return;
    }

    const scene = document.querySelector('.wv-scene');
    if (scene) {
        scene.addEventListener('pointerdown', () => wvAudio.unlock(), { passive: true });
        scene.addEventListener('touchstart', () => wvAudio.unlock(), { passive: true });
    }

    // Matches CSS animation delays — queued until audio unlocks on first tap.
    const arrivals = [
        { ms: 400, id: 'v' },
        { ms: 1100, id: 'w' },
        { ms: 2750, id: 'illians' },
        { ms: 3650, id: 'anted' }
    ];

    const played = new Set();

    function scheduleWhoosh(entry) {
        setTimeout(() => {
            if (played.has(entry.id)) {
                return;
            }
            played.add(entry.id);
            wvAudio.playWhooshArrival();
        }, entry.ms);
    }

    arrivals.forEach(scheduleWhoosh);

    function bindAnimationWhoosh(element, animationName, id) {
        if (!element) {
            return;
        }

        element.addEventListener('animationstart', (event) => {
            if (event.animationName !== animationName || played.has(id)) {
                return;
            }
            played.add(id);
            wvAudio.playWhooshArrival();
        });
    }

    bindAnimationWhoosh(document.querySelector('.wv-v'), 'wv-v-pop', 'v');
    bindAnimationWhoosh(document.querySelector('.wv-w'), 'wv-w-pop', 'w');
    bindAnimationWhoosh(document.querySelector('.wv-title-suffix'), 'wv-title-pop', 'illians');
    bindAnimationWhoosh(document.querySelector('.wv-title-mid'), 'wv-title-pop', 'anted');
})();

const revealBtn = document.getElementById('wv-do-not-press-btn');
const revealBtnWrap = document.querySelector('.wv-do-not-press-wrap');
const scene = document.querySelector('.wv-scene');
const explosion = document.getElementById('wv-explosion');

if (revealBtn && explosion) {
    let explosionPlaying = false;

    function delay(ms) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }

    async function triggerExplosionThenHub() {
        if (explosionPlaying) {
            return;
        }

        wvAudio.unlock();
        explosionPlaying = true;
        revealBtn.disabled = true;
        revealBtnWrap.classList.add('is-exploding');
        explosion.setAttribute('aria-hidden', 'false');
        explosion.classList.add('is-active');
        scene.classList.add('is-shaking');

        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!reducedMotion) {
            await delay(420);
            wvAudio.playBoom();
        }

        await delay(reducedMotion ? 200 : 3000);

        window.location.href = 'hub.html';
    }

    revealBtn.addEventListener('click', triggerExplosionThenHub);
}
