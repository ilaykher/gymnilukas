const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authModel = require('../models/auth.model');
const staffAttendanceModel = require('../models/staffAttendance.model');
const ApiError = require('../utils/apiError');
const { getJwtSecret } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

const login = asyncHandler(async (req, res) => {
  const username = typeof req.body.username === 'string' ? req.body.username.trim() : '';
  const password = typeof req.body.password === 'string' ? req.body.password : '';
  if (!username || !password || username.length > 120 || password.length > 256) {
    throw new ApiError(400, 'Enter a valid username and password.');
  }

  const account = await authModel.findAccount(username);
  const passwordIsHash = account?.auth_password?.startsWith('$2');
  const passwordMatches = passwordIsHash && await bcrypt.compare(password, account.auth_password);
  if (!passwordMatches || account.status !== 'active') {
    throw new ApiError(401, 'Invalid username or password.');
  }

  const jwtSecret = getJwtSecret();
  if (account.role === 'employee') {
    await staffAttendanceModel.recordLogin(account.emp_id);
  }

  const expiresIn = process.env.JWT_EXPIRES_IN || '8h';
  const token = jwt.sign(
    {
      empId: account.emp_id,
      role: account.role,
      name: account.emp_name,
      username: account.auth_username,
      mustChangePassword: account.auth_must_change_password,
    },
    jwtSecret,
    { expiresIn }
  );
  res.json({
    success: true,
    data: {
      token,
      user: {
        empId: account.emp_id,
        name: account.emp_name,
        email: account.emp_email,
        username: account.auth_username,
        role: account.role,
        mustChangePassword: account.auth_must_change_password,
      },
    },
  });
});

const logout = asyncHandler(async (req, res) => {
  if (req.user.role === 'employee') {
    await staffAttendanceModel.recordLogout(req.user.empId);
  }
  res.json({ success: true });
});

const me = asyncHandler(async (req, res) => {
  const user = await authModel.getAccountByEmployeeId(req.user.empId);
  if (!user || user.status !== 'active') {
    throw new ApiError(401, 'Your account is no longer active.');
  }
  res.json({
    success: true,
    data: {
      user: {
        empId: user.emp_id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        mustChangePassword: user.must_change_password,
      },
    },
  });
});

const verifyPassword = asyncHandler(async (req, res) => {
  if (typeof req.body.password !== 'string' || req.body.password.length > 256) {
    throw new ApiError(400, 'Enter your current password.');
  }
  const account = await authModel.getAccountWithPassword(req.user.empId);
  const matches = account?.status === 'active' &&
    account.auth_password?.startsWith('$2') &&
    await bcrypt.compare(req.body.password, account.auth_password);
  if (!matches) throw new ApiError(401, 'The password is incorrect.');
  res.json({ success: true });
});

const changePassword = asyncHandler(async (req, res) => {
  const currentPassword = req.body.currentPassword;
  const newPassword = req.body.newPassword;
  const strongPassword =
    typeof newPassword === 'string' &&
    newPassword.length >= 8 &&
    /[A-Z]/.test(newPassword) &&
    /[a-z]/.test(newPassword) &&
    /\d/.test(newPassword) &&
    /[^A-Za-z0-9\s]/.test(newPassword);
  if (typeof currentPassword !== 'string' || currentPassword.length > 256 || !strongPassword) {
    throw new ApiError(400, 'Enter your current password and a new password meeting all requirements.');
  }
  const account = await authModel.getAccountWithPassword(req.user.empId);
  if (!account || account.status !== 'active' || !account.auth_password?.startsWith('$2') ||
      !(await bcrypt.compare(currentPassword, account.auth_password))) {
    throw new ApiError(401, 'Current password is incorrect.');
  }
  if (currentPassword === newPassword) {
    throw new ApiError(400, 'Choose a new password different from your current password.');
  }

  await authModel.updatePassword(req.user.empId, await bcrypt.hash(newPassword, 12));
  const token = jwt.sign(
    { empId: req.user.empId, role: account.role, name: account.name, username: account.username, mustChangePassword: false },
    getJwtSecret(),
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );
  res.json({
    success: true,
    data: {
      token,
      user: { empId: req.user.empId, name: account.name, email: account.email, username: account.username, role: account.role, mustChangePassword: false },
    },
  });
});

module.exports = { login, logout, me, verifyPassword, changePassword };
