const circle = document.getElementById('circle');
const circleBorder = document.getElementById('circleBorder');
const footerCircle = document.getElementById('footerCircle');
const footerCircleBorder = document.getElementById('footerCircleBorder');
const nav = document.getElementById('nav');
const scrollHint = document.getElementById('scrollHint');
const widget = document.getElementById('widget');
const widgetTextarea = document.getElementById('widgetTextarea');
const captureBtn = document.getElementById('captureBtn');

const footerSection = document.querySelector('.footer-section');

// ─── MAILTO HANDLER ───
captureBtn.addEventListener('click', () => {
    const message = widgetTextarea.value.trim();
    if (!message) return;

    const email   = 'esanches.contato@gmail.com';
    const subject = encodeURIComponent('Formulário de contato - Portfólio');
    const body    = encodeURIComponent(message);

    window.open(`mailto:${email}?subject=${subject}&body=${body}`, '_blank');
});

// ─── WIDGET: focus expand + textarea auto-grow ───
const MAX_TEXTAREA_HEIGHT = 160; // px — matches CSS max-height

function autoGrow() {
    // Collapse to auto so scrollHeight reflects true content height
    widgetTextarea.style.height = 'auto';
    const next = Math.min(widgetTextarea.scrollHeight, MAX_TEXTAREA_HEIGHT);
    widgetTextarea.style.height = next + 'px';
}

widgetTextarea.addEventListener('input', autoGrow);

widgetTextarea.addEventListener('focus', () => {
    widget.classList.add('focused');
});

widgetTextarea.addEventListener('blur', () => {
    if (!widgetTextarea.value) widget.classList.remove('focused');
});

// ─── ENTRANCE SEQUENCE ───
requestAnimationFrame(() => {
    setTimeout(() => circle.classList.add('risen'), 80);
});

setTimeout(() => nav.classList.add('visible'), 300);

const anims = ['a0', 'a1', 'a2', 'a3', 'a4'];
anims.forEach((id, i) => {
    setTimeout(() => {
        const el = document.getElementById(id) || document.querySelector('[data-a="' + id + '"]');
        if (el) el.classList.add('show');
    }, 700 + i * 130);
});

setTimeout(() => scrollHint.classList.add('s-show'), 1800);

// ─── SCROLL BEHAVIOUR ───
const VH = window.innerHeight;
const PARALLAX = 0.40;

// Footer circle settings
const FC_HIDDEN = 100;
const FC_RISEN = 88;

function onScroll() {
    const y = window.scrollY;
    const docH = document.documentElement.scrollHeight;
    const maxScroll = docH - VH;

    // ── Nav: transparent at top, frosted pill on scroll ──
    if (y > 40) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }

    // ── Hero circle: parallax until merge point, then fade out ──
    const MERGE_POINT = VH * 0.75;
    const FADE_START = VH * 0.55;   // opacity starts dropping here
    const FADE_END = VH * 1.10;   // fully gone by here

    if (window.innerWidth > 768) {
        if (y <= MERGE_POINT) {
            circle.style.transform =
                `translateX(-50%) translateY(calc(-8% - ${y * PARALLAX}px))`;
        } else {
            const mergedOffset = MERGE_POINT * PARALLAX;
            circle.style.transform =
                `translateX(-50%) translateY(calc(-8% - ${mergedOffset}px))`;
        }
    }

    // Fade hero circle out as user scrolls past the hero viewport
    const heroOpacity = 1 - Math.max(0, Math.min(1, (y - FADE_START) / (FADE_END - FADE_START)));
    circle.style.opacity = heroOpacity;

    // ── Footer circle reveal ──
    const distFromBottom = maxScroll - y;
    const riseRange = VH * 0.4;

    const ft = Math.max(
        0,
        Math.min(
            1,
            1 - distFromBottom / riseRange
        )
    );

    footerCircle.style.transform =
        `translateX(-50%) translateY(${FC_HIDDEN - ft * (FC_HIDDEN - FC_RISEN)}%)`;

    if (ft > 0.3) {
        footerCircle.classList.add('glowing');
    } else {
        footerCircle.classList.remove('glowing');
    }

    // ── Scroll hint ──
    if (y > 40) {
        scrollHint.classList.add('s-hide');
    } else {
        scrollHint.classList.remove('s-hide');
    }
}

window.addEventListener('scroll', onScroll, { passive: true });

// Run once on load
onScroll();

