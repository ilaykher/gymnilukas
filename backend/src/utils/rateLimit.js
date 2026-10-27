module.exports = function rateLimit({ limit, windowMs, key }) {
  const attempts = new Map();

  return (req, res, next) => {
    const now = Date.now();
    for (const [entry, state] of attempts) {
      if (state.resetAt <= now) attempts.delete(entry);
    }

    const identity = key ? key(req) : req.ip;
    const state = attempts.get(identity);
    if (state && state.count >= limit) {
      return res.status(429).json({ success: false, message: 'Too many attempts. Please try again later.' });
    }

    if (!state || state.resetAt <= now) {
      attempts.set(identity, { count: 1, resetAt: now + windowMs });
    } else {
      state.count += 1;
    }
    return next();
  };
};
