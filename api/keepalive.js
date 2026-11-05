// Daily keep-alive for the classroom database.
//
// Supabase's free tier pauses a project after about a week with no database activity — and
// once paused, every class link, the teacher area and the parents' results page all fail
// until someone restores it by hand. A Vercel cron (see vercel.json) calls this once a day;
// it runs one harmless read-only lookup through the same public RPC the game itself uses,
// which is enough database activity to keep the project awake.
//
// Zero dependencies, like the rest of /api. The key below is the same publishable key that
// already ships in index.html, so nothing secret lives here.
const SB_URL = 'https://kqdnvdwznyxgaxzjytjl.supabase.co';
const SB_KEY = 'sb_publishable_FU3z8in7ZztjPvInBeG8Sg_nKOuwPjV';

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  try {
    const r = await fetch(`${SB_URL}/rest/v1/rpc/find_class_by_code`, {
      method: 'POST',
      headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_code: '000000' }),
      signal: AbortSignal.timeout(15000),
    });
    // Report a failing database as a failing request, so it shows up in Vercel's cron logs.
    res.status(r.ok ? 200 : 502).send(JSON.stringify({ ok: r.ok, db: r.status, at: new Date().toISOString() }));
  } catch (e) {
    res.status(502).send(JSON.stringify({ ok: false, error: String(e && e.message || e) }));
  }
};
