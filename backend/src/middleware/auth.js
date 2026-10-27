const jwt = require('jsonwebtoken');
const pool = require('../config/db');

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET must contain at least 32 characters.');
  }
  return secret;
}

function createAuthMiddleware({ pool: databasePool = pool, getJwtSecret: secretProvider = getJwtSecret } = {}) {
  async function requireAuth(req, res, next) {
    const authorization = req.get('authorization') || '';
    const [scheme, token] = authorization.split(' ');

    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    try {
      const payload = jwt.verify(token, secretProvider());
      if (!Number.isInteger(payload.empId) || !['admin', 'employee'].includes(payload.role)) {
        return res.status(401).json({ success: false, message: 'Invalid authentication token.' });
      }
      const { rows } = await databasePool.query(
        `SELECT la.auth_role::text AS role,
                la.auth_username AS username,
                la.auth_must_change_password AS must_change_password,
                ea.emp_name AS name,
                ea.emp_status::text AS status
         FROM login_auth la
         JOIN emp_acc ea ON ea.emp_id = la.emp_id
         WHERE ea.emp_id = $1`,
        [payload.empId]
      );
      const account = rows[0];
      if (!account || account.status !== 'active') {
        return res.status(401).json({ success: false, message: 'Your account is no longer active.' });
      }
      req.user = {
        empId: payload.empId,
        role: account.role,
        name: account.name,
        username: account.username,
        mustChangePassword: account.must_change_password,
      };
      return next();
    } catch (error) {
      if (error.name !== 'JsonWebTokenError' && error.name !== 'TokenExpiredError') {
        return next(error);
      }
      return res.status(401).json({ success: false, message: 'Your session has expired. Please sign in again.' });
    }
  }

  function requirePasswordChanged(req, res, next) {
    if (req.user?.mustChangePassword) {
      return res.status(403).json({
        success: false,
        code: 'PASSWORD_CHANGE_REQUIRED',
        message: 'Change your password before continuing.',
      });
    }
    return next();
  }

  function requireRole(...roles) {
    return (req, res, next) => {
      if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({ success: false, message: 'You are not authorized to perform this action.' });
      }
      return next();
    };
  }

  return { requireAuth, requirePasswordChanged, requireRole };
}

const authMiddleware = createAuthMiddleware();

module.exports = { getJwtSecret, createAuthMiddleware, ...authMiddleware };