(() => {
    const canvas = document.getElementById('dna-bg');
    const ctx = canvas.getContext('2d');
    const hero = document.getElementById('dna'); // was 'particles-js'
    if (!canvas || !hero) return;

    const overlayOpen = () => document.body.classList.contains('projects-open');

    // ---------- sizing ----------
    let heroH = 0;
    function resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const w = window.innerWidth;
        const h = window.innerHeight;

        canvas.width  = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
        canvas.style.width  = w + 'px';
        canvas.style.height = h + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        heroH = overlayOpen() ? h : (hero.getBoundingClientRect().height || h);
    }
    addEventListener('resize', resize, { passive: true });
    resize();

    // ---------- tunables ----------
    let t = 0;
    const opts = {
        wavesAlong: 1.6,
        amplitude: 140,
        rungSpacing: 35,
        rungFlowPxPerSec: -14,
        speed: -0.05,
        thickness: 2,
        rungThickness: 1.5
    };

    const cssVar = (name, fallback) => {
        const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
        return v || fallback;
    };

    // ---------- draw ----------
    function draw() {
        const W = window.innerWidth;
        const H = window.innerHeight;

        // 1) PAGE BACKGROUND — fill entire canvas (this continues under projects)
        const bg = ctx.createRadialGradient(W*0.1, -H*0.1, 0, W*0.1, -H*0.1, Math.max(W, H)*1.2);
        bg.addColorStop(0, '#0b1020');
        bg.addColorStop(0.6, '#07131d');
        bg.addColorStop(1, '#061019');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, W, H);

        // 2) HELIX — draw only inside the hero area (y in [0, heroH])
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, W, heroH);
        ctx.clip();

        const L = Math.hypot(W, H);               // diagonal length
        const nx = H / L, ny = W / L;             // normal to diagonal (for strand offset)

        // map arclength u (0..L) to diagonal: (0,H) -> (W,0)
        const axisPx = (u) => {
        const s = u / L;
        return { x: s * W, y: H * (1 - s) };
        };
        const strandPx = (u, sign, phase) => {
        const base = axisPx(u);
        const off  = opts.amplitude * Math.sin(2 * Math.PI * opts.wavesAlong * (u / L) + phase) * sign;
        return { x: base.x + off * nx, y: base.y + off * ny };
        };

        const phase = t * opts.speed;

        // soft glow centered on the diagonal midpoint (only visible in hero due to clip)
        const mid = axisPx(L * 0.5);
        const glow = ctx.createRadialGradient(mid.x, mid.y, 0, mid.x, mid.y, Math.max(W, H) * 0.8);
        glow.addColorStop(0, cssVar('--dna-glow', 'rgba(120,200,255,0.12)'));
        glow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, W, heroH);

        // rungs (flowing along the diagonal)
        ctx.lineWidth = opts.rungThickness;
        ctx.strokeStyle = cssVar('--dna-rung', 'rgba(180,220,255,0.18)');

        const marginPx = 120;
        const driftPx  = (t * opts.rungFlowPxPerSec) % opts.rungSpacing;

        let u = -marginPx - driftPx;
        const uEnd = L + marginPx;
        while (u <= uEnd) {
        const p1 = strandPx(u, +1, phase);
        const p2 = strandPx(u, -1, phase);
        const s = (u / L);
        const alpha = 0.15 + 0.35 * (0.5 + 0.5 * Math.cos(2 * Math.PI * s + phase));
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
        u += opts.rungSpacing;
        }
        ctx.globalAlpha = 1;

        // strands
        const drawStrand = (sign, colorVar, fallback) => {
        ctx.lineWidth = opts.thickness;
        ctx.strokeStyle = cssVar(colorVar, fallback);
        ctx.beginPath();
        let moved = false;
        for (let uu = -marginPx; uu <= L + marginPx; uu += 2) {
            const p = strandPx(uu, sign, phase);
            if (!moved) { ctx.moveTo(p.x, p.y); moved = true; }
            else { ctx.lineTo(p.x, p.y); }
        }
        ctx.stroke();
        };
        drawStrand(+1, '--dna-strand-a', 'rgba(80,180,255,0.35)');
        drawStrand(-1, '--dna-strand-b', 'rgba(255,120,180,0.35)');

        ctx.restore(); // stop clipping — rest of page shows only the background, no helix

        t += 1/60;
        requestAnimationFrame(draw);
    }

    requestAnimationFrame(draw);
})();