// ─── PROJECT STACK SCROLL ANIMATION ───
(function () {
    const scene  = document.querySelector('.projects-scene');
    const pin    = document.querySelector('.projects-pin');
    const header = document.querySelector('.projects-header');
    // Card 0 rests at translateY(0) via CSS — only cards 1-N are driven by JS.
    const cards  = Array.from(document.querySelectorAll('.project-card')).slice(1);

    if (!scene || !pin || !cards.length) return;

    const BREAKPOINT    = 768;
    const LIP           = 26;   // px each card peeks above the next
    const EASE_FRACTION = 0.52; // portion of a scroll slot used for the slide-in

    // ── DESKTOP ──────────────────────────────────────────────────────────────
    // .projects-pin is position:sticky, top:0, height:100vh.
    // .projects-scene needs an explicit height so there is scroll room.
    // Cards slide up from below the stack area as the user scrolls each slot.

    function desktopSetHeight() {
        const SCROLL_PER_CARD = window.innerHeight;
        const TRAIL           = window.innerHeight * 0.8;
        const pinH            = pin.offsetHeight;
        scene.style.height    = pinH + (cards.length - 1) * SCROLL_PER_CARD + TRAIL + 'px';
    }

    function desktopUpdate() {
        const sceneTop   = scene.getBoundingClientRect().top;
        const scrolled   = Math.max(0, -sceneTop);
        const headerH    = (header ? header.offsetHeight : 0) + 40;
        const stackAreaH = pin.offsetHeight - headerH;
        const SCROLL_PER_CARD = window.innerHeight;

        cards.forEach((card, i) => {
            const cardIndex = parseInt(card.dataset.card, 10);
            const slotStart = i * SCROLL_PER_CARD;
            let ty;

            if (scrolled < slotStart) {
                // Not yet — wait below the stack area.
                ty = stackAreaH;
            } else {
                const restY    = cardIndex * LIP;
                const progress = Math.min(1, (scrolled - slotStart) / (SCROLL_PER_CARD * EASE_FRACTION));
                const ease     = 1 - Math.pow(1 - progress, 3);
                ty = stackAreaH - (stackAreaH - restY) * ease;
            }

            card.style.transform = `translateY(${ty}px)`;
            card.style.zIndex    = 10 + i;
        });
    }

    function desktopInit() {
        // Reset any mobile overrides.
        scene.style.height = '';
        cards.forEach(c => { c.style.cssText = ''; });

        // Set height synchronously — sticky needs scroll room before first paint.
        desktopSetHeight();
        desktopUpdate();

        window.addEventListener('scroll', desktopUpdate, { passive: true });
        window.addEventListener('resize', onDesktopResize);
    }

    function onDesktopResize() {
        requestAnimationFrame(() => { desktopSetHeight(); desktopUpdate(); });
    }

    function desktopDestroy() {
        window.removeEventListener('scroll', desktopUpdate);
        window.removeEventListener('resize', onDesktopResize);
    }

    // ── MOBILE ───────────────────────────────────────────────────────────────
    // CSS media query already switches .projects-pin to position:relative and
    // .project-card to position:relative / transform:none / height:auto.
    // Nothing for JS to do except clear any desktop state.

    function mobileInit() {
        scene.style.height = '';
        cards.forEach(c => { c.style.cssText = ''; });
    }

    // ── ORCHESTRATION ────────────────────────────────────────────────────────

    let activeMode = null;

    function run() {
        const mode = window.innerWidth <= BREAKPOINT ? 'mobile' : 'desktop';
        if (mode === activeMode) return;

        // Tear down previous mode.
        if (activeMode === 'desktop') desktopDestroy();

        activeMode = mode;

        if (mode === 'desktop') {
            desktopInit();
        } else {
            mobileInit();
        }
    }

    run();
    window.addEventListener('resize', run);
})();
// ─── POINTER TRACKING ───
function handlePointer(clientX, clientY) {

    // ── Hero circle border glow ──
    const cr = circle.getBoundingClientRect();
    const ccx = cr.left + cr.width / 2;
    const ccy = cr.top + cr.height / 2;
    const cr_r = cr.width / 2;

    const cdx = clientX - ccx;
    const cdy = clientY - ccy;
    const cdist = Math.sqrt(cdx * cdx + cdy * cdy);

    circleBorder.style.setProperty(
        '--cx',
        ((clientX - cr.left) / cr.width * 100).toFixed(1) + '%'
    );

    circleBorder.style.setProperty(
        '--cy',
        ((clientY - cr.top) / cr.height * 100).toFixed(1) + '%'
    );

    circleBorder.classList.toggle(
        'lit',
        Math.abs(cdist - cr_r) < 150
    );

    // ── Footer circle border glow ──
    const fr = footerCircle.getBoundingClientRect();
    const fcx = fr.left + fr.width / 2;
    const fcy = fr.top + fr.height / 2;
    const fr_r = fr.width / 2;

    const fdx = clientX - fcx;
    const fdy = clientY - fcy;
    const fdist = Math.sqrt(fdx * fdx + fdy * fdy);

    footerCircleBorder.style.setProperty(
        '--fcx',
        ((clientX - fr.left) / fr.width * 100).toFixed(1) + '%'
    );

    footerCircleBorder.style.setProperty(
        '--fcy',
        ((clientY - fr.top) / fr.height * 100).toFixed(1) + '%'
    );

    footerCircleBorder.classList.toggle(
        'lit',
        Math.abs(fdist - fr_r) < 150
    );

    // ── Widget glow ──
    const wr = widget.getBoundingClientRect();

    widget.style.setProperty('--mouse-x', ((clientX - wr.left) / wr.width * 100).toFixed(1) + '%');
    widget.style.setProperty('--mouse-y', ((clientY - wr.top)  / wr.height * 100).toFixed(1) + '%');

    // ── About card — no pointer tracking (glossy, static) ──

    // ── Curriculo button glow ──
    const currBtn = document.querySelector('.btn-curriculo');
    if (currBtn) {
        const cr2 = currBtn.getBoundingClientRect();
        currBtn.style.setProperty('--mouse-x', ((clientX - cr2.left) / cr2.width  * 100).toFixed(1) + '%');
        currBtn.style.setProperty('--mouse-y', ((clientY - cr2.top)  / cr2.height * 100).toFixed(1) + '%');
    }

    // ── Capture button glow ──
    const br = captureBtn.getBoundingClientRect();

    captureBtn.style.setProperty(
        '--bx',
        ((clientX - br.left) / br.width * 100).toFixed(1) + '%'
    );

    captureBtn.style.setProperty(
        '--by',
        ((clientY - br.top) / br.height * 100).toFixed(1) + '%'
    );

    // ── Skill badges glow ──
    document.querySelectorAll('.skill-badge').forEach(badge => {
        const r = badge.getBoundingClientRect();
        badge.style.setProperty('--bx', ((clientX - r.left) / r.width  * 100).toFixed(1) + '%');
        badge.style.setProperty('--by', ((clientY - r.top)  / r.height * 100).toFixed(1) + '%');
    });

    // ── Project card glow (border + spotlight) ──
    document.querySelectorAll('.project-card-inner').forEach(card => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mouse-x', ((clientX - r.left) / r.width  * 100).toFixed(1) + '%');
        card.style.setProperty('--mouse-y', ((clientY - r.top)  / r.height * 100).toFixed(1) + '%');
    });
}

