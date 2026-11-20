/* ============================================================
   Boda Store — product-extras.js
   Product page (index.html?page=product&id=...):
     • Ratings section (average + reviews list)
     • "Product rating"  -> popup: stars + comment
     • "Report product"  -> popup: reason + comment (also lands in Admin > Complaints)
   Self-contained. Load with:  <script src="product-extras.js" defer></script>
   ============================================================ */
(function () {
    'use strict';

    var TXT = {
        ratings: { ar: 'التقييمات', en: 'Ratings', fr: 'Avis', de: 'Bewertungen' },
        noRatings: { ar: 'مفيش تقييمات للمنتج ده لسه.', en: 'No ratings available for this product.', fr: 'Aucun avis pour ce produit.', de: 'Keine Bewertungen für dieses Produkt.' },
        reportBtn: { ar: 'الإبلاغ عن المنتج', en: 'Report product', fr: 'Signaler le produit', de: 'Produkt melden' },
        rateBtn: { ar: 'تقييم المنتج', en: 'Product rating', fr: 'Noter le produit', de: 'Produkt bewerten' },
        rateTitle: { ar: 'قيّم المنتج', en: 'Rate product', fr: 'Noter le produit', de: 'Produkt bewerten' },
        rateHint: { ar: 'اكتب رأيك في المنتج', en: 'Write us your opinion about the product', fr: 'Écrivez votre avis sur le produit', de: 'Schreiben Sie Ihre Meinung zum Produkt' },
        rate: { ar: 'إرسال التقييم', en: 'Rate', fr: 'Envoyer', de: 'Senden' },
        pickStars: { ar: 'اختار عدد النجوم الأول.', en: 'Please choose a star rating first.', fr: 'Choisissez d’abord une note.', de: 'Bitte zuerst Sterne wählen.' },
        thanksRate: { ar: 'شكرًا على تقييمك!', en: 'Thanks for your rating!', fr: 'Merci pour votre avis !', de: 'Danke für Ihre Bewertung!' },
        reportTitle: { ar: 'الإبلاغ عن المنتج', en: 'Report product', fr: 'Signaler le produit', de: 'Produkt melden' },
        reportHint: { ar: 'اكتب رأيك أو تفاصيل البلاغ', en: 'Write your opinion about the product', fr: 'Décrivez le problème', de: 'Beschreiben Sie das Problem' },
        confirm: { ar: 'تأكيد', en: 'Confirm', fr: 'Confirmer', de: 'Bestätigen' },
        cancel: { ar: 'إلغاء', en: 'Cancel', fr: 'Annuler', de: 'Abbrechen' },
        pickReason: { ar: 'اختار سبب البلاغ.', en: 'Please choose a reason.', fr: 'Choisissez un motif.', de: 'Bitte einen Grund wählen.' },
        thanksReport: { ar: 'تم إرسال البلاغ. شكرًا لمساعدتك!', en: 'Report sent. Thank you for helping us!', fr: 'Signalement envoyé. Merci !', de: 'Meldung gesendet. Danke!' },
        already: { ar: 'انت بلّغت عن المنتج ده قبل كده.', en: 'You already reported this product.', fr: 'Vous avez déjà signalé ce produit.', de: 'Sie haben dieses Produkt bereits gemeldet.' },
        guest: { ar: 'زائر', en: 'Guest', fr: 'Invité', de: 'Gast' },
        close: { ar: 'إغلاق', en: 'Close', fr: 'Fermer', de: 'Schließen' }
    };
    var REASONS = [
        ['fraud', { ar: 'احتيال', en: 'Fraud', fr: 'Fraude', de: 'Betrug' }],
        ['duplicate', { ar: 'منتج مكرر', en: 'Duplicate product', fr: 'Produit en double', de: 'Doppeltes Produkt' }],
        ['category', { ar: 'قسم غلط', en: 'Wrong category', fr: 'Mauvaise catégorie', de: 'Falsche Kategorie' }],
        ['unavailable', { ar: 'المنتج غير متاح', en: 'The product is not available', fr: 'Produit indisponible', de: 'Produkt nicht verfügbar' }],
        ['fake', { ar: 'منتج مقلّد', en: 'Fake product', fr: 'Produit contrefait', de: 'Gefälschtes Produkt' }],
        ['inappropriate', { ar: 'محتوى غير لائق', en: 'Inappropriate', fr: 'Inapproprié', de: 'Unangemessen' }],
        ['offensive', { ar: 'منتج مسيء', en: 'Offensive product', fr: 'Produit offensant', de: 'Anstößiges Produkt' }],
        ['price', { ar: 'السعر غير مطابق', en: 'Price mismatch', fr: 'Prix non conforme', de: 'Preis stimmt nicht' }],
        ['noreply', { ar: 'التاجر لم يرد', en: 'Seller did not respond', fr: 'Le vendeur n’a pas répondu', de: 'Verkäufer antwortet nicht' }],
        ['other', { ar: 'أخرى', en: 'Other', fr: 'Autre', de: 'Andere' }]
    ];
    function lang() { var l = 'en'; try { l = localStorage.getItem('boda_language') || document.documentElement.lang || 'en'; } catch (e) { } return ['ar', 'en', 'fr', 'de'].indexOf(l) > -1 ? l : 'en'; }
    function t(k) { var o = TXT[k]; return o ? (o[lang()] || o.en) : k; }
    function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
    function lsGet(k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } }
    function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } }
    function toast(m) {
        var el = document.createElement('div'); el.className = 'pe-toast'; el.textContent = m; document.body.appendChild(el);
        setTimeout(function () { el.classList.add('show'); }, 10);
        setTimeout(function () { el.classList.remove('show'); setTimeout(function () { el.remove(); }, 300); }, 3000);
    }
    function me() { var u = lsGet('boda_user', null); return u ? { name: u.name || u.email || t('guest'), id: u.email || 'guest' } : { name: t('guest'), id: 'guest' }; }
    function pid() { return new URLSearchParams(location.search).get('id'); }
    function pname() { var h = document.querySelector('#product-box .pd h3'); return h ? h.textContent.trim() : pid(); }

    function addStyles() {
        if (document.getElementById('pe-style')) return;
        var s = document.createElement('style'); s.id = 'pe-style';
        s.textContent = [
            '.pe-sec{background:var(--surface,#fff);border:1px solid var(--line,#dde3ec);border-radius:12px;padding:22px;margin:26px 0;color:var(--ink,#0f1b2d)}',
            '.pe-doc{border:1px solid var(--line,#dde3ec);border-radius:10px;padding:10px 14px;margin-bottom:8px}.pe-doc summary{cursor:pointer}.pe-tag{background:rgba(120,130,150,.15);border-radius:999px;padding:1px 9px;font-size:.78rem;margin-inline:6px}',
            '.pe-sec[hidden]{display:none}',
            '.pe-sec h2{margin:0 0 14px;font-size:1.15rem;display:flex;align-items:center;gap:12px;flex-wrap:wrap}',
            '.pe-avg{font-size:1rem;font-weight:700}.pe-avg small{color:var(--ink-soft,#4a5568);font-weight:400}',
            '.pe-star{color:#f5b301}.pe-empty{color:var(--ink-soft,#4a5568);text-align:center;padding:26px 0}',
            '.pe-list{display:flex;flex-direction:column;gap:12px}',
            '.pe-rv{border-bottom:1px solid var(--line,#dde3ec);padding-bottom:12px}.pe-rv:last-child{border:0}',
            '.pe-rv b{margin-inline-end:8px}.pe-rv small{color:var(--ink-soft,#4a5568)}.pe-rv p{margin:6px 0 0;white-space:pre-line}',
            '.pe-acts{display:flex;justify-content:center;gap:16px;margin-top:20px;flex-wrap:wrap}',
            '.pe-link{background:none;border:0;cursor:pointer;font:inherit;display:inline-flex;align-items:center;gap:8px;padding:8px 14px;border-radius:8px}',
            '.pe-link.rep{color:#d93025}.pe-link.rate{color:var(--brand,#d7263d)}.pe-link:hover{background:rgba(127,127,127,.12)}',
            '.pe-back{position:fixed;inset:0;background:rgba(10,18,32,.5);z-index:9998;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .2s;padding:16px}',
            '.pe-back.show{opacity:1}',
            '.pe-modal{background:var(--surface,#fff);color:var(--ink,#0f1b2d);width:min(430px,100%);max-height:92vh;overflow:auto;border-radius:12px;padding:26px 24px 22px;position:relative;box-shadow:0 20px 60px rgba(0,0,0,.35);transform:translateY(10px);transition:transform .2s}',
            '.pe-back.show .pe-modal{transform:none}',
            '.pe-x{position:absolute;inset-block-start:8px;inset-inline-start:12px;background:none;border:0;font-size:1.5rem;cursor:pointer;color:var(--ink-soft,#4a5568);line-height:1}',
            '.pe-modal h3{margin:4px 0 16px;text-align:center;font-size:1.05rem}',
            '.pe-reasons{display:flex;flex-direction:column;gap:8px;margin-bottom:14px;padding-inline:14px}',
            '.pe-reasons label{display:flex;align-items:center;gap:10px;cursor:pointer;font-size:.9rem}',
            '.pe-reasons input{accent-color:var(--brand,#d7263d);width:16px;height:16px;margin:0}',
            '.pe-modal textarea{width:100%;min-height:76px;border:1px solid var(--line,#dde3ec);border-radius:8px;padding:10px 12px;font:inherit;background:var(--surface,#fff);color:var(--ink,#0f1b2d);box-sizing:border-box;resize:vertical}',
            '.pe-modal textarea:focus{outline:none;border-color:var(--brand,#d7263d)}',
            '.pe-err{color:#c0392b;font-size:.85rem;min-height:1.2em;margin:8px 0 0}',
            '.pe-btns{display:flex;gap:10px;margin-top:10px}',
            '.pe-btn{padding:10px 26px;border:0;border-radius:8px;font:inherit;font-weight:600;cursor:pointer;background:var(--brand,#d7263d);color:#fff}',
            '.pe-btn:hover{background:var(--brand-dark,#b01c30)}.pe-btn.grey{background:#d6d9de;color:#222}.pe-btn.grey:hover{background:#c5c9cf}',
            '.pe-big{text-align:center;margin-bottom:6px;font-size:1.2rem;font-weight:700}.pe-big span{color:#f5b301}.pe-big small{color:var(--ink-soft,#4a5568);font-weight:400;margin-inline-start:6px}',
            '.pe-stars{display:flex;justify-content:center;gap:6px;margin:12px 0 16px}',
            '.pe-stars button{background:none;border:0;cursor:pointer;font-size:2rem;color:#cfd3d9;line-height:1;padding:0}',
            '.pe-stars button.on{color:#f5b301}',
            '.pe-center{display:flex;justify-content:center;margin-top:12px}',
            '.pe-toast{position:fixed;inset-inline:0;bottom:26px;margin:0 auto;width:max-content;max-width:90vw;background:#0f1b2d;color:#fff;padding:11px 18px;border-radius:8px;z-index:10000;opacity:0;transform:translateY(10px);transition:.3s;font-size:.9rem}',
            '.pe-toast.show{opacity:1;transform:none}'
        ].join('\n');
        document.head.appendChild(s);
    }

    /* ---------- data ---------- */
    function reviewsOf(id) {
        var all = lsGet('boda_reviews', {}), list = (all[id] || []).slice(), u = me();
        var legacy = (lsGet('boda_ratings', {}) || {})[id];
        if (legacy && !list.some(function (r) { return r.uid === u.id; })) list.push({ uid: u.id, user: u.name, stars: legacy, text: '', time: 0 });
        return list.sort(function (a, b) { return (b.time || 0) - (a.time || 0); });
    }
    function stars(n) { var s = ''; for (var i = 1; i <= 5; i++) s += i <= n ? '★' : '☆'; return s; }

    /* ---------- section ---------- */
    function renderSection() {
        var box = document.getElementById('pe-sec'); if (!box) return;
        var id = pid(), list = reviewsOf(id), sum = list.reduce(function (a, r) { return a + r.stars; }, 0), avg = list.length ? sum / list.length : 0;
        box.innerHTML = '<h2>' + t('ratings') + (list.length ? ' <span class="pe-avg"><span class="pe-star">★</span> ' + avg.toFixed(1) + '/5 <small>(' + list.length + ')</small></span>' : '') + '</h2>' +
            (list.length ? '<div class="pe-list">' + list.map(function (r) {
                return '<div class="pe-rv"><b>' + esc(r.user) + '</b><span class="pe-star">' + stars(r.stars) + '</span>' + (r.time ? ' <small>' + new Date(r.time).toLocaleDateString() + '</small>' : '') + (r.text ? '<p>' + esc(r.text) + '</p>' : '') + '</div>';
            }).join('') + '</div>' : '<p class="pe-empty">' + t('noRatings') + '</p>') +
            '<div class="pe-acts"><button type="button" class="pe-link rep" data-pe="report">⚠ ' + t('reportBtn') + '</button>' +
            '<button type="button" class="pe-link rate" data-pe="rate">★ ' + t('rateBtn') + '</button></div>';
    }
    /* ---------- product documentation (managed from Admin -> Documentation) ---------- */
    var DOC_TYPES = { manual: 'User manual', warranty: 'Warranty', spec: 'Specifications', safety: 'Safety', cert: 'Certificate', other: 'Other' };
    function renderDocs(box) {
        var id = pid(), docs = lsGet('boda_docs', []).filter(function (d) { return d && d.active !== false && String(d.product) === String(id); });
        if (!docs.length) { box.hidden = true; return; }
        box.hidden = false;
        box.innerHTML = '<h2>Product documentation</h2><div class="pe-docs">' + docs.map(function (d) {
            var link = /^https?:\/\//i.test(d.link || '') ? '<a class="pe-link" href="' + esc(d.link) + '" target="_blank" rel="noopener">Open file</a>' : '';
            return '<details class="pe-doc"><summary><b>' + esc(d.title) + '</b> <span class="pe-tag">' + (DOC_TYPES[d.doctype] || 'Other') + '</span>' + (d.version ? ' <small>v' + esc(d.version) + '</small>' : '') + '</summary>' +
                (d.body ? '<p style="white-space:pre-line;margin:10px 0">' + esc(d.body) + '</p>' : '') + link + '</details>';
        }).join('') + '</div>';
    }
    function mount() {
        var art = document.querySelector('#product-box .pd'); if (!art || document.getElementById('pe-sec')) return !!document.getElementById('pe-sec');
        addStyles();
        var docs = document.createElement('section'); docs.id = 'pe-docs'; docs.className = 'pe-sec'; docs.hidden = true;
        art.insertAdjacentElement('afterend', docs); renderDocs(docs);
        var sec = document.createElement('section'); sec.id = 'pe-sec'; sec.className = 'pe-sec';
        docs.insertAdjacentElement('afterend', sec); renderSection(); return true;
    }

    /* ---------- popups ---------- */
    var back = null;
    function close() { if (back) { back.remove(); back = null; } }
    function open(html) {
        close(); back = document.createElement('div'); back.className = 'pe-back';
        back.innerHTML = '<div class="pe-modal" role="dialog" aria-modal="true"><button type="button" class="pe-x" data-pe="close" aria-label="' + t('close') + '">×</button>' + html + '</div>';
        document.body.appendChild(back); setTimeout(function () { back && back.classList.add('show'); }, 10);
    }
    function showErr(m) { var e = back && back.querySelector('.pe-err'); if (e) e.textContent = m || ''; }

    var picked = 0;
    function openRate() {
        var id = pid(), mine = reviewsOf(id).filter(function (r) { return r.uid === me().id; })[0], list = reviewsOf(id);
        var avg = list.length ? list.reduce(function (a, r) { return a + r.stars; }, 0) / list.length : 0;
        picked = mine ? mine.stars : 0;
        open('<div class="pe-big"><span>★</span> ' + avg.toFixed(1) + '/5<small>(' + list.length + ')</small></div><h3>' + t('rateTitle') + '</h3>' +
            '<div class="pe-stars">' + [1, 2, 3, 4, 5].map(function (i) { return '<button type="button" data-pe="star" data-v="' + i + '" class="' + (i <= picked ? 'on' : '') + '" aria-label="' + i + '">★</button>'; }).join('') + '</div>' +
            '<textarea id="pe-text" placeholder="' + t('rateHint') + '">' + esc(mine ? mine.text : '') + '</textarea><p class="pe-err"></p>' +
            '<div class="pe-center"><button type="button" class="pe-btn" data-pe="saveRate">' + t('rate') + '</button></div>');
    }
    function saveRate() {
        if (!picked) return showErr(t('pickStars'));
        var id = pid(), u = me(), all = lsGet('boda_reviews', {}), list = (all[id] || []).filter(function (r) { return r.uid !== u.id; });
        list.push({ uid: u.id, user: u.name, stars: picked, text: (document.getElementById('pe-text').value || '').trim().slice(0, 500), time: Date.now() });
        all[id] = list; lsSet('boda_reviews', all);
        var rt = lsGet('boda_ratings', {}); rt[id] = picked; lsSet('boda_ratings', rt);              /* keeps the inline stars + "My reviews" page in sync */
        var m = lsGet('boda_meta', {}), im = document.querySelector('#product-box .pd-media img');
        if (!m[id]) { m[id] = { name: pname(), img: im ? im.src : '', price: +((document.querySelector('#product-box .pd') || {}).dataset || {}).price || 0, cat: ((document.querySelector('#product-box .pd') || {}).dataset || {}).cat || '' }; lsSet('boda_meta', m); }
        document.querySelectorAll('#product-box .pd .star').forEach(function (s) { s.classList.toggle('on', +s.dataset.v <= picked); });
        close(); renderSection(); toast(t('thanksRate'));
    }
    function openReport() {
        var l = lang();
        open('<h3>' + t('reportTitle') + '</h3><div class="pe-reasons">' + REASONS.map(function (r) {
            return '<label><input type="radio" name="pe-reason" value="' + r[0] + '"> ' + (r[1][l] || r[1].en) + '</label>';
        }).join('') + '</div><textarea id="pe-text" placeholder="' + t('reportHint') + '"></textarea><p class="pe-err"></p>' +
            '<div class="pe-btns"><button type="button" class="pe-btn" data-pe="saveReport">' + t('confirm') + '</button><button type="button" class="pe-btn grey" data-pe="close">' + t('cancel') + '</button></div>');
    }
    function saveReport() {
        var chk = back.querySelector('input[name="pe-reason"]:checked'); if (!chk) return showErr(t('pickReason'));
        var id = pid(), u = me(), reps = lsGet('boda_reports', []);
        if (reps.some(function (r) { return r.pid === id && r.uid === u.id; })) { close(); return toast(t('already')); }
        var reasonEn = (REASONS.filter(function (r) { return r[0] === chk.value; })[0] || [0, { en: chk.value }])[1].en;
        var text = (document.getElementById('pe-text').value || '').trim().slice(0, 1000), now = Date.now();
        reps.unshift({ id: 'R' + now.toString(36), pid: id, name: pname(), reason: chk.value, text: text, uid: u.id, user: u.name, time: now });
        lsSet('boda_reports', reps);
        /* show it in Admin > Complaints & warnings */
        var comp = lsGet('boda_complaints', []);
        comp.unshift({ id: 'C' + now.toString(36), no: 'C-' + String(comp.length + 1).padStart(3, '0'), customer: u.name, contact: u.id === 'guest' ? '' : u.id, order: '', subject: 'Product report: ' + pname() + ' (' + id + ') — ' + reasonEn, prio: (chk.value === 'fraud' || chk.value === 'fake') ? 'high' : 'med', status: 'open', msg: text || reasonEn, reply: '', created: now });
        lsSet('boda_complaints', comp);
        close(); toast(t('thanksReport'));
    }

    document.addEventListener('click', function (e) {
        var b = e.target.closest && e.target.closest('[data-pe]');
        if (b) {
            var a = b.dataset.pe;
            if (a === 'close') close();
            else if (a === 'rate') openRate();
            else if (a === 'report') openReport();
            else if (a === 'star') { picked = +b.dataset.v; back.querySelectorAll('.pe-stars button').forEach(function (x) { x.classList.toggle('on', +x.dataset.v <= picked); }); showErr(''); }
            else if (a === 'saveRate') saveRate();
            else if (a === 'saveReport') saveReport();
            return;
        }
        if (back && e.target === back) close();
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });

    /* ---------- boot: wait for the product page to be rendered ---------- */
    function boot() {
        if (new URLSearchParams(location.search).get('page') !== 'product') return;
        var tries = 0, h = setInterval(function () { tries++; if (mount() || tries > 60) clearInterval(h); }, 100);
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
