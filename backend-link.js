/* Shared link between the storefront, the admin panel, and the FastAPI backend.
   The API address can be overridden with localStorage "boda_api_base" or ?api=
   If the server is down, BODA_API_ON stays false and the site keeps its local data. */
(function () {
    'use strict';
    var q = '';
    try { q = new URLSearchParams(location.search).get('api') || ''; } catch (e) { }
    var saved = '';
    try { saved = localStorage.getItem('boda_api_base') || ''; } catch (e) { }
    var base = String(q || saved || 'http://127.0.0.1:8000').replace(/\/$/, '');
    window.BODA_API_BASE = base;
    window.BODA_API_ON = false;

    window.bodaApi = function (path, opt) {
        opt = opt || {};
        var headers = {}, token = '';
        try { token = sessionStorage.getItem('boda_token') || ''; } catch (e) { }
        var body = opt.body;
        if (token) headers.Authorization = 'Bearer ' + token;
        if (opt.json !== undefined) {
            headers['Content-Type'] = 'application/json';
            body = JSON.stringify(opt.json);
        }
        return fetch(base + path, { method: opt.method || 'GET', headers: headers, body: body }).then(function (r) {
            return r.json().catch(function () { return {}; }).then(function (data) {
                if (!r.ok) {
                    var detail = data && data.detail;
                    throw new Error(typeof detail === 'string' ? detail : 'REQUEST');
                }
                return data;
            });
        }).catch(function (err) {
            if (err && err.message && err.message !== 'Failed to fetch') throw err;
            throw new Error('NETWORK');
        });
    };

    window.BODA_API_READY = fetch(base + '/api/health', { cache: 'no-store' }).then(function (r) {
        window.BODA_API_ON = !!r.ok;
    }).catch(function () {
        window.BODA_API_ON = false;
    });
})();
