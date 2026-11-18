/* ===== Boda Store - automatic translation for category names (EN -> AR / FR / DE) =====
   1) built-in dictionary for the default categories  2) saved cache (localStorage "boda_autotr")
   3) free online translation (MyMemory) for anything new the admin adds - fetched once, then cached.
   Used by the storefront (language.js) and by the admin panel. */
(function () {
    'use strict';
    var KEY = 'boda_autotr', SEED = {"Automotive": {"ar": "السيارات", "fr": "Automobile", "de": "Auto"}, "Baby Care": {"ar": "العناية بالأطفال", "fr": "Soins bébé", "de": "Babypflege"}, "Bags & Shoes": {"ar": "حقائب وأحذية", "fr": "Sacs et chaussures", "de": "Taschen & Schuhe"}, "Beauty": {"ar": "الجمال", "fr": "Beauté", "de": "Beauty"}, "Books": {"ar": "كتب", "fr": "Livres", "de": "Bücher"}, "Car Care": {"ar": "العناية بالسيارة", "fr": "Entretien auto", "de": "Autopflege"}, "Car Tech": {"ar": "تقنيات السيارات", "fr": "Tech auto", "de": "Auto-Technik"}, "Car tech, care kits & interior gear.": {"ar": "تقنيات السيارات وأطقم العناية ومستلزمات الداخلية.", "fr": "Tech auto, kits d’entretien et accessoires intérieurs.", "de": "Auto-Technik, Pflegesets & Innenraumzubehör."}, "Clothing": {"ar": "ملابس", "fr": "Vêtements", "de": "Kleidung"}, "Clothing, rings, bracelets & bags.": {"ar": "ملابس وخواتم وأساور وحقائب.", "fr": "Vêtements, bagues, bracelets et sacs.", "de": "Kleidung, Ringe, Armbänder & Taschen."}, "Coffee makers, kitchen appliances, smart home gadgets, lighting and decor.": {"ar": "ماكينات قهوة وأجهزة مطبخ وأجهزة منزل ذكي وإضاءة وديكور.", "fr": "Machines à café, électroménager, objets connectés, éclairage et décoration.", "de": "Kaffeemaschinen, Küchengeräte, Smart-Home-Gadgets, Beleuchtung und Deko."}, "Computers": {"ar": "حواسيب", "fr": "Ordinateurs", "de": "Computer"}, "Dash cameras, car electronics, detailing care kits, and interior accessories.": {"ar": "كاميرات داشبورد وإلكترونيات السيارات وأطقم تلميع وإكسسوارات داخلية.", "fr": "Dashcams, électronique auto, kits de détailing et accessoires intérieurs.", "de": "Dashcams, Auto-Elektronik, Pflegesets und Innenraumzubehör."}, "Educational Toys": {"ar": "ألعاب تعليمية", "fr": "Jouets éducatifs", "de": "Lernspielzeug"}, "Educational toys, games & baby care.": {"ar": "ألعاب تعليمية وألعاب ترفيهية ومستلزمات الأطفال.", "fr": "Jouets éducatifs, jeux et soins pour bébé.", "de": "Lernspielzeug, Spiele & Babypflege."}, "Electronics": {"ar": "إلكترونيات", "fr": "Électronique", "de": "Elektronik"}, "Everyday clothing, jewelry, rings, bracelets, bags and footwear.": {"ar": "ملابس يومية ومجوهرات وخواتم وأساور وحقائب وأحذية.", "fr": "Vêtements du quotidien, bijoux, bagues, bracelets, sacs et chaussures.", "de": "Alltagskleidung, Schmuck, Ringe, Armbänder, Taschen und Schuhe."}, "Fashion": {"ar": "أزياء", "fr": "Mode", "de": "Mode"}, "Fitness Gear": {"ar": "معدات اللياقة", "fr": "Matériel de fitness", "de": "Fitnessgeräte"}, "Fitness gear, sportswear & trackers.": {"ar": "معدات لياقة وملابس رياضية وأجهزة تتبع.", "fr": "Matériel de fitness, vêtements de sport et trackers.", "de": "Fitnessgeräte, Sportbekleidung & Tracker."}, "Games": {"ar": "ألعاب", "fr": "Jeux", "de": "Spiele"}, "Grooming": {"ar": "العناية الشخصية", "fr": "Soins personnels", "de": "Körperpflege"}, "Home & Appliances": {"ar": "المنزل والأجهزة", "fr": "Maison et électroménager", "de": "Haus & Geräte"}, "Home workout weights, sportswear, and GPS fitness trackers.": {"ar": "أوزان تمارين منزلية وملابس رياضية وأجهزة تتبع لياقة بنظام GPS.", "fr": "Poids pour l’entraînement à domicile, vêtements de sport et trackers GPS.", "de": "Gewichte fürs Heimtraining, Sportbekleidung und GPS-Fitnesstracker."}, "Interior Gear": {"ar": "مستلزمات داخلية", "fr": "Équipement intérieur", "de": "Innenraumzubehör"}, "Jewelry & Accessories": {"ar": "مجوهرات وإكسسوارات", "fr": "Bijoux et accessoires", "de": "Schmuck & Accessoires"}, "Kids & Toys": {"ar": "الأطفال والألعاب", "fr": "Enfants et jouets", "de": "Kinder & Spielzeug"}, "Kitchen Appliances": {"ar": "أجهزة المطبخ", "fr": "Électroménager de cuisine", "de": "Küchengeräte"}, "Kitchen appliances, lighting & smart home.": {"ar": "أجهزة المطبخ والإضاءة والمنزل الذكي.", "fr": "Électroménager, éclairage et maison connectée.", "de": "Küchengeräte, Beleuchtung & Smart Home."}, "Laptops": {"ar": "لابتوبات", "fr": "Ordinateurs portables", "de": "Laptops"}, "Laptops, PCs, monitors & smart devices.": {"ar": "لابتوبات وحواسيب وشاشات وأجهزة ذكية.", "fr": "Ordinateurs portables, PC, écrans et appareils connectés.", "de": "Laptops, PCs, Monitore & Smart-Geräte."}, "Laptops, desktop & gaming PCs, monitors, smartphones, and PC accessories.": {"ar": "لابتوبات وحواسيب مكتبية وللألعاب وشاشات وهواتف ذكية وإكسسوارات.", "fr": "Portables, PC de bureau et gamer, écrans, smartphones et accessoires PC.", "de": "Laptops, Desktop- & Gaming-PCs, Monitore, Smartphones und PC-Zubehör."}, "Lighting & Decor": {"ar": "الإضاءة والديكور", "fr": "Éclairage et décoration", "de": "Beleuchtung & Deko"}, "Monitors": {"ar": "شاشات", "fr": "Écrans", "de": "Monitore"}, "Notebooks": {"ar": "دفاتر", "fr": "Carnets", "de": "Notizbücher"}, "Novels": {"ar": "روايات", "fr": "Romans", "de": "Romane"}, "PC Accessories": {"ar": "إكسسوارات الكمبيوتر", "fr": "Accessoires PC", "de": "PC-Zubehör"}, "Perfumes": {"ar": "عطور", "fr": "Parfums", "de": "Parfums"}, "STEM educational building blocks, family games, and baby care essentials.": {"ar": "مكعبات بناء تعليمية STEM وألعاب عائلية ومستلزمات العناية بالأطفال.", "fr": "Jeux de construction éducatifs STEM, jeux de famille et essentiels pour bébé.", "de": "STEM-Lernbausteine, Familienspiele und Babypflege-Essentials."}, "Skincare": {"ar": "العناية بالبشرة", "fr": "Soins de la peau", "de": "Hautpflege"}, "Skincare essentials, signature perfumes, and personal grooming care.": {"ar": "أساسيات العناية بالبشرة وعطور مميزة ومنتجات العناية الشخصية.", "fr": "Soins de la peau essentiels, parfums signature et soins personnels.", "de": "Hautpflege-Basics, Signature-Parfums und Körperpflege."}, "Skincare, perfumes & grooming tools.": {"ar": "العناية بالبشرة وعطور وأدوات العناية الشخصية.", "fr": "Soins de la peau, parfums et accessoires de soin.", "de": "Hautpflege, Parfums & Pflegeprodukte."}, "Smart Devices": {"ar": "أجهزة ذكية", "fr": "Appareils connectés", "de": "Smart-Geräte"}, "Smart Home": {"ar": "المنزل الذكي", "fr": "Maison connectée", "de": "Smart Home"}, "Smart Trackers": {"ar": "أجهزة تتبع ذكية", "fr": "Trackers connectés", "de": "Smarte Tracker"}, "Sports": {"ar": "رياضة", "fr": "Sport", "de": "Sport"}, "Sportswear": {"ar": "ملابس رياضية", "fr": "Vêtements de sport", "de": "Sportbekleidung"}, "Tech & Business": {"ar": "تقنية وأعمال", "fr": "Tech et business", "de": "Technik & Business"}, "Tech & business guides, bestselling novels, and study notebooks.": {"ar": "أدلة تقنية وأعمال وروايات الأكثر مبيعًا ودفاتر دراسة.", "fr": "Guides tech et business, romans à succès et carnets d’étude.", "de": "Technik- & Business-Ratgeber, Bestseller-Romane und Notizbücher."}, "Tech, business, novels & notebooks.": {"ar": "كتب تقنية وأعمال وروايات ودفاتر.", "fr": "Technologie, business, romans et carnets.", "de": "Technik, Business, Romane & Notizbücher."}};
    var cache = {}, watched = {}, pending = {}, failed = {}, timer = null;
    try { cache = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { cache = {}; }
    function norm(s) { return String(s == null ? '' : s).replace(/\s+/g, ' ').trim(); }
    function save() { try { localStorage.setItem(KEY, JSON.stringify(cache)); } catch (e) { } }
    function get(text, L) {
        var k = norm(text); if (!k || L === 'en') return null;
        if (SEED[k] && SEED[k][L]) return SEED[k][L];
        return (cache[L] && cache[L][k]) || null;
    }
    function fetchOne(k, L) {
        var url = 'https://api.mymemory.translated.net/get?q=' + encodeURIComponent(k) + '&langpair=en|' + L;
        return fetch(url).then(function (r) { return r.json(); }).then(function (j) {
            var t = j && j.responseData && j.responseData.translatedText;
            if (t && j.responseStatus == 200 && norm(t).toLowerCase() !== k.toLowerCase() && !/MYMEMORY|QUERY LENGTH|INVALID/i.test(t)) {
                (cache[L] = cache[L] || {})[k] = norm(t); return true;
            }
            return false;
        }).catch(function () { return false; });
    }
    function run() {
        timer = null; var jobs = [];
        Object.keys(pending).forEach(function (id) { var p = pending[id]; delete pending[id]; jobs.push(p); });
        if (!jobs.length) return;
        var i = 0, changed = false;
        (function next() {
            if (i >= jobs.length) { if (changed) { save(); document.dispatchEvent(new CustomEvent('boda:autotr')); } return; }
            var j = jobs[i++];
            fetchOne(j.k, j.L).then(function (ok) { if (ok) changed = true; else failed[j.L + '|' + j.k] = 1; setTimeout(next, 120); });
        })();
    }
    /* texts = English strings (category / sub-category names ...) that should be translated automatically */
    function watch(texts) { (texts || []).forEach(function (s) { var k = norm(s); if (k && /[A-Za-z]/.test(k)) watched[k] = 1; }); }
    function ensure(L) {
        if (!L || L === 'en') return;
        Object.keys(watched).forEach(function (k) {
            if (get(k, L)) return;
            var id = L + '|' + k; if (failed[id]) return;
            pending[id] = { k: k, L: L };
        });
        if (Object.keys(pending).length && !timer) timer = setTimeout(run, 250);
    }
    window.BodaAuto = { get: get, watch: watch, ensure: ensure };
})();
