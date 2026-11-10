/* Generated with versioned URLs by build_pages.py. Scope stays inside this product. */
'use strict';
const CONFIG = {"version":"95cd86d8907066e6","pages":["sky-airflow/","app-connect/","carpet-style-airflow/","7-speed-fan/","dehumidification-mode/","wide-range-airflow/","filter-installation/","filter-removal/"],"assets":["brand-logo.png","assets/training-player.css","player.js?v=95cd86d8907066e6","sky-airflow/preview-sky-airflow.jpg","app-connect/preview-app-connect.jpg","carpet-style-airflow/preview-carpet-style-airflow.jpg","7-speed-fan/preview.jpg","dehumidification-mode/preview-dehumidification-mode.jpg","wide-range-airflow/preview-wide-range-airflow.jpg","filter-installation/preview-filter-installation.jpg","filter-removal/preview-filter-removal.jpg"],"videos":[{"url":"sky-airflow/skyairflow.mp4?v=ae165546e297276d","bytes":2545595,"hash":"ae165546e297276d541ea69ff9e66d98af53cf5d","algorithm":"git-sha1"},{"url":"app-connect/appconnec.mp4?v=d8068bffd7c6785f","bytes":5974982,"hash":"d8068bffd7c6785f8dbae1653e8477da8a20b3e8","algorithm":"git-sha1"},{"url":"carpet-style-airflow/Carpet.mp4?v=a3cb1f0473b33469","bytes":1990776,"hash":"a3cb1f0473b33469fc9ae694a5555c19037d50db","algorithm":"git-sha1"},{"url":"7-speed-fan/7speed1.mp4?v=8c26fbdef50eede8","bytes":1854936,"hash":"8c26fbdef50eede8e670c70dd5f247f2da5a2f71","algorithm":"git-sha1"},{"url":"dehumidification-mode/dehumuid.mp4?v=0b9c2a93cd31e98c","bytes":1266059,"hash":"0b9c2a93cd31e98ceeff92629f8090cd35ea8cca","algorithm":"git-sha1"},{"url":"wide-range-airflow/widerange.mp4?v=89bbc013dfb6858e","bytes":4542717,"hash":"89bbc013dfb6858ee73db07568956e5d1c37ce53","algorithm":"git-sha1"},{"url":"filter-installation/filter-installation.mp4?v=2eb16fd1400fbb54","bytes":4176092,"hash":"2eb16fd1400fbb541feb62c088647ae0627c3eb3","algorithm":"git-sha1"},{"url":"filter-removal/filter-removal.mp4?v=b1af0704e4fc357b","bytes":3349873,"hash":"b1af0704e4fc357b9cb06b380afd005e3d9d14b7","algorithm":"git-sha1"}]};
const ROOT = self.registration.scope;
const PREFIX = 'tcl-cassette-';
const STATIC_CACHE = PREFIX + 'pages-' + CONFIG.version;
const MEDIA_CACHE = PREFIX + 'videos-v1';
const MAX_FILES = 4;
const MAX_BYTES = 24 * 1024 * 1024;
const videos = new Map(CONFIG.videos.map(item => [new URL(item.url, ROOT).href, item]));
const pages = new Set(CONFIG.pages.map(path => new URL(path, ROOT).href));
const assets = new Set(CONFIG.assets.map(path => new URL(path, ROOT).href));
const storing = new Map();
let mediaWrites = Promise.resolve();
let warmJob;

function pageKey(url) {
  const key = new URL(url);
  key.search = '';
  key.hash = '';
  if (key.pathname.endsWith('/index.html')) {
    key.pathname = key.pathname.slice(0, -10);
  }
  return pages.has(key.href) ? key.href : null;
}

async function storeMedia(url, response) {
  const item = videos.get(url);
  if (!item || response.status !== 200) return false;
  const body = await response.blob();
  if (body.size !== item.bytes || body.size > MAX_BYTES) return false;
  let data = await body.arrayBuffer();
  let algorithm = 'SHA-256';
  if (item.algorithm === 'git-sha1') {
    const header = new TextEncoder().encode('blob ' + body.size + '\0');
    const framed = new Uint8Array(header.length + body.size);
    framed.set(header);
    framed.set(new Uint8Array(data), header.length);
    data = framed;
    algorithm = 'SHA-1';
  }
  const digest = await crypto.subtle.digest(algorithm, data);
  const hash = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
  if (hash !== item.hash) return false;
  const headers = new Headers(response.headers);
  headers.delete('Content-Encoding');
  headers.delete('Content-Range');
  headers.set('Content-Length', String(body.size));
  headers.set('Content-Type', 'video/mp4');
  headers.set('Accept-Ranges', 'bytes');
  const write = mediaWrites.then(async function () {
    const cache = await caches.open(MEDIA_CACHE);
    await cache.put(url, new Response(body, { status: 200, headers }));
    let keys = await cache.keys();
    let size = keys.reduce((total, key) => total + (videos.get(key.url)?.bytes || 0), 0);
    while (keys.length > MAX_FILES || size > MAX_BYTES) {
      const oldest = keys.shift();
      await cache.delete(oldest);
      size -= videos.get(oldest.url)?.bytes || 0;
    }
    return true;
  });
  mediaWrites = write.catch(function () {});
  return write;
}

