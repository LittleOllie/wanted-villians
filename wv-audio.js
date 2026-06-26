/**
 * Procedural cartoon SFX — no external audio files required.
 * Respects prefers-reduced-motion (treated as silent mode).
 */
const wvAudio = {
    ctx: null,
    muted: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    _unlockListeners: [],
    _soundQueue: [],

    unlock() {
        if (this.muted) {
            return false;
        }

        const created = !this.ctx;

        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) {
                return false;
            }

            this.ctx = new AudioCtx();
        }

        if (created) {
            this._notifyUnlock();
        }

        this._flushSoundQueue();
        return true;
    },

    onUnlock(fn) {
        if (this.ctx) {
            this.whenReady(fn);
        } else {
            this._unlockListeners.push(fn);
        }
    },

    _notifyUnlock() {
        const listeners = this._unlockListeners.splice(0);
        listeners.forEach((fn) => fn());
    },

    whenReady(fn) {
        if (this.muted || !this.ctx) {
            return;
        }

        if (this.ctx.state === 'suspended') {
            this.ctx.resume().then(fn);
        } else {
            fn();
        }
    },

    isReady() {
        return !this.muted && !!this.ctx && this.ctx.state !== 'closed';
    },

    _ensureReady() {
        if (this.muted || !this.ctx) {
            return false;
        }

        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }

        return this.ctx.state === 'running';
    },

    _enqueueOrPlay(playFn) {
        if (this.muted) {
            return;
        }

        if (!this.ctx) {
            this._soundQueue.push(playFn);
            return;
        }

        this.whenReady(playFn);
    },

    _flushSoundQueue() {
        if (this.muted || !this._soundQueue.length) {
            return;
        }

        const queue = this._soundQueue.splice(0);
        this.whenReady(() => {
            queue.forEach((playFn, index) => {
                setTimeout(playFn, index * 120);
            });
        });
    },

    _makeNoiseBuffer(durationSec, shapeFn) {
        const bufferSize = Math.floor(this.ctx.sampleRate * durationSec);
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let brown = 0;

        for (let i = 0; i < bufferSize; i += 1) {
            brown = brown * 0.88 + (Math.random() * 2 - 1) * 0.12;
            const envelope = shapeFn ? shapeFn(i / bufferSize) : 1 - i / bufferSize;
            data[i] = brown * envelope;
        }

        return buffer;
    },

    playBoom() {
        this.unlock();
        this.whenReady(() => {
            if (!this.ctx) {
                return;
            }

            const t = this.ctx.currentTime;
            const master = this.ctx.createGain();
            master.gain.setValueAtTime(0.0001, t);
            master.gain.exponentialRampToValueAtTime(0.62, t + 0.018);
            master.gain.exponentialRampToValueAtTime(0.14, t + 0.55);
            master.gain.exponentialRampToValueAtTime(0.04, t + 1.4);
            master.gain.exponentialRampToValueAtTime(0.0001, t + 2.85);
            master.connect(this.ctx.destination);

            const addSubDrop = (startHz, endHz, peak, duration, delay = 0) => {
                const start = t + delay;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(startHz, start);
                osc.frequency.exponentialRampToValueAtTime(endHz, start + duration * 0.7);
                gain.gain.setValueAtTime(0.0001, start);
                gain.gain.exponentialRampToValueAtTime(peak, start + 0.015);
                gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
                osc.connect(gain);
                gain.connect(master);
                osc.start(start);
                osc.stop(start + duration + 0.05);
            };

            // Initial atomic flash / shockwave
            const flashBuffer = this._makeNoiseBuffer(0.12, (p) => 1 - p * 0.85);
            const flash = this.ctx.createBufferSource();
            flash.buffer = flashBuffer;
            const flashFilter = this.ctx.createBiquadFilter();
            flashFilter.type = 'bandpass';
            flashFilter.frequency.setValueAtTime(2200, t);
            flashFilter.frequency.exponentialRampToValueAtTime(180, t + 0.1);
            flashFilter.Q.value = 0.5;
            const flashGain = this.ctx.createGain();
            flashGain.gain.setValueAtTime(0.85, t);
            flashGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
            flash.connect(flashFilter);
            flashFilter.connect(flashGain);
            flashGain.connect(master);
            flash.start(t);
            flash.stop(t + 0.13);

            // Fireball roar — rising then falling wind
            const roarBuffer = this._makeNoiseBuffer(1.85, (p) => {
                if (p < 0.08) {
                    return p / 0.08;
                }
                return Math.pow(1 - p, 0.55);
            });
            const roar = this.ctx.createBufferSource();
            roar.buffer = roarBuffer;
            const roarFilter = this.ctx.createBiquadFilter();
            roarFilter.type = 'lowpass';
            roarFilter.frequency.setValueAtTime(120, t + 0.04);
            roarFilter.frequency.exponentialRampToValueAtTime(920, t + 0.35);
            roarFilter.frequency.exponentialRampToValueAtTime(55, t + 1.75);
            roarFilter.Q.value = 0.9;
            const roarGain = this.ctx.createGain();
            roarGain.gain.setValueAtTime(0.0001, t + 0.04);
            roarGain.gain.exponentialRampToValueAtTime(0.95, t + 0.12);
            roarGain.gain.exponentialRampToValueAtTime(0.0001, t + 1.9);
            roar.connect(roarFilter);
            roarFilter.connect(roarGain);
            roarGain.connect(master);
            roar.start(t + 0.04);
            roar.stop(t + 1.95);

            // Deep sub rumble — mushroom cloud tail
            addSubDrop(62, 16, 1.05, 2.4);
            addSubDrop(48, 12, 0.55, 2.8, 0.08);

            // Delayed ground shockwave
            const shockBuffer = this._makeNoiseBuffer(0.55, (p) => Math.pow(1 - p, 0.35));
            const shock = this.ctx.createBufferSource();
            shock.buffer = shockBuffer;
            const shockFilter = this.ctx.createBiquadFilter();
            shockFilter.type = 'lowpass';
            shockFilter.frequency.setValueAtTime(260, t + 0.28);
            shockFilter.frequency.exponentialRampToValueAtTime(45, t + 0.75);
            shockFilter.Q.value = 0.7;
            const shockGain = this.ctx.createGain();
            shockGain.gain.setValueAtTime(0.0001, t + 0.28);
            shockGain.gain.exponentialRampToValueAtTime(0.72, t + 0.34);
            shockGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
            shock.connect(shockFilter);
            shockFilter.connect(shockGain);
            shockGain.connect(master);
            shock.start(t + 0.28);
            shock.stop(t + 0.95);
        });
    },

    _playWhooshImpl(options = {}) {
        if (!this._ensureReady()) {
            return;
        }

        const {
            lowHz = 240,
            highHz = 2600,
            peak = 0.34,
            duration = 0.26
        } = options;
        const t = this.ctx.currentTime;
        const bufferSize = Math.floor(this.ctx.sampleRate * duration);
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i += 1) {
            data[i] = Math.random() * 2 - 1;
        }

        const src = this.ctx.createBufferSource();
        src.buffer = buffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(lowHz, t);
        filter.frequency.exponentialRampToValueAtTime(highHz, t + duration * 0.55);
        filter.frequency.exponentialRampToValueAtTime(lowHz * 0.8, t + duration);
        filter.Q.value = 0.75;
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(peak, t + 0.025);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
        src.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        src.start(t);
        src.stop(t + duration + 0.02);
    },

    playWhooshArrival() {
        this._enqueueOrPlay(() => {
            this._playWhooshImpl({ lowHz: 180, highHz: 2800, peak: 0.4, duration: 0.32 });
        });
    },

    playWhoosh() {
        this._enqueueOrPlay(() => {
            this._playWhooshImpl();
        });
    }
};

function wvUnlockAudio() {
    wvAudio.unlock();
}

document.addEventListener('pointerdown', wvUnlockAudio, { passive: true });
document.addEventListener('touchstart', wvUnlockAudio, { passive: true });
document.addEventListener('keydown', wvUnlockAudio);
