const bcrypt = require('bcrypt');
const membersModel = require('../models/members.model');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');
const {
  requiredString,
  validPhone,
  validPin,
  positiveAmount,
  paymentDetails,
} = require('../utils/validation');

const parseId = (value) => {
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id < 1) throw new ApiError(400, 'Member ID must be a positive integer.');
  return id;
};

const list = asyncHandler(async (req, res) => {
  const members = await membersModel.listMembers();
  res.json({ success: true, count: members.length, data: members });
});

const get = asyncHandler(async (req, res) => {
  const member = await membersModel.getMember(parseId(req.params.id));
  if (!member) throw new ApiError(404, 'Member not found.');
  res.json({ success: true, data: member });
});

const create = asyncHandler(async (req, res) => {
  const name = requiredString(req.body.fullName, 'Full name', 120);
  const username = requiredString(req.body.username, 'Username', 80);
  const phone = requiredString(req.body.contactNumber, 'Phone number', 11);
  const address = requiredString(req.body.address, 'Address', 500);
  const pin = req.body.pin;
  if (!/^[a-zA-Z0-9._-]{3,80}$/.test(username)) {
    throw new ApiError(400, 'Username must contain 3–80 letters, numbers, periods, underscores, or hyphens.');
  }
  if (!validPhone(phone)) throw new ApiError(400, 'Phone number must start with 09 and contain 11 digits.');
  if (!validPin(pin)) throw new ApiError(400, 'PIN must be exactly 4 digits.');
  if (!['regular', 'student'].includes(req.body.membershipType)) {
    throw new ApiError(400, 'Select a valid membership type.');
  }
  const payment = paymentDetails(req.body.paymentMethod, req.body.paymentReference);
  const weightKg = req.body.weight === '' || req.body.weight == null ? null : positiveAmount(req.body.weight, 'Weight');
  const member = await membersModel.createMember(
    { name, username, phone, address, pin, membershipType: req.body.membershipType, payment, weightKg },
    req.user.empId
  );
  res.status(201).json({ success: true, data: member });
});

const checkIn = asyncHandler(async (req, res) => {
  const username = requiredString(req.body.username, 'Username', 80);
  const pin = req.body.pin;
  if (!validPin(pin)) throw new ApiError(400, 'PIN must be exactly 4 digits.');

  const member = await membersModel.findMemberForCheckIn(username);
  if (!member || !member.mem_pin_hash || !(await bcrypt.compare(pin, member.mem_pin_hash))) {
    throw new ApiError(403, 'Invalid username or PIN, or no active membership was found.');
  }
  const attendance = await membersModel.recordCheckIn(member, req.user.empId);
  if (!attendance) {
    throw new ApiError(409, 'This member has already checked in today.');
  }
  res.status(201).json({
    success: true,
    data: {
      ...attendance,
      memberId: member.member_id,
      name: member.mem_fullname,
      username: member.mem_username,
      membershipStatus: member.membership_status,
      expiresOn: member.mbs_expiration_date,
      membershipType: member.membership_type,
    },
  });
});

const walkIn = asyncHandler(async (req, res) => {
  const name = requiredString(req.body.fullName, 'Full name', 120);
  const phone = requiredString(req.body.phoneNumber, 'Phone number', 11);
  if (!validPhone(phone)) throw new ApiError(400, 'Phone number must start with 09 and contain 11 digits.');
  const amountPaid = positiveAmount(req.body.amountPaid, 'Amount paid');
  const pass = await membersModel.createWalkIn({ name, phone, amountPaid }, req.user.empId);
  res.status(201).json({
    success: true,
    data: { ...pass, change: Math.round((amountPaid - pass.wiatd_rate) * 100) / 100 },
  });
});

const renew = asyncHandler(async (req, res) => {
  const memberId = parseId(req.params.id);
  if (!['regular', 'student'].includes(req.body.membershipType)) {
    throw new ApiError(400, 'Select a valid membership type.');
  }
  const payment = paymentDetails(req.body.paymentMethod, req.body.paymentReference);
  const membership = await membersModel.renewMembership(
    memberId,
    { membershipType: req.body.membershipType, payment },
    req.user.empId
  );
  if (!membership) throw new ApiError(404, 'Active member not found.');
  res.status(201).json({ success: true, data: membership });
});

const resetPin = asyncHandler(async (req, res) => {
  const memberId = parseId(req.params.id);
  if (!validPin(req.body.pin)) throw new ApiError(400, 'PIN must be exactly 4 digits.');
  const member = await membersModel.updatePin(memberId, req.body.pin, req.user.empId);
  if (!member) throw new ApiError(404, 'Member not found.');
  res.json({ success: true, data: { memberId: member.member_id, name: member.mem_fullname } });
});

const addWeight = asyncHandler(async (req, res) => {
  const memberId = parseId(req.params.id);
  const weightKg = positiveAmount(req.body.weightKg, 'Weight');
  const record = await membersModel.addWeight(memberId, weightKg, req.user.empId);
  if (!record) throw new ApiError(404, 'Member not found.');
  res.status(201).json({ success: true, data: record });
});

module.exports = { list, get, create, checkIn, walkIn, renew, resetPin, addWeight };