async function cachedVideoResponse(request, cached) {
  const range = request.headers.get('Range');
  if (!range) return cached;
  const ifRange = request.headers.get('If-Range');
  if (ifRange) {
    const etag = cached.headers.get('ETag');
    const modified = cached.headers.get('Last-Modified');
    const dateMatches = Number.isFinite(Date.parse(ifRange)) &&
      Number.isFinite(Date.parse(modified)) && Date.parse(ifRange) >= Date.parse(modified);
    if (ifRange !== etag && !dateMatches) return cached;
  }
  // Multiple or unknown ranges may be ignored, returning the complete 200 response.
  if (range.includes(',') || !range.startsWith('bytes=')) return cached;
  const body = await cached.blob();
  const size = body.size;
  const match = /^bytes=(\d*)-(\d*)$/.exec(range);
  let start;
  let end;
  if (match && (match[1] || match[2])) {
    if (!match[1]) {
      const suffix = Number(match[2]);
      start = Math.max(0, size - suffix);
      end = suffix > 0 ? size - 1 : -1;
    } else {
      start = Number(match[1]);
      end = match[2] ? Math.min(Number(match[2]), size - 1) : size - 1;
    }
  }
  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) ||
      start < 0 || start >= size || end < start) {
    return new Response(null, { status: 416, headers: { 'Content-Range': 'bytes */' + size } });
  }
  const headers = new Headers(cached.headers);
  headers.set('Content-Range', 'bytes ' + start + '-' + end + '/' + size);
  headers.set('Content-Length', String(end - start + 1));
  return new Response(body.slice(start, end + 1), { status: 206, headers });
}

async function mediaResponse(event, url) {
  try {
    const cached = await (await caches.open(MEDIA_CACHE)).match(url);
    if (cached) return await cachedVideoResponse(event.request, cached);
  } catch (_) {
    // Storage failures must not prevent ordinary native playback.
  }
  const response = await fetch(event.request);
  if (response.status === 200) {
    const write = storeMedia(url, response.clone()).catch(function () { return false; });
    storing.set(url, write);
    event.waitUntil(write.finally(function () {
      if (storing.get(url) === write) storing.delete(url);
    }));
  }
  return response;
}

async function refreshStatic(key, request) {
  const response = await fetch(request || key);
  if (response.status === 200 && response.type !== 'opaque') {
    try {
      await (await caches.open(STATIC_CACHE)).put(key, response.clone());
    } catch (_) {}
  }
  return response;
}

async function staticResponse(event, key) {
  let cached;
  try { cached = await (await caches.open(STATIC_CACHE)).match(key); } catch (_) {}
  if (cached) {
    if (pages.has(key)) {
      event.waitUntil(refreshStatic(key, new Request(key, { cache: 'no-cache' })).catch(function () {}));
    }
    return cached;
  }
  return refreshStatic(key, event.request);
}

async function warmVideo(url, owner) {
  if (warmJob && warmJob.url === url) return warmJob.promise;
  if (warmJob) warmJob.controller.abort();
  const controller = new AbortController();
  const job = { url, owner, controller };
  job.promise = (async function () {
    const cache = await caches.open(MEDIA_CACHE);
    if (await cache.match(url)) return true;
    if (storing.has(url)) return storing.get(url);
    const response = await fetch(url, { signal: controller.signal, credentials: 'same-origin' });
    if (controller.signal.aborted) return false;
    return storeMedia(url, response);
  })().catch(function () { return false; }).finally(function () {
    if (warmJob === job) warmJob = null;
  });
  warmJob = job;
  return job.promise;
}

self.addEventListener('install', function (event) {
  event.waitUntil(self.skipWaiting());
});
self.addEventListener('activate', function (event) {
  event.waitUntil((async function () {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith(PREFIX + 'pages-') && key !== STATIC_CACHE)
      .map(key => caches.delete(key)));
    try {
      const cache = await caches.open(MEDIA_CACHE);
      const old = (await cache.keys()).filter(key => !videos.has(key.url));
      await Promise.all(old.map(key => cache.delete(key)));
    } catch (_) {}
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== new URL(ROOT).origin || !url.href.startsWith(ROOT)) return;
  if (videos.has(url.href)) {
    event.respondWith(mediaResponse(event, url.href));
    return;
  }
  const key = pageKey(url.href);
  if (key || assets.has(url.href)) event.respondWith(staticResponse(event, key || url.href));
});
self.addEventListener('message', function (event) {
  const data = event.data || {};
  const owner = event.source && event.source.id;
  const sourceURL = event.source && event.source.url;
  if (!sourceURL || !sourceURL.startsWith(ROOT)) return;
  if (data.type === 'CANCEL') {
    if (warmJob && warmJob.owner === owner) warmJob.controller.abort();
    return;
  }
  let url;
  try { url = new URL(data.url, ROOT).href; } catch (_) { return; }
  const port = event.ports && event.ports[0];
  if (data.type === 'WARM' && videos.has(url)) {
    event.waitUntil(warmVideo(url, owner).then(function (ok) {
      if (port) port.postMessage({ ok });
    }));
  }
  if (data.type === 'PAGE') {
    const key = pageKey(url) || (assets.has(url) ? url : null);
    if (key) {
      event.waitUntil((async function () {
        const cache = await caches.open(STATIC_CACHE);
        if (!(await cache.match(key))) await refreshStatic(key);
      })().catch(function () {}));
    }
  }
});
