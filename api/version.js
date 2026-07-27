// Tiny build-identity endpoint so the live site can show which deploy is actually running —
// Vercel injects these VERCEL_GIT_* vars into every serverless function automatically, no setup
// needed. Zero dependencies, matching the rest of this project's static/no-build philosophy.
module.exports = (req, res) => {
  const sha = process.env.VERCEL_GIT_COMMIT_SHA || null;
  const info = {
    sha: sha ? sha.slice(0, 7) : null,
    message: process.env.VERCEL_GIT_COMMIT_MESSAGE ? process.env.VERCEL_GIT_COMMIT_MESSAGE.split('\n')[0].slice(0, 120) : null,
    env: process.env.VERCEL_ENV || 'development',
  };
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).send(JSON.stringify(info));
};
