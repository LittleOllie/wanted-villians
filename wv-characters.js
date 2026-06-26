const WV_SLIDES = [
    'images/wv1.jpeg',
    'images/wv4.jpeg',
    'images/wv5.png',
    'images/wv6.jpeg'
];

const gallery = document.getElementById('wv-gallery');
const gallerySlide = document.getElementById('wv-gallery-slide');
const galleryImg = document.getElementById('wv-gallery-img');
const galleryCounter = document.getElementById('wv-gallery-counter');
const prevBtn = document.getElementById('wv-gallery-prev');
const nextBtn = document.getElementById('wv-gallery-next');
const closeBtn = document.getElementById('wv-gallery-close');
const scene = document.querySelector('.wv-scene');

if (!gallery) {
    // Not on the characters page.
} else {
    let currentIndex = 0;
    let isAnimating = false;
    let galleryOpen = false;

    function updateCounter() {
        galleryCounter.textContent = `${currentIndex + 1} / ${WV_SLIDES.length}`;
    }

    function waitForAnimation(element) {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return Promise.resolve();
        }

        return new Promise((resolve) => {
            const onEnd = (event) => {
                if (event.target !== element) {
                    return;
                }
                element.removeEventListener('animationend', onEnd);
                resolve();
            };
            element.addEventListener('animationend', onEnd);
        });
    }

    function loadSlideImage(src) {
        return new Promise((resolve) => {
            if (galleryImg.getAttribute('src') === src && galleryImg.complete) {
                resolve();
                return;
            }

            galleryImg.onload = () => resolve();
            galleryImg.onerror = () => resolve();
            galleryImg.src = src;
        });
    }

    function clearSlideClasses() {
        gallerySlide.classList.remove(
            'is-entering',
            'is-entering-next',
            'is-entering-prev',
            'is-exiting-next',
            'is-exiting-prev'
        );
    }

    async function showSlide(index, direction) {
        if (isAnimating) {
            return;
        }

        isAnimating = true;
        clearSlideClasses();

        if (direction) {
            gallerySlide.classList.add(direction === 1 ? 'is-exiting-next' : 'is-exiting-prev');
            await waitForAnimation(gallerySlide);
        }

        currentIndex = index;
        await loadSlideImage(WV_SLIDES[currentIndex]);
        updateCounter();

        clearSlideClasses();
        if (direction === 1) {
            gallerySlide.classList.add('is-entering-next');
        } else if (direction === -1) {
            gallerySlide.classList.add('is-entering-prev');
        } else {
            gallerySlide.classList.add('is-entering');
        }

        await waitForAnimation(gallerySlide);
        clearSlideClasses();
        isAnimating = false;
    }

    function closeGallery() {
        window.location.href = 'hub.html';
    }

    function openGallery() {
        if (galleryOpen) {
            return;
        }

        galleryOpen = true;
        gallery.setAttribute('aria-hidden', 'false');
        gallery.classList.add('is-open');
        scene.classList.add('is-dimmed');

        currentIndex = 0;
        showSlide(0, 0);
    }

    function goNext() {
        if (!galleryOpen || isAnimating) {
            return;
        }

        const nextIndex = (currentIndex + 1) % WV_SLIDES.length;
        showSlide(nextIndex, 1);
    }

    function goPrev() {
        if (!galleryOpen || isAnimating) {
            return;
        }

        const prevIndex = (currentIndex - 1 + WV_SLIDES.length) % WV_SLIDES.length;
        showSlide(prevIndex, -1);
    }

    prevBtn.addEventListener('click', goPrev);
    nextBtn.addEventListener('click', goNext);
    closeBtn.addEventListener('click', closeGallery);
    galleryImg.addEventListener('click', goNext);

    document.addEventListener('keydown', (event) => {
        if (!galleryOpen) {
            return;
        }

        if (event.key === 'Escape') {
            closeGallery();
            return;
        }

        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
            goNext();
        }

        if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
            goPrev();
        }
    });

    openGallery();
}
