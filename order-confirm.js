/* ============================================================
   Boda Store — order-confirm.js
   صفحة "تأكيد الطلب" — منفصلة تمامًا عن صفحة السلة:
     • تعديل الكمية لكل منتج (+ / − / كتابة الرقم) بدون ما ترجع للسلة
     • حذف منتج من الطلب، وإضافة منتج جديد للطلب
     • تعديل بيانات الشحن
     • إلغاء الطلب، وحذفه نهائيًا بعد الإلغاء
     • القفل التلقائي لما الطلب يتشحن/يتسلّم/يتلغي
   الرابط:  index.html?page=order-confirm&id=BD-123456
   الطلبات متخزنة في localStorage (boda_orders) — نفس المصدر اللي لوحة الأدمن بتقراه.
   ============================================================ */
(function () {
    'use strict';
    if (window.BODA_ADMIN) return;

    /* ---------- i18n ---------- */
    var TXT = {
        title: { ar: 'تأكيد الطلب ✅', en: 'Order Confirmation ✅', fr: 'Confirmation de commande ✅', de: 'Bestellbestätigung ✅' },
        intro: { ar: 'راجع طلبك — تقدر تعدّل الكميات أو تحذف منتج أو تضيف منتج تاني قبل ما يتشحن.', en: 'Review your order — change quantities, remove items or add more products before it ships.', fr: 'Vérifiez votre commande : modifiez les quantités, retirez ou ajoutez des produits avant l’expédition.', de: 'Prüfen Sie Ihre Bestellung: Mengen ändern, Artikel entfernen oder hinzufügen, bevor sie versandt wird.' },
        thanks: { ar: 'شكرًا ليك! تم استلام طلبك', en: 'Thank you! Your order was received', fr: 'Merci ! Commande reçue', de: 'Danke! Bestellung erhalten' },
        details: { ar: 'تفاصيل الطلب', en: 'Order details', fr: 'Détails de la commande', de: 'Bestelldetails' },
        order: { ar: 'طلب رقم', en: 'Order', fr: 'Commande', de: 'Bestellung' },
        placedOn: { ar: 'اتعمل في', en: 'Placed', fr: 'Passée le', de: 'Aufgegeben' },
        items: { ar: 'المنتجات', en: 'Items', fr: 'Articles', de: 'Artikel' },
        each: { ar: 'للقطعة', en: 'each', fr: 'pièce', de: 'je Stück' },
        qty: { ar: 'الكمية', en: 'Quantity', fr: 'Quantité', de: 'Menge' },
        remove: { ar: 'حذف', en: 'Remove', fr: 'Retirer', de: 'Entfernen' },
        addMore: { ar: 'إضافة منتج للطلب', en: 'Add a product to this order', fr: 'Ajouter un produit', de: 'Produkt hinzufügen' },
        searchPh: { ar: 'ابحث باسم المنتج أو القسم...', en: 'Search by product name or category...', fr: 'Rechercher un produit...', de: 'Produkt suchen...' },
        add: { ar: 'إضافة', en: 'Add', fr: 'Ajouter', de: 'Hinzufügen' },
        noRes: { ar: 'مفيش منتجات مطابقة.', en: 'No matching products.', fr: 'Aucun produit.', de: 'Keine Treffer.' },
        ship: { ar: 'بيانات الشحن', en: 'Shipping details', fr: 'Livraison', de: 'Lieferdaten' },
        name: { ar: 'الاسم بالكامل', en: 'Full name', fr: 'Nom complet', de: 'Voller Name' },
        phone: { ar: 'التليفون', en: 'Phone', fr: 'Téléphone', de: 'Telefon' },
        address: { ar: 'العنوان', en: 'Address', fr: 'Adresse', de: 'Adresse' },
        city: { ar: 'المدينة', en: 'City', fr: 'Ville', de: 'Stadt' },
        payment: { ar: 'طريقة الدفع', en: 'Payment', fr: 'Paiement', de: 'Zahlung' },
        summary: { ar: 'ملخص الطلب', en: 'Order summary', fr: 'Récapitulatif', de: 'Zusammenfassung' },
        total: { ar: 'الإجمالي', en: 'Total', fr: 'Total', de: 'Gesamt' },
        pieces: { ar: 'قطعة', en: 'pcs', fr: 'pcs', de: 'Stk.' },
        free: { ar: '✅ طلبك مؤهل للتوصيل المجاني!', en: '✅ You qualify for Free Delivery!', fr: '✅ Livraison gratuite !', de: '✅ Kostenloser Versand!' },
        moreFree: { ar: '🚚 ضيف', en: '🚚 Add', fr: '🚚 Ajoutez', de: '🚚 Noch' },
        moreFree2: { ar: 'للتوصيل المجاني.', en: 'more for Free Delivery.', fr: 'pour la livraison gratuite.', de: 'für kostenlosen Versand.' },
        save: { ar: 'حفظ التعديلات', en: 'Save changes', fr: 'Enregistrer', de: 'Änderungen speichern' },
        discard: { ar: 'تراجع عن التعديلات', en: 'Discard changes', fr: 'Annuler les modifications', de: 'Verwerfen' },
        dirty: { ar: 'عندك تعديلات لسه ماتحفظتش.', en: 'You have unsaved changes.', fr: 'Modifications non enregistrées.', de: 'Nicht gespeicherte Änderungen.' },
        cancelOrder: { ar: 'إلغاء الطلب', en: 'Cancel order', fr: 'Annuler la commande', de: 'Bestellung stornieren' },
        removeOrder: { ar: 'حذف الطلب نهائيًا', en: 'Delete order permanently', fr: 'Supprimer définitivement', de: 'Endgültig löschen' },
        help: { ar: 'محتاج مساعدة؟ كلّم الدعم الفني', en: 'Need help? Talk to support', fr: 'Besoin d’aide ? Support', de: 'Hilfe? Support kontaktieren' },
        myOrders: { ar: 'كل طلباتي', en: 'All my orders', fr: 'Mes commandes', de: 'Alle Bestellungen' },
        shop: { ar: 'كمّل تسوّق', en: 'Continue shopping', fr: 'Continuer', de: 'Weiter einkaufen' },
        locked: { ar: 'الطلب ده مش ممكن يتعدّل دلوقتي لأن حالته', en: 'This order can no longer be edited because its status is', fr: 'Cette commande n’est plus modifiable : statut', de: 'Diese Bestellung kann nicht mehr geändert werden. Status:' },
        cancelledMsg: { ar: 'الطلب ده اتلغى.', en: 'This order was cancelled.', fr: 'Cette commande a été annulée.', de: 'Diese Bestellung wurde storniert.' },
        saved: { ar: 'تم حفظ التعديلات ✅', en: 'Changes saved ✅', fr: 'Modifications enregistrées ✅', de: 'Änderungen gespeichert ✅' },
        nothing: { ar: 'مفيش تعديلات للحفظ.', en: 'Nothing to save.', fr: 'Rien à enregistrer.', de: 'Nichts zu speichern.' },
        lockedNow: { ar: 'الطلب اتغيّرت حالته ومبقاش ينفع يتعدّل.', en: 'The order status changed and it can no longer be edited.', fr: 'Le statut a changé : modification impossible.', de: 'Status geändert: keine Änderung mehr möglich.' },
        badShip: { ar: 'كمّل بيانات الشحن (الاسم، تليفون صحيح، العنوان، المدينة).', en: 'Complete the shipping details (name, valid phone, address, city).', fr: 'Complétez les informations de livraison.', de: 'Bitte Lieferdaten vollständig ausfüllen.' },
        confRemove: { ar: 'تحذف المنتج ده من الطلب؟', en: 'Remove this item from the order?', fr: 'Retirer cet article ?', de: 'Artikel entfernen?' },
        confLast: { ar: 'ده آخر منتج في الطلب. حذفه معناه إلغاء الطلب كله. تكمّل؟', en: 'This is the last item. Removing it cancels the whole order. Continue?', fr: 'Dernier article : cela annule la commande. Continuer ?', de: 'Letzter Artikel: Die Bestellung wird storniert. Fortfahren?' },
        confCancel: { ar: 'تلغي الطلب ده؟ مش هتقدر تعدّله بعد كده.', en: 'Cancel this order? You will not be able to edit it afterwards.', fr: 'Annuler cette commande ?', de: 'Bestellung stornieren?' },
        confDelete: { ar: 'تحذف الطلب نهائيًا من قايمتك؟', en: 'Delete this order permanently from your list?', fr: 'Supprimer définitivement ?', de: 'Endgültig löschen?' },
        cancelled: { ar: 'تم إلغاء الطلب', en: 'Order cancelled', fr: 'Commande annulée', de: 'Bestellung storniert' },
        deleted: { ar: 'تم حذف الطلب', en: 'Order deleted', fr: 'Commande supprimée', de: 'Bestellung gelöscht' },
        maxQty: { ar: 'المتاح من المنتج ده', en: 'Only this many are available:', fr: 'Stock disponible :', de: 'Verfügbar:' },
        outStock: { ar: 'المنتج ده غير متاح حاليًا.', en: 'This product is out of stock.', fr: 'Produit indisponible.', de: 'Nicht auf Lager.' },
        added: { ar: 'اتضاف للطلب', en: 'added to the order', fr: 'ajouté', de: 'hinzugefügt' },
        history: { ar: 'سجل التعديلات', en: 'Edit history', fr: 'Historique', de: 'Verlauf' },
        pickTitle: { ar: 'اختار الطلب اللي عايز تراجعه', en: 'Choose the order to review', fr: 'Choisissez une commande', de: 'Bestellung wählen' },
        nf: { ar: 'مش لاقي الطلب ده على المتصفح ده.', en: 'We could not find this order in this browser.', fr: 'Commande introuvable.', de: 'Bestellung nicht gefunden.' },
        none: { ar: 'مفيش طلبات لسه.', en: 'You have no orders yet.', fr: 'Aucune commande.', de: 'Noch keine Bestellungen.' },
        open: { ar: 'فتح', en: 'Open', fr: 'Ouvrir', de: 'Öffnen' },
        hLine: { ar: { add: 'أضفت', del: 'حذفت', qty: 'غيّرت كمية', ship: 'عدّلت بيانات الشحن' }, en: { add: 'Added', del: 'Removed', qty: 'Changed quantity of', ship: 'Updated shipping details' }, fr: { add: 'Ajouté', del: 'Retiré', qty: 'Quantité modifiée :', ship: 'Livraison modifiée' }, de: { add: 'Hinzugefügt', del: 'Entfernt', qty: 'Menge geändert:', ship: 'Lieferdaten geändert' } },
        st: {
            Pending: { ar: 'قيد الانتظار', en: 'Pending', fr: 'En attente', de: 'Ausstehend' },
            Processing: { ar: 'جاري التجهيز', en: 'Processing', fr: 'En préparation', de: 'In Bearbeitung' },
            Shipped: { ar: 'تم الشحن', en: 'Shipped', fr: 'Expédiée', de: 'Versandt' },
            Delivered: { ar: 'تم التسليم', en: 'Delivered', fr: 'Livrée', de: 'Geliefert' },
            Cancelled: { ar: 'ملغي', en: 'Cancelled', fr: 'Annulée', de: 'Storniert' }
        },
        helpMsg: { ar: 'عايز مساعدة في طلب رقم ', en: 'I need help with order ', fr: 'J’ai besoin d’aide pour la commande ', de: 'Ich brauche Hilfe zur Bestellung ' }
    };
    var STEPS = ['Pending', 'Processing', 'Shipped', 'Delivered'];
    function lang() { var l = 'en'; try { l = localStorage.getItem('boda_language') || document.documentElement.lang || 'en'; } catch (e) { } return ['ar', 'en', 'fr', 'de'].indexOf(l) > -1 ? l : 'en'; }
    function t(k) { var o = TXT[k]; return o ? (o[lang()] || o.en) : k; }
    function stL(s) { var o = TXT.st[s]; return o ? (o[lang()] || o.en) : s; }

    /* ---------- helpers ---------- */
    function E(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
    function lsGet(k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } }
    function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } }
    function $(id) { return document.getElementById(id); }
    function R2(n) { return Math.round(n * 100) / 100; }
    function money(n) { return '$' + R2(n).toLocaleString('en-US'); }
    function say(m) { if (typeof window.toast === 'function') window.toast(m); }
    function user() { return lsGet('boda_user', null); }
    function url(id) { return 'index.html?page=order-confirm&id=' + encodeURIComponent(id); }
    function catalog() { try { return typeof window.allProductsRaw === 'function' ? window.allProductsRaw() : (window.BODA_PRODUCTS || []); } catch (e) { return []; } }
    function prod(id) { return catalog().filter(function (p) { return p.id === id; })[0] || null; }
    function imgOf(i) { try { return typeof window.liveImg === 'function' ? window.liveImg(i.id, i.img) : (i.img || ''); } catch (e) { return i.img || ''; } }
    function maxFor(id) { var p = prod(id); return p && typeof p.qty === 'number' && p.qty >= 0 ? Math.min(99, p.qty) : 99; }
    function clone(o) { return JSON.parse(JSON.stringify(o)); }
    function mine() {
        var u = user(), all = lsGet('boda_orders', []);
        return u ? all.filter(function (o) { return o.user === u.email || o.user === 'guest'; }) : all;
    }
    function stat(o) { if (o.cancelled) return 'Cancelled'; try { if (typeof window.statusOf === 'function') return window.statusOf(o); } catch (e) { } return o.status || 'Pending'; }
    function editable(o) { var s = stat(o); return !o.cancelled && (s === 'Pending' || s === 'Processing'); }
    function sumOf(items) { return R2(items.reduce(function (n, i) { return n + i.price * i.qty; }, 0)); }

    /* ---------- state ---------- */
    var D = null;          // { id, items, ship, dirty, placed }
    var box = null;

    function findOrder(id) { return mine().filter(function (o) { return o.id === id; })[0] || null; }
    function validPhone(v) { return String(v || '').replace(/\D/g, '').length >= 7; }
    function shipOk(s) { return s.name && s.address && s.city && validPhone(s.phone); }

    function styles() {
        if ($('oc-style')) return;
        var s = document.createElement('style'); s.id = 'oc-style';
        s.textContent = [
            '.oc-banner{display:flex;gap:16px;align-items:center;background:var(--surface,#fff);border:1px solid var(--line,#dde3ec);border-inline-start:5px solid #2ecc71;border-radius:12px;padding:18px 20px;margin-bottom:18px}',
            '.oc-banner.info{border-inline-start-color:var(--brand,#d7263d)}.oc-banner.bad{border-inline-start-color:#c0392b}',
            '.oc-ico{font-size:2.2rem;line-height:1}.oc-banner h2{margin:0 0 4px;font-size:1.25rem}.oc-banner p{margin:0;color:var(--ink-soft,#4a5568);font-size:.9rem;display:flex;gap:10px;flex-wrap:wrap;align-items:center}',
            '.oc-grid{display:grid;grid-template-columns:minmax(0,1fr) 340px;gap:20px;align-items:start}',
            '@media(max-width:900px){.oc-grid{grid-template-columns:1fr}}',
            '.oc-card{background:var(--surface,#fff);border:1px solid var(--line,#dde3ec);border-radius:12px;padding:18px 20px;margin-bottom:18px}',
            '.oc-card h3{margin:0 0 14px;font-size:1.05rem}',
            '.oc-item{display:grid;grid-template-columns:64px minmax(0,1fr) auto auto auto;gap:14px;align-items:center;padding:12px 0;border-top:1px solid var(--line,#dde3ec)}',
            '.oc-item:first-of-type{border-top:0}',
            '.oc-item img,.oc-thumb{width:64px;height:64px;object-fit:contain;background:#fff;border-radius:8px;border:1px solid var(--line,#dde3ec);display:grid;place-items:center;font-weight:700}',
            '.oc-item strong{display:block;font-size:.95rem}.oc-item small{color:var(--ink-soft,#4a5568)}',
            '.oc-qty{display:inline-flex;border:1px solid var(--line,#dde3ec);border-radius:8px;overflow:hidden}',
            '.oc-qty button{width:34px;border:0;background:var(--paper,#f4f6fa);color:var(--ink,#0f1b2d);font-size:1.15rem;cursor:pointer}',
            '.oc-qty button:disabled{opacity:.4;cursor:not-allowed}',
            '.oc-qty input{width:56px;text-align:center;border:0;font:inherit;background:var(--surface,#fff);color:var(--ink,#0f1b2d);padding:8px 0;-moz-appearance:textfield}',
            '.oc-qty input::-webkit-outer-spin-button,.oc-qty input::-webkit-inner-spin-button{-webkit-appearance:none}',
            '.oc-sub{font-weight:700;min-width:74px;text-align:end}',
            '.oc-del{border:1px solid #e3b3b3;color:#c0392b;background:transparent;border-radius:8px;padding:6px 10px;cursor:pointer;font:inherit;font-size:.82rem}.oc-del:hover{background:#c0392b;color:#fff}',
            '@media(max-width:640px){.oc-item{grid-template-columns:56px 1fr;row-gap:8px}.oc-item .oc-qty,.oc-item .oc-sub,.oc-item .oc-del{grid-column:2}.oc-sub{text-align:start}}',
            '.oc-add{margin-top:14px;border-top:1px dashed var(--line,#dde3ec);padding-top:14px}',
            '.oc-add input,.oc-form input{width:100%;box-sizing:border-box;padding:10px 12px;border:1.5px solid var(--line,#dde3ec);border-radius:8px;font:inherit;background:var(--surface,#fff);color:var(--ink,#0f1b2d)}',
            '.oc-add input:focus,.oc-form input:focus{outline:none;border-color:var(--brand,#d7263d)}',
            '.oc-res{display:flex;flex-direction:column;gap:6px;margin-top:8px}',
            '.oc-r{display:flex;align-items:center;gap:10px;padding:8px;border:1px solid var(--line,#dde3ec);border-radius:8px}',
            '.oc-r img{width:40px;height:40px;object-fit:contain;background:#fff;border-radius:6px}.oc-r span{flex:1;min-width:0;font-size:.88rem}.oc-r b{white-space:nowrap}',
            '.oc-btn{border:0;background:var(--brand,#d7263d);color:#fff;border-radius:8px;padding:9px 16px;font:inherit;font-weight:600;cursor:pointer;text-decoration:none;display:inline-block;text-align:center}',
            '.oc-btn:hover{background:var(--brand-dark,#b01c30)}.oc-btn:disabled{opacity:.45;cursor:not-allowed}',
            '.oc-btn.ghost{background:transparent;color:var(--brand,#d7263d);border:1.5px solid var(--brand,#d7263d)}.oc-btn.ghost:hover{background:var(--brand,#d7263d);color:#fff}',
            '.oc-btn.danger{background:transparent;color:#c0392b;border:1.5px solid #c0392b}.oc-btn.danger:hover{background:#c0392b;color:#fff}',
            '.oc-form{display:grid;grid-template-columns:1fr 1fr;gap:12px}.oc-form label{font-size:.82rem;color:var(--ink-soft,#4a5568);display:flex;flex-direction:column;gap:5px}',
            '.oc-form .full{grid-column:1/-1}@media(max-width:560px){.oc-form{grid-template-columns:1fr}}',
            '.oc-line{display:flex;justify-content:space-between;gap:10px;padding:6px 0;font-size:.9rem}',
            '.oc-tot{display:flex;justify-content:space-between;border-top:1px solid var(--line,#dde3ec);margin-top:8px;padding-top:12px;font-size:1.15rem;font-weight:700}.oc-tot strong{color:var(--brand,#d7263d)}',
            '.oc-side{position:sticky;top:14px}.oc-side .oc-btn{width:100%;margin-top:10px}',
            '.oc-warn{background:#fff8e1;color:#7a5b00;border:1px dashed #e0b400;border-radius:8px;padding:9px 12px;font-size:.84rem;margin-top:12px}',
            '.oc-lock{background:var(--paper,#f4f6fa);border-radius:8px;padding:10px 12px;font-size:.88rem;margin-bottom:14px}',
            '.oc-hist{margin:0;padding-inline-start:18px;font-size:.84rem;color:var(--ink-soft,#4a5568)}',
            '.oc-pick{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}'
        ].join('\n');
        document.head.appendChild(s);
    }

    /* ---------- render ---------- */
    function trackHtml(st) {
        if (st === 'Cancelled') return '';
        var step = STEPS.indexOf(st);
        return '<ol class="track">' + STEPS.map(function (s, i) { return '<li class="' + (i < step ? 'done' : i === step ? 'current' : '') + '">' + E(stL(s)) + '</li>'; }).join('') + '</ol>';
    }
    function totals(items) {
        var tot = sumOf(items), pcs = items.reduce(function (n, i) { return n + i.qty; }, 0);
        var note = tot >= 500 ? t('free') : (t('moreFree') + ' ' + money(500 - tot) + ' ' + t('moreFree2'));
        return { tot: tot, pcs: pcs, note: note, free: tot >= 500 };
    }
    function itemRow(i, n, canEdit) {
        var im = imgOf(i), mx = maxFor(i.id);
        var thumb = im ? '<img src="' + E(im) + '" alt="" referrerpolicy="no-referrer">' : '<div class="oc-thumb">' + E((i.name || '?').charAt(0)) + '</div>';
        var qty = canEdit
            ? '<div class="oc-qty"><button type="button" data-oc="minus" data-n="' + n + '" aria-label="-"' + (i.qty <= 1 ? ' disabled' : '') + '>−</button>' +
            '<input type="number" inputmode="numeric" min="1" max="' + mx + '" value="' + i.qty + '" data-n="' + n + '" aria-label="' + E(t('qty')) + '">' +
            '<button type="button" data-oc="plus" data-n="' + n + '" aria-label="+"' + (i.qty >= mx ? ' disabled' : '') + '>+</button></div>'
            : '<div class="oc-sub" style="text-align:start">× ' + i.qty + '</div>';
        var parts = [].concat(i.extras || [], i.options || [], i.selectedOptions || [], i.components || [], i.features || []).filter(Boolean);
        var meta = [i.condition === 'used' ? 'مستعمل' : 'جديد', i.brand ? 'الماركة: ' + i.brand : '', (i.colors || []).length ? 'الألوان: ' + i.colors.join('، ') : '', (i.sizes || []).length ? 'المقاسات: ' + i.sizes.join('، ') : ''].filter(Boolean);
        return '<div class="oc-item">' + thumb + '<div><strong>' + E(i.name) + '</strong><small>' + money(i.price) + ' ' + E(t('each')) + (i.cat ? ' · ' + E(i.cat) : '') + (meta.length ? '<br>' + E(meta.join(' · ')) : '') + (parts.length ? '<br>المكونات / المواصفات: ' + E(parts.join('، ')) : '') + (i.stock === false ? '<br><b style="color:#c0392b">غير متوفر</b>' : '<br><b style="color:#218838">متوفر</b>') + '</small></div>' + qty +
            '<div class="oc-sub">' + money(i.price * i.qty) + '</div>' +
            (canEdit ? '<button type="button" class="oc-del" data-oc="del" data-n="' + n + '">' + E(t('remove')) + '</button>' : '<span></span>') + '</div>';
    }

    function render() {
        if (!box) return;
        var o = findOrder(D.id); if (!o) return pickView(true);
        var st = stat(o), can = editable(o), tt = totals(D.items), s = D.ship;
        var hl = '';
        if (o.history && o.history.length) hl = '<section class="oc-card"><h3>' + E(t('history')) + '</h3><ul class="oc-hist">' + o.history.slice(-6).reverse().map(function (h) { return '<li>' + E(new Date(h.t).toLocaleString()) + ' — ' + E(h.text) + '</li>'; }).join('') + '</ul></section>';
        var lock = can ? '' : '<div class="oc-lock">' + (o.cancelled ? E(t('cancelledMsg')) : E(t('locked')) + ' <b>' + E(stL(st)) + '</b>') + '</div>';
        var banner = '<div class="oc-banner ' + (o.cancelled ? 'bad' : D.placed ? '' : 'info') + '"><div class="oc-ico">' + (o.cancelled ? '❌' : D.placed ? '✅' : '📦') + '</div><div><h2>' + E(D.placed && !o.cancelled ? t('thanks') : t('details')) + '</h2>' +
            '<p><span>' + E(t('order')) + ' <b>' + E(o.id) + '</b></span><span>' + E(t('placedOn')) + ' ' + E(new Date(o.created).toLocaleString()) + '</span><span class="status s-' + E(st.toLowerCase()) + '">' + E(stL(st)) + '</span></p></div></div>';

        var itemsHtml = D.items.map(function (i, n) { return itemRow(i, n, can); }).join('');
        var addHtml = can ? '<div class="oc-add"><strong>' + E(t('addMore')) + '</strong><div style="margin-top:8px"><input id="oc-q" type="search" placeholder="' + E(t('searchPh')) + '" autocomplete="off"></div><div class="oc-res" id="oc-res"></div></div>' : '';
        var f = function (id, label, val, type, full) { return '<label class="' + (full ? 'full' : '') + '">' + E(label) + '<input id="oc-' + id + '" type="' + type + '" value="' + E(val || '') + '"' + (can ? '' : ' disabled') + '></label>'; };
        var shipHtml = '<div class="oc-form">' + f('name', t('name'), s.name, 'text') + f('phone', t('phone'), s.phone, 'tel') + f('address', t('address'), s.address, 'text', true) + f('city', t('city'), s.city, 'text') +
            '<label>' + E(t('payment')) + '<input type="text" value="' + E(o.payment || '') + '" disabled></label></div>';

        var side = '<aside class="oc-card oc-side"><h3>' + E(t('summary')) + '</h3>' +
            '<div class="oc-line"><span>' + E(t('items')) + '</span><span>' + tt.pcs + ' ' + E(t('pieces')) + '</span></div>' +
            '<div class="oc-line"><span>حالة الطلب</span><b>' + E(stL(st)) + '</b></div>' + '<div class="oc-line"><span>طريقة الدفع</span><b>' + E(o.payment || '—') + '</b></div>' + '<div class="oc-line"><span>الشحن والتوصيل</span><b>' + money(o.shippingFee || 0) + '</b></div>' + '<div class="oc-tot"><span>' + E(t('total')) + '</span><strong id="oc-total">' + money(tt.tot + (Number(o.shippingFee) || 0)) + '</strong></div>' +
            '<div class="cart-shipping-note' + (tt.free ? ' free' : '') + '" style="margin-top:12px">' + E(tt.note) + '</div>' +
            (can ? '<div class="oc-warn" id="oc-dirty"' + (D.dirty ? '' : ' hidden') + '>' + E(t('dirty')) + '</div>' +
                '<button type="button" class="oc-btn" id="oc-save" data-oc="save"' + (D.dirty ? '' : ' disabled') + '>' + E(t('save')) + '</button>' +
                '<button type="button" class="oc-btn ghost" id="oc-discard" data-oc="discard"' + (D.dirty ? '' : ' disabled') + '>' + E(t('discard')) + '</button>' +
                '<button type="button" class="oc-btn danger" data-oc="cancel">' + E(t('cancelOrder')) + '</button>' : '') +
            (o.cancelled || st === 'Delivered' ? '<button type="button" class="oc-btn danger" data-oc="delete">' + E(t('removeOrder')) + '</button>' : '') +
            '<button type="button" class="oc-btn ghost" data-oc="help">' + E(t('help')) + '</button>' +
            '<a class="oc-btn ghost" style="width:100%;box-sizing:border-box;margin-top:10px" href="index.html?page=orders">' + E(t('myOrders')) + '</a>' +
            '<a class="oc-btn ghost" style="width:100%;box-sizing:border-box;margin-top:10px" href="index.html?page=products">' + E(t('shop')) + '</a></aside>';

        box.innerHTML = banner + trackHtml(st) + '<div class="oc-grid"><div>' + lock + '<section class="oc-card"><h3>' + E(t('items')) + '</h3>' + itemsHtml + addHtml + '</section>' +
            '<section class="oc-card"><h3>' + E(t('ship')) + '</h3>' + shipHtml + '</section>' + hl + '</div>' + side + '</div>';
    }

    function pickView(notFound) {
        var all = mine();
        var html = notFound ? '<div class="oc-banner bad"><div class="oc-ico">❓</div><div><h2>' + E(t('nf')) + '</h2></div></div>' : '';
        if (!all.length) html += '<div class="empty-state"><div class="empty-big">📦</div><h3>' + E(t('none')) + '</h3><a class="favorites-btn" href="index.html?page=products">' + E(t('shop')) + '</a></div>';
        else html += '<section class="oc-card"><h3>' + E(t('pickTitle')) + '</h3>' + all.slice(0, 15).map(function (o) {
            var st = stat(o);
            return '<div class="oc-item" style="grid-template-columns:1fr auto auto"><div><strong>' + E(o.id) + '</strong><small>' + E(new Date(o.created).toLocaleString()) + ' · ' + money(o.total) + '</small></div><span class="status s-' + E(st.toLowerCase()) + '">' + E(stL(st)) + '</span><a class="oc-btn ghost" href="' + url(o.id) + '">' + E(t('open')) + '</a></div>';
        }).join('') + '</section>';
        box.innerHTML = html;
    }

    /* ---------- actions ---------- */
    function markDirty() {
        D.dirty = true;
        var d = $('oc-dirty'), s = $('oc-save'), r = $('oc-discard');
        if (d) d.hidden = false; if (s) s.disabled = false; if (r) r.disabled = false;
    }
    function setQty(n, q) {
        var it = D.items[n]; if (!it) return;
        var mx = maxFor(it.id); q = parseInt(q, 10) || 1;
        if (q > mx) { q = mx; say(t('maxQty') + ' ' + mx); }
        if (q < 1) q = 1;
        if (q !== it.qty) { it.qty = q; D.dirty = true; }
        render();
    }
    function delItem(n) {
        if (D.items.length === 1) { if (confirm(t('confLast'))) cancelOrder(true); return; }
        if (!confirm(t('confRemove'))) return;
        D.items.splice(n, 1); D.dirty = true; render();
    }
    function addProduct(id) {
        var p = prod(id); if (!p || p.hidden) return;
        var ex = D.items.filter(function (x) { return x.id === id; })[0], mx = maxFor(id);
        if (p.stock === false || mx < 1) return say(t('outStock'));
        if (ex) { if (ex.qty >= mx) return say(t('maxQty') + ' ' + mx); ex.qty++; }
        else D.items.push({ id: p.id, name: p.name, price: +p.price || 0, cat: p.cat || '', img: p.img || '', qty: 1 });
        D.dirty = true; var q = $('oc-q'), v = q ? q.value : ''; render();
        var q2 = $('oc-q'); if (q2) { q2.value = v; q2.focus(); search(v); }
        say(p.name + ' ' + t('added'));
    }
    function search(v) {
        var res = $('oc-res'); if (!res) return;
        v = String(v || '').trim().toLowerCase(); if (v.length < 2) { res.innerHTML = ''; return; }
        var list = catalog().filter(function (p) { return !p.hidden && p.stock !== false && (String(p.name).toLowerCase().indexOf(v) > -1 || String(p.cat || '').toLowerCase().indexOf(v) > -1 || String(p.id).toLowerCase() === v); }).slice(0, 6);
        res.innerHTML = list.length ? list.map(function (p) {
            return '<div class="oc-r">' + (p.img ? '<img src="' + E(p.img) + '" alt="" referrerpolicy="no-referrer">' : '') + '<span>' + E(p.name) + '</span><b>' + money(+p.price || 0) + '</b><button type="button" class="oc-btn" data-oc="addp" data-id="' + E(p.id) + '">' + E(t('add')) + '</button></div>';
        }).join('') : '<small>' + E(t('noRes')) + '</small>';
    }
    function readShip() {
        var g = function (id) { var e = $('oc-' + id); return e ? e.value.trim() : ''; };
        return { name: g('name'), phone: g('phone'), address: g('address'), city: g('city') };
    }
    function describeChanges(o) {
        var H = TXT.hLine[lang()] || TXT.hLine.en, out = [], before = {}, after = {};
        o.items.forEach(function (i) { before[i.id] = i; }); D.items.forEach(function (i) { after[i.id] = i; });
        D.items.forEach(function (i) { if (!before[i.id]) out.push(H.add + ' ' + i.name + ' × ' + i.qty); else if (before[i.id].qty !== i.qty) out.push(H.qty + ' ' + i.name + ': ' + before[i.id].qty + ' → ' + i.qty); });
        o.items.forEach(function (i) { if (!after[i.id]) out.push(H.del + ' ' + i.name); });
        var a = o.ship || {}, b = D.ship;
        if (a.name !== b.name || a.phone !== b.phone || a.address !== b.address || a.city !== b.city) out.push(H.ship);
        return out;
    }
    function save() {
        var all = lsGet('boda_orders', []), o = all.filter(function (x) { return x.id === D.id; })[0];
        if (!o) return;
        if (!editable(o)) { say(t('lockedNow')); D.dirty = false; D.items = clone(o.items); D.ship = clone(o.ship || {}); return render(); }
        D.ship = readShip();
        if (!shipOk(D.ship)) return say(t('badShip'));
        var changes = describeChanges(o);
        if (!changes.length) { D.dirty = false; say(t('nothing')); return render(); }
        o.items = clone(D.items); o.subtotal = sumOf(o.items); o.total = o.subtotal + (Number(o.shippingFee) || 0); o.ship = clone(D.ship); o.edited = Date.now();
        o.history = (o.history || []).concat(changes.map(function (c) { return { t: Date.now(), text: c }; })).slice(-20);
        lsSet('boda_orders', all);
        var meta = lsGet('boda_meta', {}); o.items.forEach(function (i) { meta[i.id] = { name: i.name, img: i.img, price: i.price, cat: i.cat }; }); lsSet('boda_meta', meta);
        try { if (typeof window.notify === 'function') window.notify('Order ' + o.id + ' updated (' + money(o.total) + ').', url(o.id)); } catch (e) { }
        try { if (typeof window.updateBadges === 'function') window.updateBadges(); } catch (e) { }
        D.dirty = false; D.items = clone(o.items); say(t('saved')); render();
    }
    function cancelOrder(skipConfirm) {
        if (!skipConfirm && !confirm(t('confCancel'))) return;
        var all = lsGet('boda_orders', []), o = all.filter(function (x) { return x.id === D.id; })[0]; if (!o) return;
        if (!editable(o)) { say(t('lockedNow')); return render(); }
        o.cancelled = true; o.status = 'Cancelled'; o.edited = Date.now();
        o.history = (o.history || []).concat([{ t: Date.now(), text: t('cancelled') }]).slice(-20);
        lsSet('boda_orders', all);
        try { if (typeof window.notify === 'function') window.notify('Order ' + o.id + ' cancelled.', url(o.id)); } catch (e) { }
        D.dirty = false; D.items = clone(o.items); D.ship = clone(o.ship || {}); say(t('cancelled')); render();
    }
    function deleteOrder() {
        if (!confirm(t('confDelete'))) return;
        lsSet('boda_orders', lsGet('boda_orders', []).filter(function (x) { return x.id !== D.id; }));
        D.dirty = false; say(t('deleted')); setTimeout(function () { location.href = 'index.html?page=orders'; }, 500);
    }
    function help() {
        var msg = t('helpMsg') + D.id;
        if (window.BodaSupport && window.BodaSupport.open) window.BodaSupport.open(msg);
        else location.href = 'index.html?page=contact';
    }

    /* ---------- boot ---------- */
    function boot() {
        if (new URLSearchParams(location.search).get('page') !== 'order-confirm') return;
        box = $('oc-box'); if (!box) return;
        styles();
        var ti = $('oc-title'), intro = $('oc-intro'); if (ti) ti.textContent = t('title'); if (intro) intro.textContent = t('intro');
        var q = new URLSearchParams(location.search), id = q.get('id');
        if (!id) { var m = mine(); if (m.length === 1) { location.replace(url(m[0].id)); return; } return pickView(false); }
        var o = findOrder(id); if (!o) return pickView(true);
        D = { id: o.id, items: clone(o.items), ship: clone(o.ship || {}), dirty: false, placed: q.get('placed') === '1' };
        render();

        box.addEventListener('click', function (e) {
            var b = e.target.closest && e.target.closest('[data-oc]'); if (!b || !D) return;
            var a = b.dataset.oc, n = +b.dataset.n;
            if (a === 'minus') setQty(n, D.items[n].qty - 1);
            else if (a === 'plus') setQty(n, D.items[n].qty + 1);
            else if (a === 'del') delItem(n);
            else if (a === 'addp') addProduct(b.dataset.id);
            else if (a === 'save') save();
            else if (a === 'discard') { var o2 = findOrder(D.id); if (o2) { D.items = clone(o2.items); D.ship = clone(o2.ship || {}); D.dirty = false; render(); } }
            else if (a === 'cancel') cancelOrder(false);
            else if (a === 'delete') deleteOrder();
            else if (a === 'help') help();
        });
        box.addEventListener('change', function (e) {
            if (e.target.matches && e.target.matches('.oc-qty input')) setQty(+e.target.dataset.n, e.target.value);
        });
        box.addEventListener('input', function (e) {
            if (e.target.id === 'oc-q') return search(e.target.value);
            if (e.target.closest && e.target.closest('.oc-form')) { D.ship = readShip(); markDirty(); }
        });
        window.addEventListener('beforeunload', function (e) { if (D && D.dirty) { e.preventDefault(); e.returnValue = ''; } });
        /* the demo timeline can move the order to "Shipped" while the page is open → lock it */
        setInterval(function () { var o3 = D && findOrder(D.id); if (o3 && !editable(o3) && box.querySelector('.oc-qty') && !D.dirty) render(); }, 15000);
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
