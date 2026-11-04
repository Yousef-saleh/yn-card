// قناة يوسف نت (update_v56): الإشعار يوصل بدون محتوى، فنسأل السيرفر وش نعرض (تذكير الكرت أو آخر خبر)، والضغط يفتح القناة
const SUPABASE_URL = 'https://aknkwzcgaenbmekmzwwj.supabase.co';
const ANON_KEY = 'sb_publishable_TGWs81AlDWEOKyJC_g5uAA_Z49QGMhQ';

self.addEventListener('push', (event) => {
  event.waitUntil((async () => {
    let title = 'قناة يوسف نت', body = 'فيه خبر جديد', tag = 'yn-news', url = 'news.html';
    try {
      const h = { 'apikey': ANON_KEY, 'Authorization': 'Bearer ' + ANON_KEY, 'Content-Type': 'application/json' };
      // تذكير "كرتك قرّب يخلص" لهالجهاز لو فيه، وإلا آخر خبر يشوفه (أبراج معيّنة)
      const sub = await self.registration.pushManager.getSubscription();
      let p = null;
      if (sub) {
        const r = await fetch(SUPABASE_URL + '/rest/v1/rpc/news_push_body', { method: 'POST', headers: h, body: JSON.stringify({ p_endpoint: sub.endpoint }) });
        if (r.ok) p = await r.json();
      }
      if (!p) {
        const r = await fetch(SUPABASE_URL + '/rest/v1/rpc/news_feed', { method: 'POST', headers: h, body: JSON.stringify({ p_device: null, p_limit: 1 }) });
        p = (await r.json())[0];
        if (p) p.tag = 'yn-news-' + p.id;
      }
      if (p) {
        title = p.title;
        body = p.free_left > 0 ? '🎁 ' + p.free_left + ' كرت مجاني · ' + (p.body || '') : (p.body || '');
        tag = p.tag || tag;
        url = p.url || url;
      }
    } catch (e) {}
    await self.registration.showNotification(title, { body: body.slice(0, 180), tag, lang: 'ar', dir: 'rtl', data: { url } });
  })());
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil((async () => {
    const all = await clients.matchAll({ type: 'window', includeUncontrolled: true });
    const url = new URL((event.notification.data && event.notification.data.url) || 'news.html', self.registration.scope).href;
    for (const c of all) { if (c.url.includes('news.html')) { try { if (c.navigate) await c.navigate(url); } catch (e) {} return c.focus(); } }
    return clients.openWindow(url);
  })());
});
