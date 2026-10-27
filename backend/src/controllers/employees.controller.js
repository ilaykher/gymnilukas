const employeesModel = require('../models/employees.model');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');
const { requiredString, validEmail, validPhone } = require('../utils/validation');

const ROLES = ['Front-Desk', 'Manager', 'Trainer'];
const isStrongPassword = (password) =>
  typeof password === 'string' &&
  password.length >= 8 &&
  /[A-Z]/.test(password) &&
  /[a-z]/.test(password) &&
  /\d/.test(password) &&
  /[^A-Za-z0-9\s]/.test(password);
const isValidUsername = (username) =>
  /^[a-zA-Z0-9._-]{3,80}$/.test(username) || validEmail(username);

const parseEmployee = (body, { passwordRequired }) => {
  const name = requiredString(body.name, 'Name', 120);
  const email = requiredString(body.email, 'Email', 254).toLowerCase();
  const username = requiredString(body.username, 'Username', 254).toLowerCase();
  const phone = requiredString(body.phone, 'Phone number', 11);
  const jobTitle = requiredString(body.jobTitle, 'Role', 50);
  if (!validEmail(email)) throw new ApiError(400, 'Enter a valid email address.');
  if (!isValidUsername(username)) {
    throw new ApiError(400, 'Username must be 3–80 letters, numbers, periods, underscores, or hyphens, or a valid email address.');
  }
  if (!validPhone(phone)) throw new ApiError(400, 'Phone number must start with 09 and contain 11 digits.');
  if (!ROLES.includes(jobTitle)) throw new ApiError(400, 'Select a valid employee role.');
  if (typeof body.isActive !== 'boolean') throw new ApiError(400, 'Account status is required.');
  if (passwordRequired && !isStrongPassword(body.password)) {
    throw new ApiError(400, 'Password must meet all listed requirements.');
  }
  return { name, email, username, phone, jobTitle, isActive: body.isActive, password: body.password };
};

const parseId = (value) => {
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id < 1) throw new ApiError(400, 'Employee ID must be a positive integer.');
  return id;
};

const list = asyncHandler(async (req, res) => {
  const employees = await employeesModel.listEmployees();
  res.json({ success: true, count: employees.length, data: employees });
});

const create = asyncHandler(async (req, res) => {
  const employee = parseEmployee(req.body, { passwordRequired: true });
  const created = await employeesModel.createEmployee({
    ...employee,
    actorId: req.user.empId,
  });
  res.status(201).json({ success: true, data: created });
});

const update = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const body = req.body;
  const name = requiredString(body.name, 'Name', 120);
  const email = requiredString(body.email, 'Email', 254).toLowerCase();
  const username = requiredString(body.username, 'Username', 254).toLowerCase();
  const jobTitle = requiredString(body.jobTitle, 'Role', 50);
  if (!validEmail(email)) throw new ApiError(400, 'Enter a valid email address.');
  if (!isValidUsername(username)) {
    throw new ApiError(400, 'Username must be 3–80 letters, numbers, periods, underscores, or hyphens, or a valid email address.');
  }
  if (!ROLES.includes(jobTitle)) throw new ApiError(400, 'Select a valid employee role.');
  if (typeof body.isActive !== 'boolean') throw new ApiError(400, 'Account status is required.');
  const employee = await employeesModel.updateEmployee(id, { name, email, username, jobTitle, isActive: body.isActive }, req.user.empId);
  if (!employee) throw new ApiError(404, 'Employee not found.');
  res.json({ success: true, data: employee });
});

const resetPassword = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  if (!isStrongPassword(req.body.password)) {
    throw new ApiError(400, 'Password must meet all listed requirements.');
  }
  if (typeof req.body.requireChange !== 'boolean') {
    throw new ApiError(400, 'Password change requirement must be specified.');
  }
  if (!await employeesModel.resetEmployeePassword(id, req.body.password, req.body.requireChange, req.user.empId)) {
    throw new ApiError(404, 'Employee login account not found.');
  }
  res.json({ success: true, message: 'Employee password updated.' });
});

module.exports = { list, create, update, resetPassword };
