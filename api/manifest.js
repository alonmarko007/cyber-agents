// Per-class PWA manifest, generated on the fly.
//
// A static manifest.webmanifest can only ever declare one fixed start_url, so every
// "Add to Home Screen" from any student class link (?class=CODE) installed the exact same
// app identity — the saved icon always relaunched at "/", forgetting which class the link
// was for. This endpoint returns a manifest whose start_url bakes the class code (and name)
// back in, so the installed icon reopens directly into that specific class every time —
// on both Android (Chrome honors manifest start_url for installed PWAs) and iOS 16.4+
// Safari (same manifest handling for "Add to Home Screen").
//
// Requires no dependencies — plain Node.js, matching this project's zero-build-step, static
// Vercel deployment. Vercel auto-detects any file under /api as a serverless function.
module.exports = (req, res) => {
  const query = req.query || {};
  const rawCode = typeof query.class === 'string' ? query.class : '';
  const rawName = typeof query.cn === 'string' ? query.cn : '';
  const code = rawCode.trim().slice(0, 12);
  const name = rawName.trim().slice(0, 60);

  const startUrl = code
    ? `/?class=${encodeURIComponent(code)}${name ? `&cn=${encodeURIComponent(name)}` : ''}`
    : '/';

  const manifest = {
    name: code ? `סוכני הסייבר — ${name || code}` : 'סוכני הסייבר — משחק בטיחות ברשת',
    short_name: name ? name.slice(0, 20) : 'סוכני הסייבר',
    description: 'משחק חינוכי ללימוד בטיחות ברשת לילדים ובני נוער.',
    lang: 'he',
    dir: 'rtl',
    start_url: startUrl,
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#070b18',
    theme_color: '#070b18',
    categories: ['education', 'games', 'kids'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
    ]
  };

  res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.status(200).send(JSON.stringify(manifest));
};