window.addEventListener('mousemove', e => handlePointer(e.clientX, e.clientY));
window.addEventListener('touchmove', e => {
    const t = e.touches[0];
    if (t) handlePointer(t.clientX, t.clientY);
}, { passive: true });
// ─── PROJECTS STAR FIELD ───
(function () {
    const canvas = document.querySelector('.projects-stars');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const DENSITY  = 0.00018; // stars per px²
    const MIN_R    = 0.6;
    const MAX_R    = 1.8;
    const MIN_DUR  = 2200;    // ms for one twinkle cycle
    const MAX_DUR  = 5800;

    let stars = [];
    let W = 0, H = 0;

    function resize() {
        const scene = canvas.parentElement;
        W = scene.offsetWidth  || window.innerWidth;
        H = scene.scrollHeight || scene.offsetHeight || window.innerHeight;
        canvas.width  = W;
        canvas.height = H;
        spawn();
    }

    function rand(a, b) { return a + Math.random() * (b - a); }

    function spawn() {
        const count = Math.round(W * H * DENSITY);
        stars = Array.from({ length: count }, () => ({
            x:       rand(0, W),
            y:       rand(0, H),
            r:       rand(MIN_R, MAX_R),
            dur:     rand(MIN_DUR, MAX_DUR),
            offset:  rand(0, 1),   // phase offset so they don't all pulse together
        }));
    }

    function draw(ts) {
        ctx.clearRect(0, 0, W, H);

        for (const s of stars) {
            // sine wave 0→1→0 for a smooth appear/disappear pulse
            const phase = ((ts / s.dur + s.offset) % 1);
            const t     = Math.sin(phase * Math.PI);       // 0 at edges, 1 at peak
            const alpha = 0.15 + t * 0.75;                 // range: 0.15 – 0.90
            const r     = s.r * (0.4 + t * 0.6);           // range: 40% – 100% of base radius

            ctx.beginPath();
            ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(200, 200, 220, ${alpha.toFixed(3)})`;
            ctx.fill();
        }

        requestAnimationFrame(draw);
    }

    // Defer so scene.style.height is already set by the projects IIFE
    requestAnimationFrame(() => {
        resize();
        requestAnimationFrame(draw);
    });
    window.addEventListener('resize', resize);
})();
// ─── CONTACT FLIP CARD ───
(function () {
    const card  = document.getElementById('contactCard');
    const scene = document.querySelector('.contact-card-scene');
    const faces = document.querySelectorAll('.contact-card-face');
    if (!card || !scene) return;

    let isFlipped   = false;
    let isAnimating = false;

    document.addEventListener('mousemove', e => {
        if (isAnimating) return;

        const rect    = scene.getBoundingClientRect();
        const centerX = rect.left + rect.width  / 2;
        const centerY = rect.top  + rect.height / 2;
        const mouseX  = e.clientX - centerX;
        const mouseY  = e.clientY - centerY;

        const isHovering = (
            e.clientX >= rect.left && e.clientX <= rect.right &&
            e.clientY >= rect.top  && e.clientY <= rect.bottom
        );

        const force    = isHovering ? 25 : 6;
        const percentX = mouseX / (window.innerWidth  / 2);
        const percentY = mouseY / (window.innerHeight / 2);
        const rotateX  = -percentY * force;
        const rotateY  =  percentX * force;
        const baseY    = isFlipped ? 180 : 0;

        card.style.transform = `rotateX(${rotateX}deg) rotateY(${baseY + rotateY}deg)`;

        // Lazy glow tracking
        const localX = ((e.clientX - rect.left) / rect.width)  * 100;
        const localY = ((e.clientY - rect.top)  / rect.height) * 100;
        faces.forEach(f => {
            f.style.setProperty('--mouse-x', localX.toFixed(1) + '%');
            f.style.setProperty('--mouse-y', localY.toFixed(1) + '%');
        });
    });

    document.addEventListener('mouseleave', () => {
        if (isAnimating) return;
        card.classList.add('is-animating');
        card.style.transform = `rotateX(0deg) rotateY(${isFlipped ? 180 : 0}deg)`;
        setTimeout(() => card.classList.remove('is-animating'), 600);
    });

    card.addEventListener('dblclick', () => {
        if (isAnimating) return;
        isFlipped   = !isFlipped;
        isAnimating = true;
        card.classList.add('is-animating');
        card.style.transform = `rotateX(0deg) rotateY(${isFlipped ? 180 : 0}deg)`;
        setTimeout(() => { card.classList.remove('is-animating'); isAnimating = false; }, 600);
    });

    // Mobile: single tap flips the card (no hover / dblclick on touch)
    let lastTap = 0;
    card.addEventListener('touchend', (e) => {
        const now = Date.now();
        const DOUBLE_TAP_MS = 300;
        if (now - lastTap < DOUBLE_TAP_MS) {
            e.preventDefault();
            if (isAnimating) return;
            isFlipped   = !isFlipped;
            isAnimating = true;
            card.classList.add('is-animating');
            card.style.transform = `rotateX(0deg) rotateY(${isFlipped ? 180 : 0}deg)`;
            setTimeout(() => { card.classList.remove('is-animating'); isAnimating = false; }, 600);
        }
        lastTap = now;
    });

    // Copy chip
    const chip = document.getElementById('copy-chip');
    document.querySelectorAll('.copyable').forEach(el => {
        el.addEventListener('mouseenter', () => { chip.textContent = 'Copiar'; chip.classList.add('is-active'); });
        el.addEventListener('mousemove',  e  => { chip.style.left = e.clientX + 'px'; chip.style.top = e.clientY + 'px'; });
        el.addEventListener('mouseleave', () => chip.classList.remove('is-active'));
        el.addEventListener('click', e => {
            e.stopPropagation();
            navigator.clipboard.writeText(el.textContent.trim()).then(() => { chip.textContent = 'Copiado!'; });
        });
    });
})();