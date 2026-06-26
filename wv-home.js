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

        explosionPlaying = true;
        revealBtn.disabled = true;
        revealBtnWrap.classList.add('is-exploding');
        explosion.setAttribute('aria-hidden', 'false');
        explosion.classList.add('is-active');
        scene.classList.add('is-shaking');

        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        await delay(reducedMotion ? 200 : 3000);

        window.location.href = 'hub.html';
    }

    revealBtn.addEventListener('click', triggerExplosionThenHub);
}
