const express = require('express');
const membersController = require('../controllers/members.controller');
const employeesController = require('../controllers/employees.controller');
const operationsController = require('../controllers/operations.controller');
const staffAttendanceController = require('../controllers/staffAttendance.controller');
const { requireAuth, requirePasswordChanged, requireRole } = require('../middleware/auth');
const rateLimit = require('../utils/rateLimit');

const router = express.Router();
router.use(requireAuth, requirePasswordChanged);

router.get('/members', membersController.list);
router.post('/members', membersController.create);
router.get('/members/:id', membersController.get);
router.post(
  '/members/:id/profile-photo',
  rateLimit({ limit: 30, windowMs: 15 * 60 * 1000, key: (req) => String(req.user.empId) }),
  membersController.parseProfilePhotoUpload,
  membersController.uploadProfilePhoto
);
router.post('/members/:id/renewals', membersController.renew);
router.patch('/members/:id/pin', membersController.resetPin);
router.post('/members/:id/weights', membersController.addWeight);

router.post(
  '/check-ins',
  rateLimit({ limit: 10, windowMs: 60 * 1000 }),
  membersController.checkIn
);
router.post('/walk-ins', membersController.walkIn);

router.get('/employees', requireRole('admin'), employeesController.list);
router.get('/staff-attendance', requireRole('admin'), staffAttendanceController.list);
router.post('/employees', requireRole('admin'), employeesController.create);
router.patch('/employees/:id', requireRole('admin'), employeesController.update);
router.patch('/employees/:id/password', requireRole('admin'), employeesController.resetPassword);

router.get('/transactions', requireRole('admin'), operationsController.transactions);
router.get('/activity', requireRole('admin', 'employee'), operationsController.activity);
router.get('/dashboard', operationsController.dashboard);
router.get('/reports', requireRole('admin'), operationsController.report);
router.get('/pricing', operationsController.pricing);
router.put('/pricing', requireRole('admin'), operationsController.updatePricing);

module.exports = router;
