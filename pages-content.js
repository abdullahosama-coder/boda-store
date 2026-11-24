/* ===== Boda Store - Help Center / Privacy Policy / Terms & Conditions content (EN / AR / FR / DE) =====
   The text of these three pages lives HERE (defaults) and in the admin panel (Pages section -> localStorage "boda_pages").
   - The admin can edit / add / hide / delete every section; the storefront re-draws the pages from that data.
   - Every section carries all four languages, so the whole body changes with the language switch (not only the title).
   - Simple formatting inside a text: blank line = new paragraph, [label](index.html?page=terms) = link. */
(function () {
    'use strict';
    var KEY = 'boda_pages';
    var LANGS = ['en', 'ar', 'fr', 'de'];

    var GROUPS = {
        delivery: { en: 'Shipping & Delivery', ar: 'الشحن والتوصيل', fr: 'Livraison et expédition', de: 'Versand & Lieferung' },
        returns: { en: 'Returns & Refunds', ar: 'الاسترجاع والاسترداد', fr: 'Retours et remboursements', de: 'Rückgabe & Erstattung' },
        payment: { en: 'Payment', ar: 'الدفع', fr: 'Paiement', de: 'Zahlung' },
        account: { en: 'Account & Security', ar: 'الحساب والأمان', fr: 'Compte et sécurité', de: 'Konto & Sicherheit' }
    };
    var NONE_FOUND = { en: 'No help topics match your search.', ar: 'لا توجد مواضيع مساعدة مطابقة لبحثك.', fr: 'Aucun sujet ne correspond à votre recherche.', de: 'Keine passenden Hilfethemen gefunden.' };

    /* [page, group, titleEN, titleAR, titleFR, titleDE, bodyEN, bodyAR, bodyFR, bodyDE] */
    var SEED = [
        /* ---------------- Help Center ---------------- */
        ['help', 'delivery', 'How much does delivery cost?', 'كم تبلغ تكلفة التوصيل؟', 'Combien coûte la livraison ?', 'Wie viel kostet die Lieferung?',
            'The delivery fee depends on your governorate and is shown at checkout before you confirm the order. Orders above the free-delivery limit are delivered at no charge.',
            'تعتمد رسوم التوصيل على محافظتك وتظهر عند إتمام الطلب قبل التأكيد. الطلبات التي تتجاوز حد التوصيل المجاني يتم توصيلها بدون رسوم.',
            'Les frais de livraison dépendent de votre gouvernorat et sont affichés lors du paiement avant la confirmation de la commande. Les commandes dépassant le seuil de livraison gratuite sont livrées sans frais.',
            'Die Liefergebühr hängt von Ihrem Gouvernement ab und wird an der Kasse vor der Bestätigung angezeigt. Bestellungen über der Gratislieferungsgrenze werden kostenlos geliefert.'],
        ['help', 'delivery', 'How long does delivery take?', 'كم تستغرق مدة التوصيل؟', 'Combien de temps prend la livraison ?', 'Wie lange dauert die Lieferung?',
            'Most orders arrive within 2 to 4 days. The estimated time is shown on the order confirmation page.',
            'تصل معظم الطلبات خلال 2 إلى 4 أيام. يظهر الوقت المتوقع في صفحة تأكيد الطلب.',
            'La plupart des commandes arrivent sous 2 à 4 jours. Le délai estimé est indiqué sur la page de confirmation de commande.',
            'Die meisten Bestellungen treffen innerhalb von 2 bis 4 Tagen ein. Die voraussichtliche Lieferzeit wird auf der Bestellbestätigungsseite angezeigt.'],
        ['help', 'delivery', 'Can I change my shipping address after ordering?', 'هل يمكنني تغيير عنوان الشحن بعد الطلب؟', 'Puis-je modifier mon adresse de livraison après la commande ?', 'Kann ich meine Lieferadresse nach der Bestellung ändern?',
            'Yes, while the order is still Pending you can edit the address, quantities and items from the order confirmation page in My Orders.',
            'نعم، طالما أن الطلب ما زال قيد الانتظار يمكنك تعديل العنوان والكميات والمنتجات من صفحة تأكيد الطلب داخل «طلباتي».',
            'Oui, tant que la commande est en attente, vous pouvez modifier l’adresse, les quantités et les articles depuis la page de confirmation dans « Mes commandes ».',
            'Ja, solange die Bestellung noch aussteht, können Sie Adresse, Mengen und Artikel auf der Bestätigungsseite unter „Meine Bestellungen“ ändern.'],
        ['help', 'returns', 'What is the return policy?', 'ما هي سياسة الاسترجاع؟', 'Quelle est la politique de retour ?', 'Wie lautet die Rückgabebedingung?',
            'You can return most items within 14 days of delivery if they are unused and in their original packaging. See the [Terms & Conditions](index.html?page=terms) for details.',
            'يمكنك إرجاع معظم المنتجات خلال 14 يومًا من التسليم إذا كانت غير مستخدمة وفي عبوتها الأصلية. راجع [الشروط والأحكام](index.html?page=terms) لمعرفة التفاصيل.',
            'Vous pouvez retourner la plupart des articles dans les 14 jours suivant la livraison s’ils sont inutilisés et dans leur emballage d’origine. Consultez les [Conditions générales](index.html?page=terms) pour plus de détails.',
            'Die meisten Artikel können innerhalb von 14 Tagen nach Lieferung zurückgegeben werden, wenn sie unbenutzt und in der Originalverpackung sind. Details finden Sie in den [Allgemeinen Geschäftsbedingungen](index.html?page=terms).'],
        ['help', 'returns', 'How do I get a refund?', 'كيف أحصل على استرداد المبلغ؟', 'Comment obtenir un remboursement ?', 'Wie erhalte ich eine Erstattung?',
            'Contact support with your order number. Approved refunds are returned to the original payment method.',
            'تواصل مع الدعم ومعك رقم الطلب. يتم إرجاع المبالغ المعتمدة إلى وسيلة الدفع الأصلية.',
            'Contactez le support avec votre numéro de commande. Les remboursements approuvés sont versés sur le moyen de paiement d’origine.',
            'Kontaktieren Sie den Support mit Ihrer Bestellnummer. Genehmigte Erstattungen erfolgen auf die ursprüngliche Zahlungsmethode.'],
        ['help', 'payment', 'Which payment methods do you accept?', 'ما وسائل الدفع المتاحة؟', 'Quels moyens de paiement acceptez-vous ?', 'Welche Zahlungsmethoden akzeptieren Sie?',
            'Visa, Mastercard, supported payment gateways and Cash on Delivery.',
            'فيزا وماستركارد وبوابات الدفع المدعومة والدفع عند الاستلام.',
            'Visa, Mastercard, les passerelles de paiement prises en charge et le paiement à la livraison.',
            'Visa, Mastercard, unterstützte Zahlungsanbieter und Barzahlung bei Lieferung.'],
        ['help', 'payment', 'Is my payment information safe?', 'هل بيانات الدفع الخاصة بي آمنة؟', 'Mes informations de paiement sont-elles en sécurité ?', 'Sind meine Zahlungsdaten sicher?',
            'Yes. We never store your full card number or CVV. Read our [Privacy Policy](index.html?page=privacy).',
            'نعم. لا نقوم أبدًا بحفظ رقم بطاقتك كاملًا أو رمز CVV. اقرأ [سياسة الخصوصية](index.html?page=privacy).',
            'Oui. Nous ne conservons jamais votre numéro de carte complet ni votre CVV. Lisez notre [Politique de confidentialité](index.html?page=privacy).',
            'Ja. Wir speichern niemals Ihre vollständige Kartennummer oder CVV. Lesen Sie unsere [Datenschutzerklärung](index.html?page=privacy).'],
        ['help', 'account', 'I forgot my password', 'نسيت كلمة المرور', 'J’ai oublié mon mot de passe', 'Ich habe mein Passwort vergessen',
            'Open Sign In and choose “Forgot password”, then enter your email or phone number to set a new one.',
            'افتح صفحة تسجيل الدخول واختر «نسيت كلمة المرور»، ثم أدخل بريدك الإلكتروني أو رقم هاتفك لتعيين كلمة مرور جديدة.',
            'Ouvrez la page de connexion et choisissez « Mot de passe oublié », puis saisissez votre e-mail ou numéro de téléphone pour en définir un nouveau.',
            'Öffnen Sie die Anmeldung und wählen Sie „Passwort vergessen“. Geben Sie dann Ihre E-Mail-Adresse oder Telefonnummer ein, um ein neues festzulegen.'],
        ['help', 'account', 'How do I contact you?', 'كيف أتواصل معكم؟', 'Comment vous contacter ?', 'Wie kann ich Sie kontaktieren?',
            'Use the chat button, the [Contact page](index.html?page=contact), or email info@bodastore.com. We reply within a day.',
            'استخدم زر الدردشة أو [صفحة اتصل بنا](index.html?page=contact) أو راسلنا على info@bodastore.com. نرد خلال يوم واحد.',
            'Utilisez le bouton de chat, la [page Contact](index.html?page=contact) ou écrivez à info@bodastore.com. Nous répondons sous un jour.',
            'Nutzen Sie den Chat-Button, die [Kontaktseite](index.html?page=contact) oder schreiben Sie an info@bodastore.com. Wir antworten innerhalb eines Tages.'],

        /* ---------------- Privacy Policy ---------------- */
        ['privacy', 'intro', '', '', '', '',
            'Last updated: November 2026. This policy explains what information Boda Store collects and how we use it.',
            'آخر تحديث: نوفمبر 2026. توضح هذه السياسة المعلومات التي يجمعها بودا ستور وكيفية استخدامنا لها.',
            'Dernière mise à jour : novembre 2026. Cette politique explique quelles informations Boda Store collecte et comment nous les utilisons.',
            'Zuletzt aktualisiert: November 2026. Diese Richtlinie erklärt, welche Daten Boda Store erhebt und wie wir sie verwenden.'],
        ['privacy', '', '1. Information we collect', '1. المعلومات التي نجمعها', '1. Informations que nous collectons', '1. Daten, die wir erheben',
            'We collect the details you give us when you create an account, place an order or contact us: name, email or phone number, shipping address, and order history. We also keep basic technical data such as your language and theme preference.',
            'نجمع البيانات التي تقدمها لنا عند إنشاء حساب أو إتمام طلب أو التواصل معنا: الاسم والبريد الإلكتروني أو رقم الهاتف وعنوان الشحن وسجل الطلبات. كما نحتفظ ببيانات تقنية بسيطة مثل لغتك ومظهر الموقع المفضل.',
            'Nous collectons les informations que vous nous donnez lors de la création d’un compte, d’une commande ou d’un contact : nom, e-mail ou téléphone, adresse de livraison et historique des commandes. Nous conservons aussi des données techniques de base comme votre langue et votre thème préféré.',
            'Wir erfassen die Angaben, die Sie bei der Kontoerstellung, Bestellung oder Kontaktaufnahme machen: Name, E-Mail oder Telefonnummer, Lieferadresse und Bestellverlauf. Zudem speichern wir einfache technische Daten wie Ihre Sprache und Designauswahl.'],
        ['privacy', '', '2. How we use your information', '2. كيف نستخدم معلوماتك', '2. Comment nous utilisons vos informations', '2. Wie wir Ihre Daten verwenden',
            'We use your information to process and deliver orders, provide customer support, send order notifications, improve the store, and prevent fraud.',
            'نستخدم معلوماتك لمعالجة الطلبات وتوصيلها وتقديم دعم العملاء وإرسال إشعارات الطلبات وتحسين المتجر ومنع الاحتيال.',
            'Nous utilisons vos informations pour traiter et livrer les commandes, assurer le support client, envoyer des notifications de commande, améliorer la boutique et prévenir la fraude.',
            'Wir verwenden Ihre Daten, um Bestellungen zu bearbeiten und zu liefern, Kundensupport zu bieten, Bestellbenachrichtigungen zu senden, den Shop zu verbessern und Betrug zu verhindern.'],
        ['privacy', '', '3. Payment data', '3. بيانات الدفع', '3. Données de paiement', '3. Zahlungsdaten',
            'We never store your full card number or CVV. Only the card brand and last four digits are kept so you can recognise a saved card.',
            'لا نقوم أبدًا بحفظ رقم بطاقتك كاملًا أو رمز CVV. نحتفظ فقط بنوع البطاقة وآخر أربعة أرقام لتتمكن من التعرف على البطاقة المحفوظة.',
            'Nous ne conservons jamais votre numéro de carte complet ni votre CVV. Seuls la marque de la carte et les quatre derniers chiffres sont gardés pour reconnaître une carte enregistrée.',
            'Wir speichern niemals Ihre vollständige Kartennummer oder CVV. Nur die Kartenmarke und die letzten vier Ziffern werden gespeichert, damit Sie eine gespeicherte Karte erkennen.'],
        ['privacy', '', '4. Cookies and local storage', '4. ملفات تعريف الارتباط والتخزين المحلي', '4. Cookies et stockage local', '4. Cookies und lokaler Speicher',
            'The store uses your browser’s local storage to remember your cart, favorites, language and sign-in session. You can clear this data at any time from your browser settings.',
            'يستخدم المتجر التخزين المحلي في متصفحك لتذكّر سلتك ومفضلتك ولغتك وجلسة تسجيل الدخول. يمكنك مسح هذه البيانات في أي وقت من إعدادات المتصفح.',
            'La boutique utilise le stockage local de votre navigateur pour mémoriser votre panier, vos favoris, votre langue et votre session de connexion. Vous pouvez effacer ces données à tout moment dans les paramètres du navigateur.',
            'Der Shop nutzt den lokalen Speicher Ihres Browsers, um Warenkorb, Favoriten, Sprache und Anmeldesitzung zu merken. Sie können diese Daten jederzeit in den Browsereinstellungen löschen.'],
        ['privacy', '', '5. Sharing', '5. المشاركة', '5. Partage', '5. Weitergabe',
            'We do not sell your personal data. We share only what is needed with delivery partners and payment providers to complete your order.',
            'لا نبيع بياناتك الشخصية. نشارك فقط ما يلزم مع شركاء التوصيل ومزودي الدفع لإتمام طلبك.',
            'Nous ne vendons pas vos données personnelles. Nous ne partageons que le nécessaire avec les partenaires de livraison et les prestataires de paiement pour finaliser votre commande.',
            'Wir verkaufen Ihre personenbezogenen Daten nicht. Wir geben nur das Nötige an Lieferpartner und Zahlungsanbieter weiter, um Ihre Bestellung abzuschließen.'],
        ['privacy', '', '6. Your rights', '6. حقوقك', '6. Vos droits', '6. Ihre Rechte',
            'You can view, correct or delete your account information, and unsubscribe from our newsletter at any time. Contact us at info@bodastore.com for any privacy request.',
            'يمكنك عرض بيانات حسابك أو تصحيحها أو حذفها، وإلغاء الاشتراك في نشرتنا البريدية في أي وقت. تواصل معنا على info@bodastore.com لأي طلب يخص الخصوصية.',
            'Vous pouvez consulter, corriger ou supprimer les informations de votre compte et vous désabonner de notre newsletter à tout moment. Écrivez-nous à info@bodastore.com pour toute demande relative à la confidentialité.',
            'Sie können Ihre Kontodaten jederzeit einsehen, korrigieren oder löschen und sich vom Newsletter abmelden. Für Datenschutzanfragen schreiben Sie an info@bodastore.com.'],
        ['privacy', '', '7. Changes to this policy', '7. التغييرات على هذه السياسة', '7. Modifications de cette politique', '7. Änderungen dieser Richtlinie',
            'We may update this policy from time to time. The latest version is always available on this page.',
            'قد نقوم بتحديث هذه السياسة من وقت لآخر. تتوفر أحدث نسخة دائمًا في هذه الصفحة.',
            'Nous pouvons mettre à jour cette politique de temps à autre. La dernière version est toujours disponible sur cette page.',
            'Wir können diese Richtlinie von Zeit zu Zeit aktualisieren. Die aktuelle Fassung finden Sie immer auf dieser Seite.'],

        /* ---------------- Terms & Conditions ---------------- */
        ['terms', 'intro', '', '', '', '',
            'Last updated: November 2026. By using Boda Store you agree to the terms below.',
            'آخر تحديث: نوفمبر 2026. باستخدامك لبودا ستور فإنك توافق على الشروط الموضحة أدناه.',
            'Dernière mise à jour : novembre 2026. En utilisant Boda Store, vous acceptez les conditions ci-dessous.',
            'Zuletzt aktualisiert: November 2026. Mit der Nutzung von Boda Store stimmen Sie den folgenden Bedingungen zu.'],
        ['terms', '', '1. Using the store', '1. استخدام المتجر', '1. Utilisation de la boutique', '1. Nutzung des Shops',
            'You must provide accurate information when creating an account or placing an order, and keep your password confidential. You are responsible for all activity under your account.',
            'يجب تقديم معلومات صحيحة عند إنشاء حساب أو إتمام طلب، والحفاظ على سرية كلمة المرور. أنت مسؤول عن كل نشاط يتم عبر حسابك.',
            'Vous devez fournir des informations exactes lors de la création d’un compte ou d’une commande et garder votre mot de passe confidentiel. Vous êtes responsable de toute activité sur votre compte.',
            'Sie müssen bei der Kontoerstellung oder Bestellung korrekte Angaben machen und Ihr Passwort vertraulich halten. Sie sind für alle Aktivitäten unter Ihrem Konto verantwortlich.'],
        ['terms', '', '2. Products and prices', '2. المنتجات والأسعار', '2. Produits et prix', '2. Produkte und Preise',
            'We work to keep descriptions, images and prices accurate, but errors may occur. We may cancel an order if a product is unavailable or incorrectly priced and will refund any payment made.',
            'نحرص على أن تكون الأوصاف والصور والأسعار دقيقة، لكن قد تحدث أخطاء. يحق لنا إلغاء الطلب إذا كان المنتج غير متوفر أو سعره غير صحيح، وسنرد أي مبلغ تم دفعه.',
            'Nous veillons à l’exactitude des descriptions, images et prix, mais des erreurs peuvent survenir. Nous pouvons annuler une commande si un produit est indisponible ou mal tarifé et rembourserons tout paiement effectué.',
            'Wir bemühen uns um korrekte Beschreibungen, Bilder und Preise, Fehler können jedoch vorkommen. Wir können eine Bestellung stornieren, wenn ein Produkt nicht verfügbar oder falsch ausgepreist ist, und erstatten geleistete Zahlungen.'],
        ['terms', '', '3. Orders and payment', '3. الطلبات والدفع', '3. Commandes et paiement', '3. Bestellungen und Zahlung',
            'An order is confirmed once placed and shown in My Orders. Pending orders can be edited or cancelled. Payment is by card, supported gateways or Cash on Delivery.',
            'يتم تأكيد الطلب فور إتمامه ويظهر في «طلباتي». يمكن تعديل الطلبات قيد الانتظار أو إلغاؤها. الدفع يكون بالبطاقة أو عبر البوابات المدعومة أو عند الاستلام.',
            'Une commande est confirmée dès qu’elle est passée et apparaît dans « Mes commandes ». Les commandes en attente peuvent être modifiées ou annulées. Le paiement se fait par carte, passerelles prises en charge ou à la livraison.',
            'Eine Bestellung gilt als bestätigt, sobald sie aufgegeben wurde und unter „Meine Bestellungen“ erscheint. Ausstehende Bestellungen können geändert oder storniert werden. Die Zahlung erfolgt per Karte, über unterstützte Zahlungsanbieter oder bar bei Lieferung.'],
        ['terms', '', '4. Delivery', '4. التوصيل', '4. Livraison', '4. Lieferung',
            'Delivery fees depend on the governorate and are shown at checkout. Delivery times are estimates and may vary.',
            'تعتمد رسوم التوصيل على المحافظة وتظهر عند إتمام الطلب. مواعيد التوصيل تقديرية وقد تختلف.',
            'Les frais de livraison dépendent du gouvernorat et sont affichés lors du paiement. Les délais de livraison sont des estimations et peuvent varier.',
            'Die Liefergebühren hängen vom Gouvernement ab und werden an der Kasse angezeigt. Lieferzeiten sind Schätzungen und können variieren.'],
        ['terms', '', '5. Returns and refunds', '5. الاسترجاع والاسترداد', '5. Retours et remboursements', '5. Rückgabe und Erstattung',
            'Most items can be returned within 14 days of delivery if unused and in original packaging. Refunds are issued to the original payment method after the returned item is checked.',
            'يمكن إرجاع معظم المنتجات خلال 14 يومًا من التسليم إذا كانت غير مستخدمة وفي عبوتها الأصلية. يتم رد المبلغ إلى وسيلة الدفع الأصلية بعد فحص المنتج المرتجع.',
            'La plupart des articles peuvent être retournés dans les 14 jours suivant la livraison s’ils sont inutilisés et dans leur emballage d’origine. Les remboursements sont effectués sur le moyen de paiement d’origine après vérification de l’article retourné.',
            'Die meisten Artikel können innerhalb von 14 Tagen nach Lieferung zurückgegeben werden, wenn sie unbenutzt und originalverpackt sind. Erstattungen erfolgen nach Prüfung des zurückgesendeten Artikels auf die ursprüngliche Zahlungsmethode.'],
        ['terms', '', '6. Warranty', '6. الضمان', '6. Garantie', '6. Garantie',
            'Electronics and appliances include a 1-year warranty against manufacturing defects. Misuse and accidental damage are not covered.',
            'تتضمن الإلكترونيات والأجهزة ضمانًا لمدة سنة ضد عيوب التصنيع. لا يشمل الضمان سوء الاستخدام أو التلف العرضي.',
            'Les appareils électroniques et électroménagers sont couverts par une garantie de 1 an contre les défauts de fabrication. Le mauvais usage et les dommages accidentels ne sont pas couverts.',
            'Elektronik und Haushaltsgeräte haben 1 Jahr Garantie auf Herstellungsfehler. Missbrauch und versehentliche Schäden sind nicht abgedeckt.'],
        ['terms', '', '7. Limitation of liability', '7. حدود المسؤولية', '7. Limitation de responsabilité', '7. Haftungsbeschränkung',
            'To the extent permitted by law, Boda Store is not liable for indirect or consequential losses arising from the use of the store.',
            'في الحدود التي يسمح بها القانون، لا يتحمل بودا ستور مسؤولية الخسائر غير المباشرة أو التبعية الناتجة عن استخدام المتجر.',
            'Dans la mesure permise par la loi, Boda Store n’est pas responsable des pertes indirectes ou consécutives liées à l’utilisation de la boutique.',
            'Soweit gesetzlich zulässig, haftet Boda Store nicht für mittelbare Schäden oder Folgeschäden aus der Nutzung des Shops.'],
        ['terms', '', '8. Contact', '8. التواصل', '8. Contact', '8. Kontakt',
            'Questions about these terms? Email info@bodastore.com or use the [Contact page](index.html?page=contact).',
            'لديك أسئلة حول هذه الشروط؟ راسلنا على info@bodastore.com أو استخدم [صفحة اتصل بنا](index.html?page=contact).',
            'Des questions sur ces conditions ? Écrivez à info@bodastore.com ou utilisez la [page Contact](index.html?page=contact).',
            'Fragen zu diesen Bedingungen? Schreiben Sie an info@bodastore.com oder nutzen Sie die [Kontaktseite](index.html?page=contact).']
    ];

    function defaults() {
        var cnt = {};
        return SEED.map(function (r) {
            var k = r[0] + '|' + r[1]; cnt[k] = (cnt[k] || 0) + 1;
            return {
                id: 'pg-' + r[0] + '-' + (r[1] || 'sec') + '-' + cnt[k], page: r[0], group: r[1], order: cnt[k], active: true, created: 1,
                title_en: r[2], title_ar: r[3], title_fr: r[4], title_de: r[5],
                body_en: r[6], body_ar: r[7], body_fr: r[8], body_de: r[9]
            };
        });
    }
    function read() {
        try { var v = JSON.parse(localStorage.getItem(KEY)); if (Array.isArray(v)) return v; } catch (e) { }
        return null;
    }
    function all() { return read() || defaults(); }
    function lang() { return (window.BodaI18n && BodaI18n.current && BodaI18n.current()) || 'en'; }
    function pick(r, f, L) { return (r[f + '_' + L] || '').trim() || (r[f + '_en'] || '').trim() || (r[f + '_ar'] || '').trim(); }

    function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
    function rich(txt) {
        return String(txt || '').split(/\n{2,}/).map(function (p) {
            var h = esc(p.trim()).replace(/\n/g, '<br>').replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (m, a, u) {
                u = u.replace(/&amp;/g, '&');
                if (!/^(index\.html|https?:|mailto:|tel:|#)/i.test(u)) return m;
                return '<a href="' + esc(u) + '">' + a + '</a>';
            });
            return h ? '<p>' + h + '</p>' : '';
        }).join('');
    }
    function sorted(page) {
        return all().filter(function (r) { return r.page === page && r.active !== false; })
            .sort(function (a, b) { return (Number(a.order) || 0) - (Number(b.order) || 0); });
    }

    function renderLegal(page, main) {
        var L = lang(), rows = sorted(page);
        [].forEach.call(main.querySelectorAll('.legal-sec, .legal-intro'), function (n) { n.remove(); });
        var old = main.querySelector('.page-intro'); if (old) old.remove();      // the old hard-coded intro line
        var h1 = main.querySelector('h1.page-title'), anchor = h1 || main.firstChild;
        var html = '', intro = rows.filter(function (r) { return r.group === 'intro'; });
        intro.forEach(function (r) { html += '<div class="legal-intro no-i18n page-intro">' + rich(pick(r, 'body', L)) + '</div>'; });
        rows.filter(function (r) { return r.group !== 'intro'; }).forEach(function (r) {
            html += '<section class="legal-sec no-i18n" data-pg="' + esc(r.id) + '"><h2>' + esc(pick(r, 'title', L)) + '</h2>' + rich(pick(r, 'body', L)) + '</section>';
        });
        var box = document.createElement('div'); box.className = 'legal-dyn'; box.innerHTML = html;
        var prev = main.querySelector('.legal-dyn'); if (prev) prev.remove();
        if (anchor && anchor.parentNode === main) anchor.after(box); else main.appendChild(box);
    }
    function renderHelp(main) {
        var L = lang(), rows = sorted('help'), none = main.querySelector('#help-none');
        [].forEach.call(main.querySelectorAll('.help-sec'), function (n) { n.remove(); });
        var html = '';
        Object.keys(GROUPS).forEach(function (g) {
            var list = rows.filter(function (r) { return r.group === g; }); if (!list.length) return;
            html += '<section class="help-sec no-i18n" id="help-' + g + '"><h2>' + esc(GROUPS[g][L] || GROUPS[g].en) + '</h2>' +
                list.map(function (r) { return '<details class="help-q"><summary>' + esc(pick(r, 'title', L)) + '</summary>' + rich(pick(r, 'body', L)) + '</details>'; }).join('') + '</section>';
        });
        var tmp = document.createElement('div'); tmp.innerHTML = html;
        var frag = document.createDocumentFragment(); while (tmp.firstChild) frag.appendChild(tmp.firstChild);
        if (none) { none.classList.add('no-i18n'); none.textContent = NONE_FOUND[L] || NONE_FOUND.en; none.before(frag); } else main.appendChild(frag);
        var q = main.querySelector('#help-q'); if (q && q.value) q.dispatchEvent(new Event('input', { bubbles: true }));   // keep an active search filter
    }
    function render() {
        var main = document.querySelector('main.legal');
        if (!main) return;
        var pg = new URLSearchParams(location.search).get('page') || '';
        if (main.classList.contains('help-page')) renderHelp(main);
        else if (pg === 'privacy' || pg === 'terms') renderLegal(pg, main);
    }

    window.BodaPages = { key: KEY, defaults: defaults, all: all, groups: GROUPS, render: render, rich: rich };

    function boot() { try { render(); } catch (e) { if (window.console) console.error('[Boda] pages render failed', e); } }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
    document.addEventListener('boda:lang', boot);                                    // language switched -> redraw the body text
    window.addEventListener('storage', function (e) { if (e.key === KEY) boot(); });  // admin edited in another tab -> live update
    document.addEventListener('boda:store', boot);
})();
