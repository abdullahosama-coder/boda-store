/* ============================================================
   Boda Store — order-flow.js
   1) Buy Now  ->  "Choose how to order" popup  ->  side panel (quantity)  ->  checkout
   2) Login page: "Forgot password?" -> email/phone -> activation code -> new password
   Self-contained: it needs no change in app.js. Load it with:
       <script src="order-flow.js" defer></script>
   ============================================================ */
(function () {
    'use strict';

    /* ---------- STORE CONTACT ---------- */
    var CONTACT = window.BODA_CONTACT || {};

    /* ---------- tiny i18n ---------- */
    var TXT = {
        choose: { ar: 'اختر طريقة الطلب', en: 'Choose how to order the product', fr: 'Choisissez comment commander', de: 'Bestellart wählen' },
        via: { ar: 'اطلب من خلال التاجر عن طريق', en: 'Order through the merchant via', fr: 'Commander via le marchand par', de: 'Über den Händler bestellen per' },
        phone: { ar: 'اتصال', en: 'Phone', fr: 'Téléphone', de: 'Telefon' },
        whatsapp: { ar: 'واتساب', en: 'WhatsApp', fr: 'WhatsApp', de: 'WhatsApp' },
        chat: { ar: 'رسالة', en: 'Chat', fr: 'Chat', de: 'Chat' },
        or: { ar: 'أو', en: 'or', fr: 'ou', de: 'oder' },
        fromSite: { ar: 'اطلب من الموقع', en: 'Order from the site', fr: 'Commander sur le site', de: 'Auf der Seite bestellen' },
        noContact: { ar: 'رقم المتجر لسه مش متضاف.', en: 'The store contact number is not set yet.', fr: 'Le numéro du magasin n’est pas encore défini.', de: 'Die Nummer des Shops ist noch nicht hinterlegt.' },
        home: { ar: 'الرئيسية', en: 'Home', fr: 'Accueil', de: 'Start' },
        enter: { ar: 'تفاصيل الطلب', en: 'Enter order details', fr: 'Détails de la commande', de: 'Bestelldetails' },
        details: { ar: 'تفاصيل الطلب', en: 'Order Details', fr: 'Détails', de: 'Details' },
        pieces: { ar: 'عدد القطع', en: 'Number of Pieces', fr: 'Nombre de pièces', de: 'Anzahl' },
        total: { ar: 'الإجمالي', en: 'Total', fr: 'Total', de: 'Gesamt' },
        ret: { ar: 'رجوع', en: 'Return', fr: 'Retour', de: 'Zurück' },
        confirm: { ar: 'تأكيد الطلب', en: 'Confirm order', fr: 'Confirmer la commande', de: 'Bestellung bestätigen' },
        close: { ar: 'إغلاق', en: 'Close', fr: 'Fermer', de: 'Schließen' },
        condNew: { ar: 'جديد', en: 'New', fr: 'Neuf', de: 'Neu' },
        condUsed: { ar: 'مستعمل', en: 'Used', fr: 'Occasion', de: 'Gebraucht' },
        brand: { ar: 'الماركة', en: 'Brand', fr: 'Marque', de: 'Marke' },
        colors: { ar: 'الألوان', en: 'Colors', fr: 'Couleurs', de: 'Farben' },
        sizes: { ar: 'المقاسات', en: 'Sizes', fr: 'Tailles', de: 'Größen' },
        available: { ar: 'متوفر', en: 'Available', fr: 'Disponible', de: 'Verfügbar' },
        unavailable: { ar: 'غير متوفر', en: 'Out of stock', fr: 'Indisponible', de: 'Nicht vorrätig' },
        condition: { ar: 'الحالة', en: 'Condition', fr: 'État', de: 'Zustand' },
        category: { ar: 'القسم', en: 'Category', fr: 'Catégorie', de: 'Kategorie' },
        unitPrice: { ar: 'سعر القطعة', en: 'Unit price', fr: 'Prix unitaire', de: 'Stückpreis' },
        /* forgot password */
        fpTitle: { ar: 'نسيت كلمة المرور؟', en: 'Forgot password?', fr: 'Mot de passe oublié ?', de: 'Passwort vergessen?' },
        fpEmailHint: { ar: 'اكتب بريدك الإلكتروني وهنبعتلك كود تفعيل لإعادة تعيين كلمة المرور.', en: 'Enter your email. You will receive an activation code to reset your password.', fr: 'Saisissez votre e-mail. Vous recevrez un code d’activation.', de: 'E-Mail eingeben. Sie erhalten einen Aktivierungscode.' },
        fpPhoneHint: { ar: 'اكتب رقم تليفونك وهنبعتلك كود تفعيل لإعادة تعيين كلمة المرور.', en: 'Enter your phone number. You will receive an activation code to reset your password.', fr: 'Saisissez votre numéro. Vous recevrez un code d’activation.', de: 'Telefonnummer eingeben. Sie erhalten einen Aktivierungscode.' },
        email: { ar: 'البريد الإلكتروني', en: 'E-mail', fr: 'E-mail', de: 'E-Mail' },
        phoneNo: { ar: 'رقم التليفون', en: 'Phone number', fr: 'Numéro de téléphone', de: 'Telefonnummer' },
        reset: { ar: 'إعادة تعيين كلمة المرور', en: 'Reset password', fr: 'Réinitialiser', de: 'Zurücksetzen' },
        another: { ar: 'طريقة أخرى', en: 'Another way', fr: 'Autre méthode', de: 'Andere Möglichkeit' },
        login: { ar: 'تسجيل الدخول', en: 'Login', fr: 'Connexion', de: 'Anmelden' },
        notFound: { ar: 'مفيش حساب بالبيانات دي.', en: 'No account found with this email or phone.', fr: 'Aucun compte trouvé.', de: 'Kein Konto gefunden.' },
        invalid: { ar: 'اكتب بريد إلكتروني أو رقم تليفون صحيح.', en: 'Enter a valid email or phone number.', fr: 'Saisissez un e-mail ou un numéro valide.', de: 'Gültige E-Mail oder Nummer eingeben.' },
        codeTitle: { ar: 'اكتب كود التفعيل', en: 'Enter the activation code', fr: 'Saisissez le code', de: 'Aktivierungscode eingeben' },
        codeSent: { ar: 'بعتنا كود من 6 أرقام إلى', en: 'We sent a 6-digit code to', fr: 'Code à 6 chiffres envoyé à', de: '6-stelliger Code gesendet an' },
        demo: { ar: 'وضع تجريبي: مفيش خدمة بريد/SMS متربطة لسه، الكود هو', en: 'Demo mode: no email/SMS service is connected yet. Your code is', fr: 'Mode démo : aucun service e-mail/SMS. Votre code :', de: 'Demomodus: kein E-Mail/SMS-Dienst. Ihr Code:' },
        verify: { ar: 'تأكيد الكود', en: 'Verify code', fr: 'Vérifier', de: 'Bestätigen' },
        resend: { ar: 'إعادة إرسال الكود', en: 'Resend code', fr: 'Renvoyer', de: 'Erneut senden' },
        resendIn: { ar: 'إعادة الإرسال بعد', en: 'Resend in', fr: 'Renvoyer dans', de: 'Erneut in' },
        badCode: { ar: 'الكود غلط.', en: 'Wrong code.', fr: 'Code incorrect.', de: 'Falscher Code.' },
        expired: { ar: 'الكود انتهت صلاحيته، اطلب كود جديد.', en: 'The code has expired. Request a new one.', fr: 'Code expiré.', de: 'Code abgelaufen.' },
        tooMany: { ar: 'محاولات كتير غلط، اطلب كود جديد.', en: 'Too many wrong attempts. Request a new code.', fr: 'Trop de tentatives.', de: 'Zu viele Versuche.' },
        newPass: { ar: 'كلمة المرور الجديدة', en: 'New password', fr: 'Nouveau mot de passe', de: 'Neues Passwort' },
        newPass2: { ar: 'تأكيد كلمة المرور', en: 'Confirm password', fr: 'Confirmer', de: 'Bestätigen' },
        passShort: { ar: 'كلمة المرور لازم تبقى 6 حروف على الأقل.', en: 'Password must be at least 6 characters.', fr: 'Au moins 6 caractères.', de: 'Mindestens 6 Zeichen.' },
        passMatch: { ar: 'كلمتا المرور مش متطابقتين.', en: 'Passwords do not match.', fr: 'Les mots de passe ne correspondent pas.', de: 'Passwörter stimmen nicht überein.' },
        save: { ar: 'حفظ كلمة المرور', en: 'Save password', fr: 'Enregistrer', de: 'Speichern' },
        done: { ar: 'تم تغيير كلمة المرور! تقدر تسجل دخول دلوقتي.', en: 'Password updated! You can login now.', fr: 'Mot de passe mis à jour !', de: 'Passwort aktualisiert!' },
        backLogin: { ar: 'رجوع لتسجيل الدخول', en: 'Back to login', fr: 'Retour à la connexion', de: 'Zurück zur Anmeldung' }
    };
    function lang() { var l = 'en'; try { l = localStorage.getItem('boda_language') || document.documentElement.lang || 'en'; } catch (e) { } return TXT.home[l] ? l : 'en'; }
    function t(k) { var o = TXT[k]; return o ? (o[lang()] || o.en) : k; }
    function isRTL() { return document.documentElement.dir === 'rtl' || lang() === 'ar'; }

    /* ---------- helpers ---------- */
    function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
    function lsGet(k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } }
    function storeContact() {
        var site = lsGet('boda_site', {}), contact = site.contact || {}, social = site.social || {};
        return {
            phone: CONTACT.phone || contact.phone || '',
            whatsapp: CONTACT.whatsapp || social.whatsapp || ''
        };
    }
    function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } }
    function toast(msg) {
        var el = document.createElement('div'); el.className = 'of-toast'; el.textContent = msg;
        document.body.appendChild(el); setTimeout(function () { el.classList.add('show'); }, 10);
        setTimeout(function () { el.classList.remove('show'); setTimeout(function () { el.remove(); }, 300); }, 3200);
    }
    function money(n) { return '$' + (Math.round(n * 100) / 100).toLocaleString('en-US'); }
    function catalog() {
        try {
            if (typeof window.allProductsRaw === 'function') return window.allProductsRaw() || [];
            if (typeof window.allProducts === 'function') return window.allProducts() || [];
            return window.BODA_PRODUCTS || [];
        } catch (e) { return []; }
    }
    function itemFromButton(btn) {
        var a = btn.closest('article[data-id]'); if (!a) return null;
        var im = a.querySelector('img'), h = a.querySelector('h3, h1, h2');
        var id = a.dataset.id;
        var p = catalog().filter(function (x) { return x.id === id; })[0] || {};
        return {
            id: id,
            name: h ? h.textContent.trim() : (p.name || id),
            price: +a.dataset.price || +p.price || 0,
            cat: a.dataset.cat || p.cat || '',
            sub: p.sub || '',
            img: im ? (im.currentSrc || im.src) : (p.img || ''),
            brand: p.brand || '',
            condition: p.condition === 'used' ? 'used' : 'new',
            colors: p.colors || [],
            sizes: p.sizes || [],
            components: p.components || [],
            features: p.features || [],
            stock: p.stock !== false,
            warranty: p.warranty || ''
        };
    }

    /* ---------- styles ---------- */
    function addStyles() {
        if (document.getElementById('of-style')) return;
        var s = document.createElement('style'); s.id = 'of-style';
        s.textContent = [
            '.of-back{position:fixed;inset:0;background:rgba(10,18,32,.55);z-index:9998;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .2s}',
            '.of-back.show{opacity:1}',
            '.of-modal{background:var(--surface,#fff);color:var(--ink,#0f1b2d);width:min(440px,92vw);border-radius:14px;padding:30px 26px 26px;position:relative;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.35);transform:translateY(12px);transition:transform .2s}',
            '.of-back.show .of-modal{transform:none}',
            '.of-x{position:absolute;inset-block-start:10px;inset-inline-start:12px;background:none;border:0;font-size:1.6rem;line-height:1;cursor:pointer;color:var(--ink-soft,#4a5568)}',
            '.of-modal h3{margin:0 0 6px;font-size:1.15rem}.of-modal .of-sub{margin:0 0 20px;color:var(--ink-soft,#4a5568);font-size:.9rem}',
            '.of-ways{display:flex;justify-content:center;gap:26px;margin-bottom:18px}',
            '.of-way{background:none;border:0;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:8px;color:var(--ink,#0f1b2d);font:inherit;font-size:.85rem}',
            '.of-way i{width:46px;height:46px;border-radius:50%;display:grid;place-items:center;font-size:1.15rem;background:rgba(215,38,61,.1);color:var(--brand,#d7263d);font-style:normal;transition:transform .15s}',
            '.of-way:hover i{transform:scale(1.1)}.of-way.off{opacity:.45}',
            '.of-or{display:inline-block;margin:2px 0 14px;padding:6px 10px;color:var(--ink-soft,#4a5568);font-size:.8rem;background:var(--paper,#f4f6fa);border-radius:6px}',
            '.of-primary{display:block;width:100%;padding:13px;border:0;border-radius:8px;background:var(--brand,#d7263d);color:#fff;font:inherit;font-weight:700;cursor:pointer}',
            '.of-primary:hover{background:var(--brand-dark,#b01c30)}',
            '.of-ghost{padding:11px 22px;border:1.5px solid var(--brand,#d7263d);border-radius:8px;background:transparent;color:var(--brand,#d7263d);font:inherit;font-weight:600;cursor:pointer}',
            /* side panel */
            '.of-panel{position:fixed;inset-block:0;inset-inline-end:0;width:min(420px,100vw);background:var(--surface,#fff);color:var(--ink,#0f1b2d);z-index:9999;display:flex;flex-direction:column;box-shadow:-12px 0 48px rgba(0,0,0,.28);transform:translateX(100%);transition:transform .28s cubic-bezier(.2,.8,.2,1)}',
            '[dir="rtl"] .of-panel{transform:translateX(-100%);box-shadow:12px 0 48px rgba(0,0,0,.28)}',
            '.of-panel.show,[dir="rtl"] .of-panel.show{transform:none}',
            '.of-ph{padding:16px 20px;border-bottom:1px solid var(--line,#dde3ec);display:flex;align-items:center;gap:8px;font-size:.86rem;color:var(--ink-soft,#4a5568);background:var(--paper,#f8fafc)}',
            '.of-ph b{color:var(--brand,#d7263d);font-weight:700}.of-ph .of-sep{opacity:.5}.of-ph .of-x{position:static;margin-inline-end:auto;font-size:1.5rem;line-height:1;padding:2px 6px;border-radius:8px}',
            '.of-ph .of-x:hover{background:rgba(0,0,0,.06)}',
            '.of-pb{padding:20px;flex:1;overflow:auto}',
            '.of-prod-card{display:flex;align-items:center;gap:14px;background:linear-gradient(135deg,var(--paper,#f4f6fa),#fff);border:1px solid var(--line,#e8edf3);border-radius:14px;padding:14px;margin-bottom:18px}',
            '.of-prod-img{width:88px;height:88px;object-fit:contain;background:#fff;border-radius:10px;border:1px solid var(--line,#eef1f5);flex-shrink:0}',
            '.of-prod-ph{width:88px;height:88px;border-radius:10px;background:var(--brand,#d7263d);color:#fff;display:grid;place-items:center;font-size:1.8rem;font-weight:700;flex-shrink:0}',
            '.of-prod-info{min-width:0;flex:1}',
            '.of-prod-name{display:block;font-size:1rem;line-height:1.35;margin:0 0 6px}',
            '.of-prod-price{font-size:1.15rem;font-weight:800;color:var(--brand,#d7263d)}.of-prod-price small{font-size:.75rem;font-weight:500;color:var(--ink-soft,#6b7280);margin-inline-start:4px}',
            '.of-meta{background:var(--paper,#f8fafc);border:1px solid var(--line,#e8edf3);border-radius:12px;padding:10px 14px;margin-bottom:18px}',
            '.of-meta-row{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:7px 0;font-size:.86rem;border-bottom:1px dashed var(--line,#e5e9ef)}',
            '.of-meta-row:last-child{border-bottom:0}',
            '.of-meta-row span{color:var(--ink-soft,#6b7280)}.of-meta-row b{font-weight:600;text-align:end}',
            '.of-ok{color:#15803d!important}.of-bad{color:#b91c1c!important}',
            '.of-qty-wrap{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:4px}',
            '.of-qtyl{font-size:.88rem;color:var(--ink-soft,#4a5568);margin:0;font-weight:600}',
            '.of-qty{display:inline-flex;border:1.5px solid var(--line,#dde3ec);border-radius:10px;overflow:hidden}',
            '.of-qty button{width:42px;height:40px;border:0;background:var(--paper,#f4f6fa);font-size:1.25rem;cursor:pointer;color:var(--ink,#0f1b2d);transition:background .15s}',
            '.of-qty button:hover{background:#e8edf5}',
            '.of-qty input{width:64px;text-align:center;border:0;font:inherit;font-size:1.05rem;font-weight:700;background:var(--surface,#fff);color:var(--ink,#0f1b2d);padding:8px 0}',
            '.of-pf{padding:14px 20px 18px;border-top:1px solid var(--line,#dde3ec);background:var(--surface,#fff);display:flex;flex-direction:column;gap:12px}',
            '.of-total-line{display:flex;justify-content:space-between;align-items:center;font-size:1rem}',
            '.of-total-line strong{font-size:1.35rem;font-weight:800;color:var(--brand,#d7263d)}',
            '.of-pf-actions{display:flex;gap:10px}',
            '.of-pf-actions .of-ghost{flex:0 0 auto}',
            '.of-pf-actions .of-primary{flex:1;padding:13px 18px;border-radius:10px;font-size:.95rem}',
            '.of-ghost{padding:11px 18px;border:1.5px solid var(--line,#cfd6e0);border-radius:10px;background:transparent;color:var(--ink,#0f1b2d);font:inherit;font-weight:600;cursor:pointer}',
            '.of-ghost:hover{border-color:var(--brand,#d7263d);color:var(--brand,#d7263d)}',
            /* forgot password */
            '.of-fp{background:var(--surface,#fff);border:1px solid var(--line,#dde3ec);border-radius:14px;padding:30px;max-width:760px;margin:30px auto;display:flex;gap:30px;align-items:center;position:relative;color:var(--ink,#0f1b2d)}',
            '.of-fp .of-fpmain{flex:1;min-width:0}.of-fp h2{margin:0 0 8px;font-size:1.5rem}',
            '.of-fp p.hint{color:var(--ink-soft,#4a5568);font-size:.88rem;margin:0 0 16px}',
            '.of-fp input[type=text],.of-fp input[type=email],.of-fp input[type=tel],.of-fp input[type=password]{width:100%;padding:12px 14px;border:1.5px solid var(--line,#dde3ec);border-radius:8px;font:inherit;background:var(--surface,#fff);color:var(--ink,#0f1b2d);margin-bottom:12px;box-sizing:border-box}',
            '.of-fp input:focus{outline:none;border-color:var(--brand,#d7263d)}',
            '.of-fp .of-code{letter-spacing:10px;text-align:center;font-size:1.4rem;font-weight:700}',
            '.of-fp .of-link{background:none;border:0;color:var(--brand,#d7263d);cursor:pointer;font:inherit;font-size:.85rem;padding:4px 0;margin-top:10px;display:block}',
            '.of-fp .of-link:disabled{color:var(--ink-soft,#4a5568);cursor:default}',
            '.of-fp .of-top{position:absolute;inset-block-start:14px;inset-inline-end:18px}',
            '.of-fp .of-err{color:#c0392b;font-size:.85rem;min-height:1.2em;margin:0 0 8px}',
            '.of-fp .of-demo{background:#fff8e1;color:#7a5b00;border:1px dashed #e0b400;border-radius:8px;padding:10px 12px;font-size:.84rem;margin-bottom:14px}',
            '.of-fp .of-art{font-size:6rem;opacity:.9}',
            '@media(max-width:640px){.of-fp{flex-direction:column;padding:22px}.of-fp .of-art{display:none}}',
            '.of-toast{position:fixed;inset-inline:0;bottom:26px;margin:0 auto;width:max-content;max-width:90vw;background:#0f1b2d;color:#fff;padding:11px 18px;border-radius:8px;z-index:10000;opacity:0;transform:translateY(10px);transition:.3s;font-size:.9rem}',
            '.of-toast.show{opacity:1;transform:none}'
        ].join('\n');
        document.head.appendChild(s);
    }

    /* ============================================================
       1) ORDER FLOW
       ============================================================ */
    var cur = null;       // current item
    var backdrop = null, panel = null;

    function closeAll() {
        if (backdrop) { backdrop.remove(); backdrop = null; }
        if (panel) { var p = panel; panel = null; p.classList.remove('show'); setTimeout(function () { p.remove(); }, 250); }
    }

    function openChooser(item) {
        cur = item; closeAll(); addStyles();
        var savedContact = storeContact();
        var phone = (savedContact.phone || '').replace(/\s/g, ''), wa = (savedContact.whatsapp || '').replace(/\D/g, '');
        backdrop = document.createElement('div'); backdrop.className = 'of-back';
        backdrop.innerHTML = '<div class="of-modal" role="dialog" aria-modal="true">' +
            '<button type="button" class="of-x" data-of="close" aria-label="' + t('close') + '">×</button>' +
            '<h3>' + t('choose') + '</h3><p class="of-sub">' + t('via') + '</p>' +
            '<div class="of-ways">' +
            '<button type="button" class="of-way' + (phone ? '' : ' off') + '" data-of="phone"><i>📞</i>' + t('phone') + '</button>' +
            '<button type="button" class="of-way' + (wa ? '' : ' off') + '" data-of="wa"><i>💬</i>' + t('whatsapp') + '</button>' +
            '<button type="button" class="of-way" data-of="chat"><i>✉️</i>' + t('chat') + '</button></div>' +
            '<div class="of-or">' + t('or') + '</div>' +
            '<button type="button" class="of-primary" data-of="site">' + t('fromSite') + '</button></div>';
        document.body.appendChild(backdrop);
        setTimeout(function () { backdrop && backdrop.classList.add('show'); }, 10);
    }

    function openPanel() {
        if (!cur) return;
        if (backdrop) { backdrop.remove(); backdrop = null; }
        var qty = 1;
        var sep = lang() === 'ar' ? '، ' : ', ';
        var metaRows = [];
        if (cur.cat) metaRows.push('<div class="of-meta-row"><span>' + esc(t('category')) + '</span><b>' + esc(cur.cat) + (cur.sub ? ' · ' + esc(cur.sub) : '') + '</b></div>');
        metaRows.push('<div class="of-meta-row"><span>' + esc(t('condition')) + '</span><b>' + esc(cur.condition === 'used' ? t('condUsed') : t('condNew')) + '</b></div>');
        metaRows.push('<div class="of-meta-row"><span>' + esc(t('available')) + '</span><b class="' + (cur.stock ? 'of-ok' : 'of-bad') + '">' + esc(cur.stock ? t('available') : t('unavailable')) + '</b></div>');
        if (cur.brand) metaRows.push('<div class="of-meta-row"><span>' + esc(t('brand')) + '</span><b>' + esc(cur.brand) + '</b></div>');
        if ((cur.colors || []).length) metaRows.push('<div class="of-meta-row"><span>' + esc(t('colors')) + '</span><b>' + esc(cur.colors.join(sep)) + '</b></div>');
        if ((cur.sizes || []).length) metaRows.push('<div class="of-meta-row"><span>' + esc(t('sizes')) + '</span><b>' + esc(cur.sizes.join(sep)) + '</b></div>');

        panel = document.createElement('aside'); panel.className = 'of-panel'; panel.setAttribute('role', 'dialog');
        panel.innerHTML =
            '<div class="of-ph">' +
            '<button type="button" class="of-x" data-of="close" aria-label="' + t('close') + '">×</button>' +
            '<span>' + t('home') + '</span><span class="of-sep">›</span><b>' + t('enter') + '</b>' +
            '</div>' +
            '<div class="of-pb">' +
            '<div class="of-prod-card">' +
            (cur.img ? '<img class="of-prod-img" src="' + esc(cur.img) + '" alt="" referrerpolicy="no-referrer">' : '<div class="of-prod-ph">' + esc((cur.name || '?').charAt(0)) + '</div>') +
            '<div class="of-prod-info">' +
            '<strong class="of-prod-name">' + esc(cur.name) + '</strong>' +
            '<div class="of-prod-price">' + money(cur.price) + ' <small>' + esc(t('unitPrice')) + '</small></div>' +
            '</div>' +
            '</div>' +
            (metaRows.length ? '<div class="of-meta">' + metaRows.join('') + '</div>' : '') +
            '<div class="of-qty-wrap">' +
            '<label class="of-qtyl">' + t('pieces') + '</label>' +
            '<div class="of-qty"><button type="button" data-of="minus" aria-label="-">−</button><input id="of-qty" type="number" min="1" max="99" value="1"><button type="button" data-of="plus" aria-label="+">+</button></div>' +
            '</div>' +
            '</div>' +
            '<div class="of-pf">' +
            '<div class="of-total-line"><span>' + t('total') + '</span><strong id="of-tot">' + money(cur.price) + '</strong></div>' +
            '<div class="of-pf-actions">' +
            '<button type="button" class="of-ghost" data-of="return">' + (isRTL() ? '›' : '‹') + ' ' + t('ret') + '</button>' +
            '<button type="button" class="of-primary" data-of="confirm">' + t('confirm') + '</button>' +
            '</div>' +
            '</div>';
        document.body.appendChild(panel);
        setTimeout(function () { panel && panel.classList.add('show'); }, 10);
        function upd() {
            var inp = panel.querySelector('#of-qty'); qty = Math.min(99, Math.max(1, parseInt(inp.value, 10) || 1)); inp.value = qty;
            panel.querySelector('#of-tot').textContent = money(cur.price * qty);
        }
        panel.addEventListener('input', function (e) { if (e.target.id === 'of-qty') upd(); });
        panel._upd = upd;
    }

    function confirmOrder() {
        var qty = Math.min(99, Math.max(1, parseInt(panel.querySelector('#of-qty').value, 10) || 1));
        /* Buy Now = single-item checkout (don't mix with existing cart items) */
        var payload = {
            id: cur.id, name: cur.name, price: cur.price, cat: cur.cat, img: cur.img, qty: qty,
            brand: cur.brand || '', condition: cur.condition || 'new',
            colors: cur.colors || [], sizes: cur.sizes || [],
            components: cur.components || [], features: cur.features || [],
            stock: cur.stock !== false
        };
        var m = lsGet('boda_meta', {}); m[cur.id] = { name: cur.name, img: cur.img, price: cur.price, cat: cur.cat }; lsSet('boda_meta', m);
        /* Close the product panel before navigating so browser Back restores
           the storefront without leaving the panel layered over the page. */
        if (backdrop) { backdrop.remove(); backdrop = null; }
        if (panel) { panel.remove(); panel = null; }
        /* → separate checkout page (shipping + payment). The cart is NOT touched. */
        try { sessionStorage.setItem('boda_buynow', JSON.stringify([payload])); } catch (e) { }
        location.href = 'index.html?page=checkout&mode=buynow';
    }

    document.addEventListener('click', function (e) {
        /* intercept every Buy Now button (before app.js handler) */
        var buy = e.target.closest && e.target.closest('.buy-btn');
        if (buy && !buy.disabled) {
            var it = itemFromButton(buy);
            if (it) { e.preventDefault(); e.stopImmediatePropagation(); openChooser(it); return; }
        }
        var act = e.target.closest && e.target.closest('[data-of]');
        if (act) {
            var a = act.dataset.of;
            if (a === 'close') closeAll();
            else if (a === 'site') openPanel();
            else if (a === 'return') openChooser(cur);
            else if (a === 'minus' || a === 'plus') { var i = panel.querySelector('#of-qty'); i.value = (parseInt(i.value, 10) || 1) + (a === 'plus' ? 1 : -1); panel._upd(); }
            else if (a === 'confirm') confirmOrder();
            else if (a === 'phone') { var p = (storeContact().phone || '').replace(/\s/g, ''); if (!p) toast(t('noContact')); else location.href = 'tel:' + p; }
            else if (a === 'wa') {
                var w = (storeContact().whatsapp || '').replace(/\D/g, ''); if (!w) { toast(t('noContact')); return; }
                var msg = (lang() === 'ar' ? 'مرحبا، عايز أطلب: ' : 'Hello, I would like to order: ') + cur.name + ' (' + money(cur.price) + ')';
                window.open('https://wa.me/' + w + '?text=' + encodeURIComponent(msg), '_blank', 'noopener');
            }
            else if (a === 'chat') { try { sessionStorage.setItem('boda_chat_product', cur.name); } catch (x) { } location.href = 'index.html?page=contact'; }
            return;
        }
        if (backdrop && e.target === backdrop) closeAll();
    }, true);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeAll(); });

    /* cart page: jump straight into checkout after Buy Now "Confirm order" */
    function autoCheckout() {
        var q = new URLSearchParams(location.search);
        if (q.get('page') !== 'cart' || q.get('checkout') !== '1') return;
        var buyNow = false;
        try { buyNow = sessionStorage.getItem('boda_buy_now') === '1'; sessionStorage.removeItem('boda_buy_now'); } catch (e) { }
        var tries = 0, h = setInterval(function () {
            var b = document.getElementById('checkout'); tries++;
            if (b) {
                clearInterval(h);
                try { history.replaceState(null, '', 'index.html?page=cart'); } catch (e) { }
                b.click();
                /* make the checkout screen feel like "complete order", not cart */
                setTimeout(function () {
                    var title = document.querySelector('h1.page-title, .page-title, main h1, #cart-box') || document.querySelector('h1');
                    var crumbs = document.querySelector('.crumbs, .breadcrumb');
                    if (buyNow) {
                        document.title = (lang() === 'ar' ? 'إتمام الطلب' : 'Checkout') + ' | Boda Store';
                        if (crumbs) crumbs.innerHTML = '<a href="index.html?page=home">' + t('home') + '</a> <span>›</span> <b>' + (lang() === 'ar' ? 'إتمام الطلب' : 'Checkout') + '</b>';
                        var back = document.getElementById('co-back');
                        if (back) back.style.display = 'none';
                    }
                }, 50);
            } else if (tries > 40) clearInterval(h);
        }, 100);
    }
    /* contact page: prefill message when coming from "Chat" */
    function prefillChat() {
        var q = new URLSearchParams(location.search); if (q.get('page') !== 'contact') return;
        var name = null; try { name = sessionStorage.getItem('boda_chat_product'); } catch (e) { } if (!name) return;
        var tries = 0, h = setInterval(function () {
            var ta = document.querySelector('main textarea, form textarea'); tries++;
            if (ta) { clearInterval(h); if (!ta.value) ta.value = (lang() === 'ar' ? 'مهتم بالمنتج: ' : 'I am interested in: ') + name; try { sessionStorage.removeItem('boda_chat_product'); } catch (e) { } }
            else if (tries > 30) clearInterval(h);
        }, 100);
    }

    /* ============================================================
       2) FORGOT PASSWORD  (login page)
       ============================================================ */
    function hashPw(p) {
        if (window.crypto && crypto.subtle && window.TextEncoder) {
            return crypto.subtle.digest('SHA-256', new TextEncoder().encode('boda:' + p)).then(function (b) {
                return Array.from(new Uint8Array(b)).map(function (x) { return x.toString(16).padStart(2, '0'); }).join('');
            });
        }
        var h = 5381; for (var i = 0; i < p.length; i++) h = ((h << 5) + h + p.charCodeAt(i)) | 0;
        return Promise.resolve('x' + h);
    }
    function norm(v, mode) { v = String(v || '').trim().toLowerCase(); return mode === 'phone' ? v.replace(/[^\d+]/g, '') : v; }
    function findAccount(val, mode) {
        var accs = lsGet('boda_accounts', {}), n = norm(val, mode);
        for (var k in accs) { if (!accs.hasOwnProperty(k)) continue; if (mode === 'phone' ? norm(k, 'phone') === n || norm(accs[k].login, 'phone') === n : k === n || String(accs[k].login || '').toLowerCase() === n) return { key: k, accs: accs }; }
        return null;
    }

    var fp = { mode: 'email', step: 1, acc: null, code: '', exp: 0, tries: 0, timer: null, shown: '' };

    function fpRender() {
        var box = document.getElementById('auth-box'); if (!box) return;
        addStyles();
        var h = '', rtl = isRTL();
        if (fp.step === 1) {
            h = '<h2>' + t('fpTitle') + '</h2><p class="hint">' + t(fp.mode === 'email' ? 'fpEmailHint' : 'fpPhoneHint') + '</p>' +
                '<input id="of-id" type="' + (fp.mode === 'email' ? 'email' : 'tel') + '" placeholder="' + t(fp.mode === 'email' ? 'email' : 'phoneNo') + '" autocomplete="' + (fp.mode === 'email' ? 'email' : 'tel') + '" value="' + esc(fp.shown) + '">' +
                '<p class="of-err" id="of-err"></p><button type="button" class="of-primary" data-fp="send">' + t('reset') + '</button>' +
                '<button type="button" class="of-link" data-fp="switch">' + t('another') + '</button>';
        } else if (fp.step === 2) {
            h = '<h2>' + t('codeTitle') + '</h2><p class="hint">' + t('codeSent') + ' <b>' + esc(fp.shown) + '</b></p>' +
                '<div class="of-demo">' + t('demo') + ' <b>' + fp.code + '</b></div>' +
                '<input id="of-code" class="of-code" type="text" inputmode="numeric" maxlength="6" placeholder="••••••" autocomplete="one-time-code">' +
                '<p class="of-err" id="of-err"></p><button type="button" class="of-primary" data-fp="verify">' + t('verify') + '</button>' +
                '<button type="button" class="of-link" id="of-resend" data-fp="resend" disabled></button>';
        } else {
            h = '<h2>' + t('newPass') + '</h2><p class="hint"></p>' +
                '<input id="of-p1" type="password" placeholder="' + t('newPass') + '" autocomplete="new-password">' +
                '<input id="of-p2" type="password" placeholder="' + t('newPass2') + '" autocomplete="new-password">' +
                '<p class="of-err" id="of-err"></p><button type="button" class="of-primary" data-fp="save">' + t('save') + '</button>';
        }
        box.innerHTML = '<div class="of-fp"><a class="of-link of-top" href="index.html?page=signin">' + t('login') + '</a>' +
            '<div class="of-fpmain">' + h + '</div><div class="of-art">🔐</div></div>';
        if (fp.step === 2) fpCountdown();
        var first = box.querySelector('input'); if (first) first.focus();
    }
    function fpErr(m) { var e = document.getElementById('of-err'); if (e) e.textContent = m || ''; }
    function fpCountdown() {
        clearInterval(fp.timer); var left = 30, b = document.getElementById('of-resend'); if (!b) return;
        function tick() { b = document.getElementById('of-resend'); if (!b) { clearInterval(fp.timer); return; } if (left > 0) { b.disabled = true; b.textContent = t('resendIn') + ' ' + left + 's'; left--; } else { b.disabled = false; b.textContent = t('resend'); clearInterval(fp.timer); } }
        tick(); fp.timer = setInterval(tick, 1000);
    }
    function fpSend() {
        var val = (document.getElementById('of-id').value || '').trim();
        var ok = fp.mode === 'email' ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) : /^\+?[\d\s-]{8,15}$/.test(val);
        if (!ok) return fpErr(t('invalid'));
        var found = findAccount(val, fp.mode); if (!found) return fpErr(t('notFound'));
        fp.acc = found.key; fp.shown = val; fp.tries = 0;
        fp.code = String(Math.floor(100000 + Math.random() * 900000)); fp.exp = Date.now() + 10 * 60 * 1000;
        /* Real delivery hook: define window.BODA_SEND_RESET_CODE(login, code, mode) to send it from your backend. */
        if (typeof window.BODA_SEND_RESET_CODE === 'function') { try { window.BODA_SEND_RESET_CODE(fp.shown, fp.code, fp.mode); } catch (e) { } }
        fp.step = 2; fpRender();
    }
    function fpVerify() {
        var c = (document.getElementById('of-code').value || '').trim();
        if (Date.now() > fp.exp) return fpErr(t('expired'));
        if (fp.tries >= 5) return fpErr(t('tooMany'));
        if (c !== fp.code) { fp.tries++; return fpErr(t('badCode')); }
        fp.step = 3; fpRender();
    }
    function fpSave() {
        var p1 = document.getElementById('of-p1').value, p2 = document.getElementById('of-p2').value;
        if (p1.length < 6) return fpErr(t('passShort'));
        if (p1 !== p2) return fpErr(t('passMatch'));
        hashPw(p1).then(function (h) {
            var accs = lsGet('boda_accounts', {}); if (!accs[fp.acc]) return fpErr(t('notFound'));
            accs[fp.acc].hash = h; lsSet('boda_accounts', accs);
            try { localStorage.setItem('boda_remember_login', String(accs[fp.acc].login || fp.acc)); } catch (e) { }
            fp.code = ''; toast(t('done')); setTimeout(function () { location.href = 'index.html?page=signin'; }, 900);
        });
    }
    function startForgot() { fp = { mode: 'email', step: 1, acc: null, code: '', exp: 0, tries: 0, timer: null, shown: '' }; fpRender(); }

    document.addEventListener('click', function (e) {
        var tg = e.target.closest && e.target.closest('#forgot-toggle');
        if (tg) { e.preventDefault(); e.stopImmediatePropagation(); var ls = document.getElementById('a-login'); startForgot(); if (ls && ls.value) { fp.shown = ls.value; } return; }
        var d = e.target.closest && e.target.closest('[data-fp]'); if (!d) return;
        var a = d.dataset.fp;
        if (a === 'switch') { fp.mode = fp.mode === 'email' ? 'phone' : 'email'; fp.shown = ''; fpRender(); }
        else if (a === 'send') fpSend();
        else if (a === 'verify') fpVerify();
        else if (a === 'save') fpSave();
        else if (a === 'resend') { fp.step = 1; var v = fp.shown; fpRender(); document.getElementById('of-id').value = v; fpSend(); }
    }, true);
    document.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter' || !e.target.closest || !e.target.closest('.of-fp')) return;
        e.preventDefault(); var b = document.querySelector('.of-fp [data-fp="send"], .of-fp [data-fp="verify"], .of-fp [data-fp="save"]'); if (b) b.click();
    });
    function autoForgot() {
        var q = new URLSearchParams(location.search); if (q.get('page') !== 'signin' || q.get('forgot') !== '1') return;
        var tries = 0, h = setInterval(function () { tries++; if (document.getElementById('auth-box') && document.getElementById('auth-form')) { clearInterval(h); startForgot(); } else if (tries > 30) clearInterval(h); }, 100);
    }

    /* ---------- boot ---------- */
    function boot() { addStyles(); prefillChat(); autoForgot(); }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
    window.addEventListener('load', function () { addStyles(); });
})();