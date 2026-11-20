/* ===== Infinite scroll for product lists + Help page helpers =====
   Every .product-grid (home, products, offers, category pages) shows the first batch,
   then loads more while the visitor scrolls (with a loading indicator).
   When nothing is left, a message appears under the list. Works together with the filters/sort on the Products page. */
(function () {
    'use strict';
    var FIRST = 8, STEP = 8, DELAY = 550;
    var TXT = { loading: 'Loading more products…', end: 'No more products to show.', none: 'No products available.' };

    function eligible(grid) {            // cards that the page's own filters keep visible
        return [].slice.call(grid.children).filter(function (c) { return c.nodeType === 1 && !c.hidden && c.style.display !== 'none' && !c.classList.contains('lz-skip'); });
    }
    function setup(grid) {
        if (!grid || grid.dataset.lz || grid.closest('#product-box')) return;
        grid.dataset.lz = '1';
        var shown = FIRST, busy = false, io = null;
        var foot = document.createElement('div'); foot.className = 'lz-foot'; foot.setAttribute('aria-live', 'polite');
        grid.insertAdjacentElement('afterend', foot);

        function paint() {
            var all = eligible(grid), n = all.length;
            all.forEach(function (c, i) { c.classList.toggle('lz-hide', i >= shown); });
            if (!n) { if (document.querySelector('.no-results.show')) { foot.hidden = true; return; } foot.className = 'lz-foot lz-msg'; foot.textContent = TXT.none; foot.hidden = false; return; }
            if (shown < n) { foot.className = 'lz-foot lz-more'; foot.innerHTML = busy ? '<span class="lz-spin"></span> <span>' + TXT.loading + '</span>' : ''; foot.hidden = !busy; }
            else { foot.className = 'lz-foot lz-msg'; foot.textContent = TXT.end; foot.hidden = false; }
            watch();
        }
        function more() {
            if (busy) return; var n = eligible(grid).length; if (shown >= n) return;
            busy = true; paint();
            setTimeout(function () { shown += STEP; busy = false; paint(); }, DELAY);
        }
        var sentinel = document.createElement('div'); sentinel.className = 'lz-sentinel'; foot.insertAdjacentElement('beforebegin', sentinel);
        function watch() { if (io) { io.disconnect(); io.observe(sentinel); } }
        function near() { var r = sentinel.getBoundingClientRect(); return r.top < (window.innerHeight || 800) + 300; }
        if ('IntersectionObserver' in window) { io = new IntersectionObserver(function (es) { if (es.some(function (e) { return e.isIntersecting; })) more(); }, { rootMargin: '300px' }); }
        else window.addEventListener('scroll', function () { if (near()) more(); }, { passive: true });
        // re-evaluate when the filters / sorting change the list
        new MutationObserver(function () { shown = Math.max(FIRST, Math.min(shown, FIRST)); paint(); }).observe(grid, { childList: true, attributes: true, subtree: true, attributeFilter: ['style', 'hidden'] });
        paint();
    }
    function scan() { [].forEach.call(document.querySelectorAll('.product-grid'), setup); }

    /* ---------- Help page: search + open chat ---------- */
    function help() {
        var q = document.getElementById('help-q'); if (!q) return;
        q.addEventListener('input', function () {
            var v = q.value.trim().toLowerCase(), any = false;
            [].forEach.call(document.querySelectorAll('.help-q'), function (d) { var ok = !v || d.textContent.toLowerCase().indexOf(v) > -1; d.hidden = !ok; if (ok && v) d.open = true; if (ok) any = true; });
            [].forEach.call(document.querySelectorAll('.help-sec'), function (s) { s.hidden = !s.querySelector('.help-q:not([hidden])'); });
            var none = document.getElementById('help-none'); if (none) none.hidden = any;
        });
        document.addEventListener('click', function (e) {
            var a = e.target.closest && e.target.closest('[data-open-chat]'); if (!a) return; e.preventDefault();
            if (window.BodaSupport && BodaSupport.open) BodaSupport.open(); else { var f = document.querySelector('.sc-fab'); if (f) f.click(); }
        });
    }
    function boot() {
        // grids rendered by JS (category page) appear a moment after load, so keep looking for a short while
        var tries = 0, h = setInterval(function () { scan(); if (++tries > 30) clearInterval(h); }, 200);
        scan(); help();
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
    window.addEventListener('load', function () { setTimeout(scan, 100); });
    window.BodaLazy = { scan: scan, texts: TXT };
})();
