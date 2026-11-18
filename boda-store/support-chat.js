/* ============================================================
   Boda Store — support-chat.js
   Floating "Technical support" chat on every store page.
     • Instant answers (FAQ bot): orders, shipping, payment, returns, account, warranty
     • Order tracking by order number (BD-123456) or your latest orders
     • "Talk to a human": the conversation is sent to Admin > Messages
   Load with:  <script src="support-chat.js" defer></script>
   ============================================================ */
(function () {
    'use strict';
    if (window.BODA_ADMIN) return;               // never inside the admin panel

    var SUPPORT_NAME = { ar: 'الدعم الفني', en: 'Technical Support', fr: 'Support technique', de: 'Technischer Support' };

    var TXT = {
        online: { ar: 'متصل الآن', en: 'Online now', fr: 'En ligne', de: 'Online' },
        hello: { ar: 'أهلًا! أنا مساعد الدعم الفني لـ Boda Store. اسألني عن الطلبات أو الشحن أو الدفع أو الاسترجاع.', en: 'Hi! I am the Boda Store support assistant. Ask me about orders, shipping, payment or returns.', fr: 'Bonjour ! Je suis l’assistant de Boda Store. Posez-moi vos questions sur les commandes, la livraison, le paiement ou les retours.', de: 'Hallo! Ich bin der Boda-Store-Assistent. Fragen Sie mich zu Bestellungen, Versand, Zahlung oder Rückgabe.' },
        placeholder: { ar: 'اكتب رسالتك...', en: 'Type your message...', fr: 'Votre message...', de: 'Ihre Nachricht...' },
        send: { ar: 'إرسال', en: 'Send', fr: 'Envoyer', de: 'Senden' },
        close: { ar: 'إغلاق', en: 'Close', fr: 'Fermer', de: 'Schließen' },
        reset: { ar: 'محادثة جديدة', en: 'New chat', fr: 'Nouveau chat', de: 'Neuer Chat' },
        open: { ar: 'الدعم الفني', en: 'Support', fr: 'Support', de: 'Support' },
        chips: {
            order: { ar: 'تتبع طلبي', en: 'Track my order', fr: 'Suivre ma commande', de: 'Bestellung verfolgen' },
            shipping: { ar: 'الشحن والتوصيل', en: 'Shipping & delivery', fr: 'Livraison', de: 'Versand' },
            payment: { ar: 'طرق الدفع', en: 'Payment methods', fr: 'Paiement', de: 'Zahlung' },
            returns: { ar: 'الاسترجاع', en: 'Returns & refunds', fr: 'Retours', de: 'Rückgabe' },
            account: { ar: 'مشكلة في الحساب', en: 'Account help', fr: 'Compte', de: 'Konto' },
            edit: { ar: 'تعديل / إلغاء طلب', en: 'Edit / cancel order', fr: 'Modifier / annuler', de: 'Ändern / stornieren' },
            human: { ar: 'كلّم موظف', en: 'Talk to a human', fr: 'Parler à un agent', de: 'Mit Mitarbeiter sprechen' }
        },
        ans: {
            shipping: { ar: 'الشحن مجاني للطلبات فوق 500 دولار. الطلبات الأقل بتتحسب تكلفة الشحن حسب المحافظة وقت إتمام الطلب. بعد التأكيد بنجهز طلبك ونبعتهولك، وتقدر تتابعه من [[orders]].', en: 'Delivery is free on orders over $500. Smaller orders pay a shipping fee that depends on your governorate at checkout. After confirmation we prepare and ship your order; follow it from [[orders]].', fr: 'Livraison gratuite dès 500 $. En dessous, les frais dépendent de votre région. Suivez votre commande depuis [[orders]].', de: 'Versand ab 500 $ kostenlos. Darunter richten sich die Kosten nach Ihrer Region. Verfolgen Sie Ihre Bestellung unter [[orders]].' },
            payment: { ar: 'بنقبل الدفع عند الاستلام، وكروت Visa وMastercard، وبوابات الدفع المفعّلة. تقدر تختار الطريقة في صفحة إتمام الطلب.', en: 'We accept Cash on Delivery, Visa and Mastercard cards, and the enabled payment gateways. Choose your method at checkout.', fr: 'Paiement à la livraison, cartes Visa/Mastercard et passerelles activées. Choisissez à la validation de la commande.', de: 'Wir akzeptieren Barzahlung bei Lieferung, Visa/Mastercard und aktivierte Zahlungsarten. Wählen Sie beim Checkout.' },
            returns: { ar: 'تقدر ترجّع المنتج لو فيه عيب أو مش مطابق للوصف. ابعتلنا رقم الطلب وسبب الاسترجاع وهنراجعه معاك. اكتب "كلّم موظف" وهنحوّلك لفريق الدعم.', en: 'You can return an item that is defective or not as described. Send us the order number and the reason and we will review it. Type "Talk to a human" to reach our team.', fr: 'Vous pouvez retourner un article défectueux ou non conforme. Envoyez-nous le numéro de commande et le motif.', de: 'Defekte oder nicht beschreibungsgemäße Artikel können zurückgegeben werden. Senden Sie uns Bestellnummer und Grund.' },
            account: { ar: 'لو نسيت كلمة المرور اضغط "Forgot password?" في صفحة الدخول [[signin]] وهنبعتلك كود لإعادة التعيين. ولو لسه معندكش حساب سجّل من [[signup]].', en: 'If you forgot your password, use "Forgot password?" on the login page [[signin]] to get a reset code. No account yet? Register at [[signup]].', fr: 'Mot de passe oublié ? Utilisez « Forgot password? » sur [[signin]]. Pas de compte ? [[signup]].', de: 'Passwort vergessen? Nutzen Sie „Forgot password?“ auf [[signin]]. Noch kein Konto? [[signup]].' },
            warranty: { ar: 'منتجات الإلكترونيات والأجهزة المنزلية عليها ضمان سنة، وبيظهر في صفحة كل منتج.', en: 'Electronics and home appliances come with a 1-year warranty, shown on each product page.', fr: 'Électronique et électroménager : garantie 1 an, indiquée sur chaque fiche produit.', de: 'Elektronik und Haushaltsgeräte haben 1 Jahr Garantie (siehe Produktseite).' },
            offers: { ar: 'شوف أحدث الخصومات في صفحة [[offers]].', en: 'See the latest discounts on the [[offers]] page.', fr: 'Voir les promotions sur [[offers]].', de: 'Aktuelle Rabatte unter [[offers]].' },
            edit: { ar: 'تقدر تعدّل الكميات أو تحذف منتج أو تضيف منتج أو تلغي الطلب طول ما حالته "قيد الانتظار" أو "جاري التجهيز". اختار الطلب:', en: 'You can change quantities, remove or add items, or cancel while the order is Pending or Processing. Pick the order:', fr: 'Vous pouvez modifier les quantités, retirer/ajouter des articles ou annuler tant que la commande est en attente ou en préparation :', de: 'Solange die Bestellung ausstehend oder in Bearbeitung ist, können Sie Mengen ändern, Artikel hinzufügen/entfernen oder stornieren:' },
            noEditable: { ar: 'مفيش عندك طلبات لسه ممكن تتعدّل (الطلب بيتقفل لما يتشحن). لو محتاج حاجة اكتب "كلّم موظف".', en: 'None of your orders can be edited right now (orders lock once shipped). Type "Talk to a human" if you need more help.', fr: 'Aucune commande modifiable (verrouillée après expédition).', de: 'Keine Bestellung ist änderbar (nach Versand gesperrt).' },
            askOrder: { ar: 'اكتب رقم طلبك (زي BD-123456) وأنا أجيبلك حالته.', en: 'Type your order number (like BD-123456) and I will check its status.', fr: 'Saisissez votre numéro de commande (ex. BD-123456).', de: 'Geben Sie Ihre Bestellnummer ein (z. B. BD-123456).' },
            noOrders: { ar: 'مش لاقي طلبات على المتصفح ده. لو طلبت قبل كده، اكتب رقم الطلب هنا.', en: 'I could not find any orders in this browser. If you ordered before, type your order number here.', fr: 'Aucune commande trouvée dans ce navigateur. Saisissez votre numéro.', de: 'Keine Bestellungen in diesem Browser gefunden. Geben Sie Ihre Nummer ein.' },
            orderNotFound: { ar: 'مش لاقي طلب بالرقم ده. اتأكد من الرقم أو افتح [[orders]].', en: 'I could not find an order with that number. Check it or open [[orders]].', fr: 'Commande introuvable. Vérifiez le numéro ou ouvrez [[orders]].', de: 'Bestellung nicht gefunden. Prüfen Sie die Nummer oder öffnen Sie [[orders]].' },
            lastOrders: { ar: 'آخر طلباتك:', en: 'Your latest orders:', fr: 'Vos dernières commandes :', de: 'Ihre letzten Bestellungen:' },
            orderLine: { ar: 'طلب', en: 'Order', fr: 'Commande', de: 'Bestellung' },
            unknown: { ar: 'مش متأكد إني فهمت سؤالك. تقدر تختار من الأزرار تحت، أو اكتب "كلّم موظف" وهنحوّلك لفريق الدعم.', en: 'I am not sure I understood. Pick one of the options below, or type "Talk to a human" to reach our team.', fr: 'Je n’ai pas bien compris. Choisissez une option ou écrivez « Parler à un agent ».', de: 'Ich habe das nicht verstanden. Wählen Sie eine Option oder schreiben Sie „Mit Mitarbeiter sprechen“.' },
            askContact: { ar: 'تمام، هحوّل محادثتك لفريق الدعم. اكتب إيميلك أو رقم تليفونك عشان نرد عليك.', en: 'Sure, I will pass this to our support team. Please type your email or phone number so we can reply.', fr: 'Je transmets à notre équipe. Indiquez votre e-mail ou téléphone.', de: 'Ich leite das an unser Team weiter. Bitte E-Mail oder Telefonnummer eingeben.' },
            badContact: { ar: 'اكتب إيميل أو رقم تليفون صحيح.', en: 'Please enter a valid email or phone number.', fr: 'Saisissez un e-mail ou numéro valide.', de: 'Bitte gültige E-Mail oder Nummer eingeben.' },
            sent: { ar: 'تم إرسال رسالتك لفريق الدعم ✅ هنتواصل معاك قريبًا على', en: 'Your message was sent to our support team ✅ We will contact you soon at', fr: 'Message transmis à notre équipe ✅ Nous vous contacterons sur', de: 'Ihre Nachricht wurde an unser Team gesendet ✅ Wir melden uns unter' },
            thanks: { ar: 'العفو! لو احتجت أي حاجة تانية أنا موجود.', en: 'You are welcome! I am here if you need anything else.', fr: 'Avec plaisir ! Je reste disponible.', de: 'Gern geschehen! Ich bin weiter für Sie da.' },
            greet: { ar: 'أهلًا بيك! تحب أساعدك في إيه؟', en: 'Hello! How can I help you?', fr: 'Bonjour ! Comment puis-je vous aider ?', de: 'Hallo! Wie kann ich helfen?' }
        },
        links: { confirm: { ar: 'فتح الطلب', en: 'Open order', fr: 'Ouvrir', de: 'Öffnen' }, orders: { ar: 'طلباتي', en: 'My Orders', fr: 'Mes commandes', de: 'Meine Bestellungen' }, signin: { ar: 'تسجيل الدخول', en: 'Login', fr: 'Connexion', de: 'Anmelden' }, signup: { ar: 'إنشاء حساب', en: 'Sign up', fr: 'Inscription', de: 'Registrieren' }, offers: { ar: 'العروض', en: 'Offers', fr: 'Offres', de: 'Angebote' } }
    };
    var LINKS = { orders: 'index.html?page=orders', signin: 'index.html?page=signin', signup: 'index.html?page=signup', offers: 'index.html?page=offers' };

    var KEYS = [
        ['human', /human|agent|person|representative|support team|موظف|شخص|كلّم|كلمني|اكلم|اتكلم|خدمة العملاء|mensch|mitarbeiter|agent|conseiller/i],
        ['edit', /edit|modify|change (my )?order|cancel|amend|عدل|تعديل|اعدل|أعدل|الغاء|إلغاء|الغي|ألغي|احذف|أحذف|امسح|modifier|annuler|änder|storn/i],
        ['thanks', /^(thanks|thank you|thx|شكرا|شكراً|تسلم|merci|danke)/i],
        ['order', /order|track|status|where is|طلب|اوردر|أوردر|شحنتي|تتبع|commande|suivi|bestellung|verfolg/i],
        ['shipping', /ship|deliver|delivery|shipping|شحن|توصيل|وصول|livraison|expédition|versand|lieferung/i],
        ['payment', /pay|card|visa|master|cash|دفع|كارت|فيزا|كاش|فلوس|paiement|carte|zahlung|karte/i],
        ['returns', /return|refund|exchange|استرجاع|ارجاع|إرجاع|استبدال|رجع|retour|remboursement|rückgabe|erstattung/i],
        ['account', /password|login|log in|account|sign ?up|register|باسورد|كلمة السر|كلمة المرور|حساب|دخول|تسجيل|mot de passe|compte|passwort|konto/i],
        ['warranty', /warranty|guarantee|ضمان|garantie/i],
        ['offers', /offer|discount|sale|promo|عرض|عروض|خصم|تخفيض|offre|promotion|angebot|rabatt/i],
        ['greet', /^(hi|hello|hey|hola|اهلا|أهلا|مرحبا|السلام|سلام|هاي|bonjour|salut|hallo)/i]
    ];

    function lang() { var l = 'en'; try { l = localStorage.getItem('boda_language') || document.documentElement.lang || 'en'; } catch (e) { } return ['ar', 'en', 'fr', 'de'].indexOf(l) > -1 ? l : 'en'; }
    function tr(o) { return o ? (o[lang()] || o.en) : ''; }
    function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
    function lsGet(k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } }
    function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } }
    function user() { return lsGet('boda_user', null); }
    function fmt(text) {
        return esc(text).replace(/\n/g, '<br>')
            .replace(/\[\[order:([A-Za-z0-9-]+)\]\]/g, function (m, id) { return '<a href="index.html?page=order-confirm&id=' + encodeURIComponent(id) + '">' + id + '</a>'; })
            .replace(/\[\[(orders|signin|signup|offers)\]\]/g, function (m, k) { return '<a href="' + LINKS[k] + '">' + esc(tr(TXT.links[k])) + '</a>'; });
    }

    /* ---------- state ---------- */
    var LOG_KEY = 'boda_chat_log', CONTACT_KEY = 'boda_chat_contact';
    var log = lsGet(LOG_KEY, []);
    var st = { awaitContact: false, unknown: 0, pending: '' };
    var root, panel, list, input, dot, chipsBox;

    function save() { lsSet(LOG_KEY, log.slice(-60)); }
    function addMsg(from, text, silent) {
        log.push({ f: from, t: text, ts: Date.now() }); save();
        if (list) draw(from, text);
        if (!silent && from === 'bot' && !panel.classList.contains('open')) dot.hidden = false;
    }
    function draw(from, text) {
        var d = document.createElement('div'); d.className = 'sc-msg ' + from; d.innerHTML = fmt(text);
        list.appendChild(d); list.scrollTop = list.scrollHeight;
    }
    function botSay(text, then) {
        var typing = document.createElement('div'); typing.className = 'sc-msg bot sc-typing'; typing.innerHTML = '<i></i><i></i><i></i>';
        list.appendChild(typing); list.scrollTop = list.scrollHeight;
        setTimeout(function () { typing.remove(); addMsg('bot', text); if (then) then(); }, 550);
    }
    function showChips(keys) {
        chipsBox.innerHTML = keys.map(function (k) { return '<button type="button" class="sc-chip" data-sc="chip" data-k="' + k + '">' + esc(tr(TXT.chips[k])) + '</button>'; }).join('');
    }
    var ALL_CHIPS = ['order', 'edit', 'shipping', 'payment', 'returns', 'account', 'human'];

    /* ---------- bot ---------- */
    function ordersForMe() {
        var all = lsGet('boda_orders', []), u = user();
        return u ? all.filter(function (o) { return o.user === u.email; }) : all;
    }
    function orderLine(o) { return tr(TXT.ans.orderLine) + ' [[order:' + o.id + ']] — ' + (o.cancelled ? 'Cancelled' : o.status) + ' — $' + (Math.round(o.total * 100) / 100); }
    function answerOrder(text) {
        var m = /BD-?\d{4,}/i.exec(text), all = lsGet('boda_orders', []);
        if (m) {
            var id = m[0].toUpperCase().replace(/^BD(\d)/, 'BD-$1'), o = all.filter(function (x) { return x.id.toUpperCase() === id; })[0];
            return o ? orderLine(o) + '\n[[orders]]' : tr(TXT.ans.orderNotFound);
        }
        var mine = ordersForMe().slice(0, 3);
        if (!mine.length) return tr(TXT.ans.noOrders);
        return tr(TXT.ans.lastOrders) + '\n' + mine.map(orderLine).join('\n') + '\n[[orders]]';
    }
    function editableOrders() {
        return ordersForMe().filter(function (o) { return !o.cancelled && (o.status === 'Pending' || o.status === 'Processing'); }).slice(0, 4);
    }
    function answerEdit() {
        var e = editableOrders();
        if (!e.length) return tr(TXT.ans.noEditable);
        return tr(TXT.ans.edit) + '\n' + e.map(function (o) { return '• [[order:' + o.id + ']] — $' + (Math.round(o.total * 100) / 100); }).join('\n');
    }
    function topic(text) {
        for (var i = 0; i < KEYS.length; i++) if (KEYS[i][1].test(text)) return KEYS[i][0];
        return /BD-?\d{4,}/i.test(text) ? 'order' : null;
    }
    function startHandoff(firstText) {
        var contact = user() ? user().email : (lsGet(CONTACT_KEY, '') || '');
        st.pending = firstText || st.pending || '';
        if (contact) return sendToAdmin(contact);
        st.awaitContact = true; botSay(tr(TXT.ans.askContact));
    }
    function validContact(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || /^\+?[\d\s-]{8,15}$/.test(v); }
    function sendToAdmin(contact) {
        var u = user(), isMail = /@/.test(contact);
        var transcript = log.filter(function (m) { return m.f === 'me'; }).slice(-8).map(function (m) { return m.t; }).join('\n');
        var msgs = lsGet('boda_messages', []);
        msgs.unshift({ id: 'm' + Date.now(), name: u ? u.name : (isMail ? contact.split('@')[0] : 'Guest'), email: isMail ? contact : (u ? u.email : ''), phone: isMail ? '' : contact, subject: 'Support chat', message: transcript || st.pending || '(chat)', time: Date.now(), read: false });
        lsSet('boda_messages', msgs); lsSet(CONTACT_KEY, contact);
        /* Also deliver to the FastAPI backend when it is configured:  localStorage.setItem('boda_api','https://your-api.example.com') */
        try {
            var api = (localStorage.getItem('boda_api') || '').replace(/\/$/, '');
            if (api && window.fetch) fetch(api + '/api/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: msgs[0].name, email: msgs[0].email, phone: msgs[0].phone, subject: 'Support chat', message: msgs[0].message }) }).catch(function () { });
        } catch (e) { }
        st.awaitContact = false; st.pending = ''; st.unknown = 0;
        botSay(tr(TXT.ans.sent) + ' ' + contact, function () { showChips(ALL_CHIPS.slice(0, 6)); });
    }

    function handle(text) {
        text = (text || '').trim(); if (!text) return;
        addMsg('me', text);
        if (st.awaitContact) {
            if (!validContact(text)) return botSay(tr(TXT.ans.badContact));
            return sendToAdmin(text);
        }
        var k = topic(text);
        if (k === 'human') return startHandoff(text);
        if (k === 'edit') { st.unknown = 0; return botSay(answerEdit(), function () { showChips(ALL_CHIPS); }); }
        if (k === 'order') return botSay(/BD-?\d{4,}/i.test(text) ? answerOrder(text) : tr(TXT.ans.askOrder) + '\n\n' + answerOrder(text));
        if (k) { st.unknown = 0; return botSay(tr(TXT.ans[k]), function () { showChips(ALL_CHIPS); }); }
        st.unknown++;
        if (st.unknown >= 2) { st.pending = text; return startHandoff(text); }
        botSay(tr(TXT.ans.unknown), function () { showChips(ALL_CHIPS); });
    }
    function chip(k) {
        var label = tr(TXT.chips[k]);
        if (k === 'human') { addMsg('me', label); return startHandoff(label); }
        if (k === 'edit') { addMsg('me', label); return botSay(answerEdit(), function () { showChips(ALL_CHIPS); }); }
        if (k === 'order') { addMsg('me', label); return botSay(tr(TXT.ans.askOrder) + '\n\n' + answerOrder(''), function () { showChips(ALL_CHIPS); }); }
        addMsg('me', label); botSay(tr(TXT.ans[k === 'returns' ? 'returns' : k]), function () { showChips(ALL_CHIPS); });
    }

    /* ---------- UI ---------- */
    function styles() {
        if (document.getElementById('sc-style')) return;
        var s = document.createElement('style'); s.id = 'sc-style';
        s.textContent = [
            '#sc-root{position:fixed;bottom:22px;inset-inline-start:22px;z-index:9990;font-family:inherit}',
            '.sc-fab{width:58px;height:58px;border-radius:50%;border:0;background:var(--brand,#d7263d);color:#fff;font-size:1.5rem;cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,.3);display:grid;place-items:center;position:relative;transition:transform .15s}',
            '.sc-fab:hover{transform:scale(1.07)}.sc-fab[aria-expanded="true"]{background:var(--ink,#0f1b2d)}',
            '.sc-dot{position:absolute;top:2px;inset-inline-end:2px;width:14px;height:14px;border-radius:50%;background:#2ecc71;border:2px solid #fff}',
            '.sc-panel{position:absolute;bottom:72px;inset-inline-start:0;width:min(370px,calc(100vw - 28px));height:min(540px,calc(100vh - 120px));background:var(--surface,#fff);color:var(--ink,#0f1b2d);border:1px solid var(--line,#dde3ec);border-radius:14px;box-shadow:0 18px 50px rgba(0,0,0,.35);display:none;flex-direction:column;overflow:hidden}',
            '.sc-panel.open{display:flex;animation:scIn .18s ease-out}@keyframes scIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}',
            '.sc-head{background:var(--brand,#d7263d);color:#fff;padding:14px 16px;display:flex;align-items:center;gap:10px}',
            '.sc-av{width:38px;height:38px;border-radius:50%;background:rgba(255,255,255,.22);display:grid;place-items:center;font-size:1.2rem}',
            '.sc-head strong{display:block;font-size:.98rem}.sc-head small{opacity:.9;font-size:.75rem;display:flex;align-items:center;gap:5px}',
            '.sc-head small::before{content:"";width:8px;height:8px;border-radius:50%;background:#2ecc71}',
            '.sc-hb{margin-inline-start:auto;display:flex;gap:4px}.sc-hb button{background:rgba(255,255,255,.18);border:0;color:#fff;width:30px;height:30px;border-radius:8px;cursor:pointer;font-size:1rem}',
            '.sc-hb button:hover{background:rgba(255,255,255,.32)}',
            '.sc-list{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:9px;background:var(--paper,#f4f6fa)}',
            '.sc-msg{max-width:84%;padding:9px 12px;border-radius:12px;font-size:.88rem;line-height:1.5;word-wrap:break-word}',
            '.sc-msg.bot{background:var(--surface,#fff);border:1px solid var(--line,#dde3ec);align-self:flex-start;border-end-start-radius:3px}',
            '.sc-msg.me{background:var(--brand,#d7263d);color:#fff;align-self:flex-end;border-end-end-radius:3px}',
            '.sc-msg a{color:var(--brand,#d7263d);font-weight:600}.sc-msg.me a{color:#fff}',
            '.sc-typing{display:flex;gap:4px;padding:12px 14px}.sc-typing i{width:7px;height:7px;border-radius:50%;background:#9aa6b8;animation:scB 1s infinite}',
            '.sc-typing i:nth-child(2){animation-delay:.15s}.sc-typing i:nth-child(3){animation-delay:.3s}@keyframes scB{0%,60%,100%{transform:none;opacity:.5}30%{transform:translateY(-5px);opacity:1}}',
            '.sc-chips{display:flex;flex-wrap:wrap;gap:6px;padding:8px 12px 0;background:var(--surface,#fff);border-top:1px solid var(--line,#dde3ec);max-height:92px;overflow-y:auto}',
            '.sc-chips:empty{display:none}',
            '.sc-chip{border:1px solid var(--brand,#d7263d);color:var(--brand,#d7263d);background:transparent;border-radius:16px;padding:5px 11px;font:inherit;font-size:.78rem;cursor:pointer}',
            '.sc-chip:hover{background:var(--brand,#d7263d);color:#fff}',
            '.sc-form{display:flex;gap:8px;padding:10px 12px;background:var(--surface,#fff)}',
            '.sc-form input{flex:1;min-width:0;padding:10px 12px;border:1.5px solid var(--line,#dde3ec);border-radius:22px;font:inherit;font-size:.9rem;background:var(--surface,#fff);color:var(--ink,#0f1b2d)}',
            '.sc-form input:focus{outline:none;border-color:var(--brand,#d7263d)}',
            '.sc-form button{border:0;background:var(--brand,#d7263d);color:#fff;border-radius:22px;padding:0 16px;font:inherit;font-weight:600;cursor:pointer}',
            '@media(max-width:520px){#sc-root{bottom:16px;inset-inline-start:14px}.sc-panel{height:min(520px,calc(100vh - 100px))}}'
        ].join('\n');
        document.head.appendChild(s);
    }

    function build() {
        if (document.getElementById('sc-root')) return;
        styles();
        root = document.createElement('div'); root.id = 'sc-root';
        root.innerHTML = '<div class="sc-panel" role="dialog" aria-label="' + esc(tr(SUPPORT_NAME)) + '">' +
            '<div class="sc-head"><div class="sc-av">🎧</div><div><strong>' + esc(tr(SUPPORT_NAME)) + '</strong><small>' + esc(tr(TXT.online)) + '</small></div>' +
            '<div class="sc-hb"><button type="button" data-sc="reset" title="' + esc(tr(TXT.reset)) + '" aria-label="' + esc(tr(TXT.reset)) + '">↻</button><button type="button" data-sc="close" title="' + esc(tr(TXT.close)) + '" aria-label="' + esc(tr(TXT.close)) + '">×</button></div></div>' +
            '<div class="sc-list"></div><div class="sc-chips"></div>' +
            '<form class="sc-form" autocomplete="off"><input type="text" maxlength="300" placeholder="' + esc(tr(TXT.placeholder)) + '" aria-label="' + esc(tr(TXT.placeholder)) + '"><button type="submit">' + esc(tr(TXT.send)) + '</button></form></div>' +
            '<button type="button" class="sc-fab" data-sc="toggle" aria-expanded="false" aria-label="' + esc(tr(TXT.open)) + '" title="' + esc(tr(TXT.open)) + '">💬<span class="sc-dot" hidden></span></button>';
        document.body.appendChild(root);
        panel = root.querySelector('.sc-panel'); list = root.querySelector('.sc-list'); input = root.querySelector('.sc-form input');
        chipsBox = root.querySelector('.sc-chips'); dot = root.querySelector('.sc-dot');
        root.addEventListener('click', function (e) {
            var b = e.target.closest('[data-sc]'); if (!b) return;
            var a = b.dataset.sc;
            if (a === 'toggle') toggle(); else if (a === 'close') toggle(false);
            else if (a === 'reset') resetChat(); else if (a === 'chip') chip(b.dataset.k);
        });
        root.querySelector('.sc-form').addEventListener('submit', function (e) { e.preventDefault(); var v = input.value; input.value = ''; handle(v); });
        if (!window.__scEsc) { window.__scEsc = true; document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && panel && panel.classList.contains('open')) toggle(false); }); }
        if (log.length) log.forEach(function (m) { draw(m.f, m.t); });
        showChips(ALL_CHIPS);
    }
    function toggle(force) {
        var open = typeof force === 'boolean' ? force : !panel.classList.contains('open');
        panel.classList.toggle('open', open); root.querySelector('.sc-fab').setAttribute('aria-expanded', String(open));
        if (open) {
            dot.hidden = true;
            if (!log.length) { var u = user(); addMsg('bot', (u ? tr(TXT.ans.greet).replace('!', ', ' + u.name + '!') + '\n' : '') + tr(TXT.hello), true); }
            list.scrollTop = list.scrollHeight; setTimeout(function () { input.focus(); }, 50);
        }
    }
    function resetChat() { log = []; save(); list.innerHTML = ''; st = { awaitContact: false, unknown: 0, pending: '' }; showChips(ALL_CHIPS); addMsg('bot', tr(TXT.hello), true); }

    /* Public hook used by other pages (e.g. order confirmation): BodaSupport.open('Need help with order BD-123456') */
    window.BodaSupport = {
        open: function (text) {
            ensure(); if (!panel) return;
            toggle(true);
            if (text) { input.value = text; input.focus(); }
        }
    };

    /* The store replaces <body> content when the page template loads, so (re)mount whenever the widget goes missing. */
    function ensure() { if (document.body && !document.getElementById('sc-root')) build(); }
    function boot() {
        ensure();
        new MutationObserver(ensure).observe(document.documentElement, { childList: true, subtree: false });
        if (document.body) new MutationObserver(ensure).observe(document.body, { childList: true });
    }
    window.addEventListener('load', function () { setTimeout(boot, 0); });
    if (document.readyState === 'complete') boot();
})();
