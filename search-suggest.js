/* ===== Boda Store - Search suggestions (Amazon-style) =====
   - Live suggestions while typing: product image + name + price, matching categories, auto-complete terms
   - Focus on an empty box: recent searches (removable) + popular searches
   - Typo correction ("laptpo" -> "laptop"), plural-insensitive matching ("keyboards" = "keyboard")
   - No results: shows alternative products and categories
   - Keyboard: Up/Down to move, Enter to open, Tab / Right-arrow to auto-complete, Esc to close */
(function () {
    'use strict';
    var RK = 'boda_recent_searches', CK = 'boda_search_counts', DEFAULT_POPULAR = ['Laptops', 'Gaming PCs', 'Keyboards'];
    var TX = {
        recent: { ar: 'عمليات البحث الأخيرة', en: 'Recent searches', fr: 'Recherches récentes', de: 'Letzte Suchanfragen' },
        clear: { ar: 'مسح الكل', en: 'Clear all', fr: 'Tout effacer', de: 'Alle löschen' },
        popular: { ar: 'الأكثر بحثًا', en: 'Popular searches', fr: 'Recherches populaires', de: 'Beliebte Suchen' },
        products: { ar: 'المنتجات', en: 'Products', fr: 'Produits', de: 'Produkte' },
        cats: { ar: 'الأقسام', en: 'Categories', fr: 'Catégories', de: 'Kategorien' },
        didyou: { ar: 'هل تقصد', en: 'Did you mean', fr: 'Vouliez-vous dire', de: 'Meinten Sie' },
        noRes: { ar: 'مفيش نتائج عن', en: 'No results for', fr: 'Aucun résultat pour', de: 'Keine Ergebnisse für' },
        tryThese: { ar: 'جرّب المنتجات أو الأقسام دي:', en: 'Try these products or categories instead:', fr: 'Essayez plutôt ces produits ou catégories :', de: 'Probieren Sie stattdessen diese Produkte oder Kategorien:' },
        all: { ar: 'عرض كل النتائج عن', en: 'See all results for', fr: 'Voir tous les résultats pour', de: 'Alle Ergebnisse anzeigen für' },
        showing: { ar: 'بنعرض نتائج', en: 'Showing results for', fr: 'Résultats pour', de: 'Ergebnisse für' },
        instead: { ar: 'بدل', en: 'instead of', fr: 'au lieu de', de: 'statt' },
        remove: { ar: 'إزالة', en: 'Remove', fr: 'Retirer', de: 'Entfernen' },
        hint: { ar: 'Tab للإكمال', en: 'Tab to complete', fr: 'Tab pour compléter', de: 'Tab zum Vervollständigen' }
    };
    function L() { var l = 'en'; try { l = (window.BodaI18n && BodaI18n.current && BodaI18n.current()) || localStorage.getItem('boda_language') || 'en'; } catch (e) { } return TX.recent[l] ? l : 'en'; }
    function tx(k) { var o = TX[k]; return o ? (o[L()] || o.en) : k; }
    function tr(s) { try { return window.BodaI18n && BodaI18n.t ? BodaI18n.t(s) : s; } catch (e) { return s; } }
    function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
    function rd(k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } }
    function wr(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } }

    /* ---------- text helpers ---------- */
    function norm(s) { return String(s || '').toLowerCase().replace(/[\u064B-\u065F\u0670]/g, '').replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim(); }
    function stem(w) { return w.length > 2 && /s$/.test(w) && !/ss$/.test(w) ? w.slice(0, -1) : w; }
    function toks(s) { return norm(s).split(' ').filter(Boolean).map(stem); }
    function match(q, text) {                      // every query word must appear (as a word-part) in the text
        var t = toks(text).join(' '), qs = toks(q); if (!qs.length) return true;
        return qs.every(function (w) { return t.indexOf(w) !== -1; });
    }
    function osa(a, b) {                            // edit distance incl. swapped letters
        var m = a.length, n = b.length, d = [], i, j;
        for (i = 0; i <= m; i++) { d[i] = [i]; } for (j = 0; j <= n; j++) d[0][j] = j;
        for (i = 1; i <= m; i++) for (j = 1; j <= n; j++) {
            var c = a[i - 1] === b[j - 1] ? 0 : 1;
            d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + c);
            if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
        }
        return d[m][n];
    }

    /* ---------- data ---------- */
    function products() { try { return typeof allProducts === 'function' ? allProducts() : (window.BODA_PRODUCTS || []); } catch (e) { return []; } }
    function cats() { try { return typeof CATEGORIES !== 'undefined' ? CATEGORIES : []; } catch (e) { return []; } }
    function hay(p) { return [p.name, tr(p.name), p.brand, p.cat, p.sub, p.id].join(' '); }
    function vocab() {
        var set = {};
        products().forEach(function (p) { toks([p.name, p.brand, p.cat, p.sub].join(' ')).forEach(function (w) { if (w.length > 2) set[w] = 1; }); });
        cats().forEach(function (c) { toks(c.name).concat((c.subs || []).reduce(function (a, s) { return a.concat(toks(s)); }, [])).forEach(function (w) { if (w.length > 2) set[w] = 1; }); });
        return Object.keys(set);
    }
    function correct(q) {                           // -> corrected phrase or ''
        var V = vocab(), words = norm(q).split(' ').filter(Boolean), changed = false;
        var out = words.map(function (w) {
            var sw = stem(w); if (V.some(function (v) { return v.indexOf(sw) === 0; })) return w;
            var lim = sw.length <= 3 ? 0 : sw.length <= 5 ? 1 : 2, best = null, bd = 99;
            V.forEach(function (v) { if (Math.abs(v.length - sw.length) > lim) return; var d = osa(sw, v); if (d < bd) { bd = d; best = v; } });
            if (best && bd <= lim) { changed = true; return best; } return w;
        });
        return changed ? out.join(' ') : '';
    }
    function findProducts(q, limit) {
        var qs = toks(q), nq = norm(q);
        return products().map(function (p) {
            var name = norm(p.name + ' ' + tr(p.name)), s = 0;
            if (!match(q, hay(p))) return null;
            if (name.indexOf(nq) === 0) s += 6; else if (name.indexOf(' ' + nq) !== -1) s += 4; else s += 2;
            if (qs.every(function (w) { return name.indexOf(w) !== -1; })) s += 2;
            return { p: p, s: s };
        }).filter(Boolean).sort(function (a, b) { return b.s - a.s; }).slice(0, limit || 5).map(function (x) { return x.p; });
    }
    function findCats(q) {
        var out = [];
        cats().forEach(function (c) {
            if (match(q, c.name + ' ' + tr(c.name))) out.push({ label: c.name, cat: c.name, sub: '' });
            (c.subs || []).forEach(function (s) { if (match(q, s + ' ' + tr(s))) out.push({ label: s, cat: c.name, sub: s, parent: c.name }); });
        });
        return out.slice(0, 4);
    }
    function terms(q) {                             // auto-complete terms that START with what was typed
        var nq = norm(q), seen = {}, out = [];
        function add(t) { var k = norm(t); if (k && k !== nq && k.indexOf(nq) === 0 && !seen[k]) { seen[k] = 1; out.push(t); } }
        cats().forEach(function (c) { add(c.name); (c.subs || []).forEach(add); });
        products().forEach(function (p) { add(p.name); if (p.brand) add(p.brand); });
        return out.slice(0, 3);
    }
    function popular() {
        var counts = rd(CK, {}), list = Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a]; }).slice(0, 6);
        DEFAULT_POPULAR.forEach(function (d) { if (list.length < 6 && !list.some(function (x) { return norm(x) === norm(d); })) list.push(d); });
        return list;
    }
    function recents() { return rd(RK, []).slice(0, 6); }
    function remember(q) {
        q = q.trim(); if (!q) return;
        var r = rd(RK, []).filter(function (x) { return norm(x) !== norm(q); }); r.unshift(q); wr(RK, r.slice(0, 8));
        var c = rd(CK, {}); c[q] = (c[q] || 0) + 1; wr(CK, c);
    }

    /* ---------- navigation ---------- */
    function searchUrl(q, orig) { return 'index.html?page=products&q=' + encodeURIComponent(q) + (orig ? '&orig=' + encodeURIComponent(orig) : ''); }
    function catHref(c) { return 'index.html?page=products&cat=' + encodeURIComponent(c.cat) + (c.sub ? '&sub=' + encodeURIComponent(c.sub) : ''); }
    function prodHref(p) { return typeof productUrl === 'function' ? productUrl(p.id) : 'index.html?page=product&id=' + encodeURIComponent(p.id); }
    function submit(q) {
        q = String(q == null ? '' : q).trim(); if (!q) return;
        remember(q);
        var fixed = findProducts(q, 1).length ? '' : correct(q);
        if (fixed && findProducts(fixed, 1).length) { location.href = searchUrl(fixed, q); return; }
        location.href = searchUrl(q);
    }
    window.searchProducts = function () { var i = document.querySelector('input[name="search"]'); submit(i ? i.value : ''); };

    /* ---------- UI ---------- */
    var box, input, active = -1, ghost = '';
    function css() {
        if (document.getElementById('ss-style')) return;
        var s = document.createElement('style'); s.id = 'ss-style';
        s.textContent = [
            '.ss-box{position:fixed;z-index:9980;display:none;max-height:min(520px,calc(100vh - 110px));overflow-y:auto;background:var(--surface,#fff);color:var(--ink,#0f1b2d);border:1px solid var(--line,#dde3ec);border-radius:12px;box-shadow:0 18px 44px rgba(0,0,0,.28);text-align:start;font-size:.92rem}',
            '.ss-box.open{display:block}',
            '.ss-h{display:flex;align-items:center;justify-content:space-between;padding:10px 14px 4px;font-size:.74rem;font-weight:700;text-transform:uppercase;letter-spacing:.04em;opacity:.65}',
            '.ss-h button{background:none;border:0;color:var(--brand,#d7263d);font-size:.74rem;cursor:pointer;font-weight:700}',
            '.ss-item{display:flex;align-items:center;gap:12px;padding:8px 14px;cursor:pointer;text-decoration:none;color:inherit;border:0;background:none;width:100%;text-align:start;font:inherit}',
            '.ss-item:hover,.ss-item.on{background:rgba(215,38,61,.09)}',
            '.ss-ico{width:22px;text-align:center;opacity:.55;flex-shrink:0}',
            '.ss-img{width:48px;height:48px;border-radius:8px;object-fit:cover;background:#f3f5f9;flex-shrink:0}',
            '.ss-main{flex:1;min-width:0}.ss-name{display:block;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
            '.ss-sub{display:block;font-size:.76rem;opacity:.65}',
            '.ss-price{font-weight:700;color:var(--brand,#d7263d);white-space:nowrap}.ss-price s{font-weight:400;opacity:.55;margin-inline-start:6px;font-size:.8rem;color:inherit}',
            '.ss-x{background:none;border:0;cursor:pointer;opacity:.5;font-size:1rem;padding:2px 6px;color:inherit}.ss-x:hover{opacity:1}',
            '.ss-chips{display:flex;flex-wrap:wrap;gap:6px;padding:6px 14px 10px}',
            '.ss-chip{border:1px solid var(--line,#dde3ec);border-radius:999px;padding:5px 12px;background:none;color:inherit;font:inherit;font-size:.84rem;cursor:pointer;text-decoration:none}.ss-chip:hover,.ss-chip.on{border-color:var(--brand,#d7263d);color:var(--brand,#d7263d)}',
            '.ss-msg{padding:14px;font-size:.9rem}.ss-msg b{color:var(--brand,#d7263d)}',
            '.ss-all{border-top:1px solid var(--line,#dde3ec);justify-content:center;color:var(--brand,#d7263d);font-weight:700}',
            '.ss-hint{margin-inline-start:auto;font-size:.7rem;opacity:.5;white-space:nowrap}',
            '.ss-box mark{background:none;color:var(--brand,#d7263d);font-weight:800}',
            '.ss-notice{margin:0 0 14px;padding:10px 14px;border-radius:10px;background:rgba(215,38,61,.09);border:1px solid rgba(215,38,61,.25)}'
        ].join('');
        document.head.appendChild(s);
    }
    function hl(text, q) {
        var t = esc(text), ws = norm(q).split(' ').filter(function (w) { return w.length > 0; });
        ws.forEach(function (w) { try { t = t.replace(new RegExp('(' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig'), '<mark>$1</mark>'); } catch (e) { } });
        return t;
    }
    function place() {
        if (!input || !box) return; var r = input.closest('.search-box') ? input.closest('.search-box').getBoundingClientRect() : input.getBoundingClientRect();
        var w = Math.min(Math.max(r.width, 440), window.innerWidth - 16), left = document.documentElement.dir === 'rtl' ? r.right - w : r.left;
        left = Math.max(8, Math.min(left, window.innerWidth - w - 8));
        box.style.width = w + 'px'; box.style.left = left + 'px'; box.style.top = (r.bottom + 6) + 'px';
        box.dir = document.documentElement.dir || 'ltr';
    }
    function priceHtml(p) { var m = typeof money === 'function' ? money : function (n) { return '$' + n; }; return '<span class="ss-price">' + m(p.price) + (p.old && p.old > p.price ? '<s>' + m(p.old) + '</s>' : '') + '</span>'; }
    function prodRow(p, q) {
        var img = p.img ? '<img class="ss-img" src="' + esc(p.img) + '" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.style.visibility=\'hidden\'">' : '<span class="ss-img"></span>';
        return '<a class="ss-item" data-q="' + esc(q) + '" href="' + esc(prodHref(p)) + '">' + img + '<span class="ss-main"><span class="ss-name">' + hl(tr(p.name), q) + '</span><span class="ss-sub">' + esc(tr(p.sub || p.cat || '')) + '</span></span>' + priceHtml(p) + '</a>';
    }
    function qRow(t, q, hint) { return '<button type="button" class="ss-item" data-go="' + esc(t) + '"><span class="ss-ico">🔍</span><span class="ss-main">' + hl(tr(t), q) + '</span>' + (hint ? '<span class="ss-hint">' + esc(tx('hint')) + '</span>' : '') + '</button>'; }
    function render() {
        var q = input.value.trim(), h = '', pr, cs;
        ghost = ''; active = -1;
        if (!q) {
            var rc = recents(), pp = popular();
            if (rc.length) h += '<div class="ss-h"><span>' + esc(tx('recent')) + '</span><button type="button" data-clear="1">' + esc(tx('clear')) + '</button></div>' + rc.map(function (r) { return '<div class="ss-item" data-go="' + esc(r) + '"><span class="ss-ico">🕘</span><span class="ss-main">' + esc(tr(r)) + '</span><button type="button" class="ss-x" data-del="' + esc(r) + '" aria-label="' + esc(tx('remove')) + '">×</button></div>'; }).join('');
            h += '<div class="ss-h"><span>' + esc(tx('popular')) + '</span></div><div class="ss-chips">' + pp.map(function (t) { return '<button type="button" class="ss-chip ss-item" data-go="' + esc(t) + '" style="width:auto;padding:5px 12px">' + esc(tr(t)) + '</button>'; }).join('') + '</div>';
        } else {
            pr = findProducts(q, 5); cs = findCats(q);
            var tm = terms(q), fix = pr.length ? '' : correct(q);
            if (tm.length) ghost = tm[0];
            if (fix) { var fp = findProducts(fix, 5); h += '<div class="ss-msg">' + esc(tx('didyou')) + ' <button type="button" class="ss-chip ss-item" data-go="' + esc(fix) + '" data-orig="' + esc(q) + '" style="width:auto"><b>' + esc(fix) + '</b></button></div>'; if (fp.length) { pr = fp; cs = findCats(fix); } }
            if (tm.length) h += tm.map(function (t, i) { return qRow(t, q, i === 0); }).join('');
            if (cs.length) h += '<div class="ss-h"><span>' + esc(tx('cats')) + '</span></div><div class="ss-chips">' + cs.map(function (c) { return '<a class="ss-chip ss-item" style="width:auto;padding:5px 12px" href="' + esc(catHref(c)) + '" data-q="' + esc(q) + '">' + esc(tr(c.label)) + (c.parent ? ' <small style="opacity:.6">· ' + esc(tr(c.parent)) + '</small>' : '') + '</a>'; }).join('') + '</div>';
            if (pr.length) h += '<div class="ss-h"><span>' + esc(tx('products')) + '</span></div>' + pr.map(function (p) { return prodRow(p, q); }).join('');
            if (!pr.length && !cs.length && !tm.length) {
                var alt = products().filter(function (p) { return p.old > p.price; }).concat(products()).slice(0, 4), ac = cats().slice(0, 5);
                h += '<div class="ss-msg">' + esc(tx('noRes')) + ' <b>“' + esc(q) + '”</b><br><small style="opacity:.7">' + esc(tx('tryThese')) + '</small></div>' +
                    '<div class="ss-chips">' + ac.map(function (c) { return '<a class="ss-chip ss-item" style="width:auto;padding:5px 12px" href="' + esc(catHref({ cat: c.name })) + '">' + esc(tr(c.name)) + '</a>'; }).join('') + '</div>' + alt.map(function (p) { return prodRow(p, ''); }).join('');
            } else h += '<button type="button" class="ss-item ss-all" data-go="' + esc(q) + '">🔍 ' + esc(tx('all')) + ' “' + esc(q) + '”</button>';
        }
        box.innerHTML = h; place(); box.classList.add('open');
    }
    function items() { return Array.prototype.slice.call(box.querySelectorAll('.ss-item')); }
    function setActive(i) { var it = items(); if (!it.length) return; if (i < 0) i = it.length - 1; if (i >= it.length) i = 0; it.forEach(function (x) { x.classList.remove('on'); }); active = i; it[i].classList.add('on'); it[i].scrollIntoView({ block: 'nearest' }); }
    function close() { if (box) box.classList.remove('open'); active = -1; }
    function activate(el) {
        if (!el) return;
        var go = el.getAttribute('data-go');
        if (go != null) { input.value = go; var o = el.getAttribute('data-orig'); if (o) { remember(go); location.href = searchUrl(go, o); } else submit(go); return; }
        if (el.getAttribute('data-q')) remember(el.getAttribute('data-q'));
        if (el.href) location.href = el.href;
    }

    function init() {
        input = document.querySelector('input[name="search"]'); if (!input || input.__ss) return; input.__ss = 1;
        css(); box = document.createElement('div'); box.className = 'ss-box'; box.setAttribute('role', 'listbox'); document.body.appendChild(box);
        input.setAttribute('autocomplete', 'off');
        input.addEventListener('focus', render); input.addEventListener('click', render);
        input.addEventListener('input', render);
        input.addEventListener('keydown', function (e) {
            var open = box.classList.contains('open');
            if (e.key === 'Escape') { close(); return; }
            if (!open) return;
            if (e.key === 'ArrowDown') { e.preventDefault(); setActive(active + 1); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(active - 1); }
            else if ((e.key === 'Tab' || e.key === 'ArrowRight') && ghost && input.selectionStart === input.value.length && !e.shiftKey && document.documentElement.dir !== 'rtl') { e.preventDefault(); input.value = ghost; render(); }
            else if (e.key === 'ArrowLeft' && ghost && input.selectionStart === input.value.length && document.documentElement.dir === 'rtl') { e.preventDefault(); input.value = ghost; render(); }
            else if (e.key === 'Enter' && active >= 0) { e.preventDefault(); e.stopImmediatePropagation(); activate(items()[active]); }
        }, true);
        box.addEventListener('mousedown', function (e) { e.preventDefault(); });   // keep focus in the input
        box.addEventListener('click', function (e) {
            var c = e.target.closest('[data-clear]'); if (c) { wr(RK, []); render(); return; }
            var d = e.target.closest('[data-del]'); if (d) { wr(RK, rd(RK, []).filter(function (x) { return x !== d.getAttribute('data-del'); })); render(); e.stopPropagation(); return; }
            var it = e.target.closest('.ss-item'); if (it) { e.preventDefault(); activate(it); }
        });
        document.addEventListener('mousedown', function (e) { if (!box.contains(e.target) && e.target !== input && !(input.closest('.search-box') && input.closest('.search-box').contains(e.target))) close(); });
        window.addEventListener('resize', function () { if (box.classList.contains('open')) place(); });
        window.addEventListener('scroll', function () { if (box.classList.contains('open')) place(); }, true);
        document.addEventListener('boda:lang', function () { if (box.classList.contains('open')) render(); });

        /* results page: tell the customer when the search was auto-corrected */
        var P = new URLSearchParams(location.search), orig = P.get('orig'), q = P.get('q');
        if (orig && q && P.get('page') === 'products') {
            var n = document.createElement('div'); n.className = 'ss-notice';
            n.innerHTML = esc(tx('showing')) + ' <b>' + esc(q) + '</b> · ' + esc(tx('instead')) + ' <s>' + esc(orig) + '</s>';
            var m = document.querySelector('main'), h1 = m && m.querySelector('h1'); if (h1) h1.insertAdjacentElement('afterend', n); else if (m) m.insertBefore(n, m.firstChild);
        }
    }
    window.BodaSearch = { match: match, correct: correct, find: findProducts };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
