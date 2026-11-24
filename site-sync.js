/* Publishes the admin panel to the public site.
   The storefront reads data/live.json (this repo). The admin writes that file
   with a GitHub token kept only in this browser. */
(function () {
    'use strict';
    var REPO = 'abdullahosama-coder/boda-store';
    var FILE = 'data/live.json';
    var TOKEN_KEY = 'boda_github_token';
    var STAMP = 'boda_sync_at';
    var KEYS = ['boda_admin_products', 'boda_categories', 'boda_docs', 'boda_site', 'boda_hero', 'boda_pages', 'boda_shipping_settings', 'boda_offers', 'boda_ads', 'boda_coupons', 'boda_govs', 'boda_seo_pages', 'boda_search_engines', 'boda_search_keywords', 'boda_news', 'boda_gateways', 'boda_notifs'];
    var admin = !!window.BODA_ADMIN;
    var timer = 0, chain = Promise.resolve(), lastSent = '';

    function rawUrl() {
        return 'https://raw.githubusercontent.com/' + REPO + '/main/' + FILE + '?t=' + Date.now();
    }
    function readSnap() {
        var keys = {};
        KEYS.forEach(function (k) { keys[k] = localStorage.getItem(k); });
        return { updated: +(localStorage.getItem(STAMP) || 0), keys: keys };
    }
    function applySnap(data) {
        if (!data || !data.keys || !(data.updated > 0)) return false;
        var local = +(localStorage.getItem(STAMP) || 0);
        if (data.updated <= local) return false;
        KEYS.forEach(function (k) {
            if (!Object.prototype.hasOwnProperty.call(data.keys, k)) return;
            var v = data.keys[k];
            if (k === 'boda_notifs' && v) {
                var mine = [], incoming = [];
                try { mine = JSON.parse(localStorage.getItem(k) || '[]'); } catch (e) { }
                try { incoming = JSON.parse(v) || []; } catch (e) { }
                var seen = {}, merged = [];
                incoming.concat(mine).forEach(function (n) {
                    if (!n || seen[n.time]) return;
                    seen[n.time] = 1; merged.push(n);
                });
                localStorage.setItem(k, JSON.stringify(merged.slice(0, 50)));
                return;
            }
            if (v == null) localStorage.removeItem(k);
            else localStorage.setItem(k, v);
        });
        localStorage.setItem(STAMP, String(data.updated));
        return true;
    }
    function pull() {
        return fetch('https://api.github.com/repos/' + REPO + '/contents/' + FILE + '?ref=main&t=' + Date.now(), {
            cache: 'no-store',
            headers: { Accept: 'application/vnd.github.raw' }
        }).then(function (r) {
            if (!r.ok) throw new Error('missing');
            return r.json();
        }).catch(function () {
            return fetch(rawUrl(), { cache: 'no-store' }).then(function (r) {
                if (!r.ok) return null;
                return r.json();
            }).catch(function () { return null; });
        });
    }
    function b64(str) {
        return btoa(unescape(encodeURIComponent(str)));
    }
    function push() {
        var token = '';
        try { token = (localStorage.getItem(TOKEN_KEY) || '').trim(); } catch (e) { }
        if (token) { try { localStorage.setItem(TOKEN_KEY, token); } catch (e) { } }
        if (!token) {
            document.dispatchEvent(new CustomEvent('boda:need-token'));
            return Promise.resolve(false);
        }
        var body = JSON.stringify(readSnap());
        if (body === lastSent) return Promise.resolve(true);
        var headers = { Authorization: 'Bearer ' + token, Accept: 'application/vnd.github+json' };
        return fetch('https://api.github.com/repos/' + REPO + '/contents/' + FILE + '?ref=main', { headers: headers }).then(function (r) {
            if (r.status === 404) return { sha: '' };
            if (!r.ok) throw new Error(r.status === 401 ? 'المفتاح غلط أو منتهٍ' : 'GitHub ' + r.status);
            return r.json();
        }).then(function (cur) {
            return fetch('https://api.github.com/repos/' + REPO + '/contents/' + FILE, {
                method: 'PUT',
                headers: headers,
                body: JSON.stringify({
                    message: 'Publish store updates from the admin panel',
                    content: b64(body),
                    sha: cur && cur.sha ? cur.sha : undefined,
                    branch: 'main'
                })
            });
        }).then(function (r) {
            if (!r.ok) throw new Error(r.status === 401 ? 'المفتاح غلط أو منتهٍ' : 'النشر فشل (' + r.status + ')');
            lastSent = body;
            return true;
        });
    }
    function schedule() {
        clearTimeout(timer);
        timer = setTimeout(function () {
            chain = chain.then(push).catch(function () { });
        }, 700);
    }

    if (admin) {
        var origSet = localStorage.setItem.bind(localStorage);
        var origDel = localStorage.removeItem.bind(localStorage);
        localStorage.setItem = function (k, v) {
            origSet(k, v);
            if (KEYS.indexOf(k) < 0) return;
            origSet(STAMP, String(Date.now()));
            schedule();
        };
        localStorage.removeItem = function (k) {
            origDel(k);
            if (KEYS.indexOf(k) < 0) return;
            origSet(STAMP, String(Date.now()));
            schedule();
        };
        window.BodaSync = { push: function () { return push(); }, schedule: schedule };
        window.BODA_SYNC_READY = Promise.resolve();
        return;
    }

    window.BODA_SYNC_READY = pull().then(function (data) { applySnap(data); }).catch(function () { });
    setInterval(function () {
        pull().then(function (data) { if (applySnap(data)) location.reload(); }).catch(function () { });
    }, 8000);
})();
