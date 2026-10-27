const bcrypt = require('bcrypt');
const membersModel = require('../models/members.model');
const cloudinary = require('../config/cloudinary');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');
const multer = require('multer');
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

const MAX_PROFILE_PHOTO_SIZE = 2 * 1024 * 1024;
const allowedPhotoTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
const uploadProfilePhotoFile = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_PROFILE_PHOTO_SIZE, files: 1, fields: 0, parts: 1 },
  fileFilter(req, file, callback) {
    if (!allowedPhotoTypes.has(file.mimetype)) {
      return callback(new ApiError(400, 'Upload a JPG, PNG, or WebP image.'));
    }
    return callback(null, true);
  },
}).single('photo');

const parseProfilePhotoUpload = (req, res, next) => {
  uploadProfilePhotoFile(req, res, (error) => {
    if (error instanceof multer.MulterError) {
      const tooLarge = error.code === 'LIMIT_FILE_SIZE';
      return next(new ApiError(tooLarge ? 413 : 400, tooLarge
        ? 'Photo must be 2 MB or smaller.'
        : 'Upload a single photo file.'));
    }
    return next(error);
  });
};

function hasValidPhotoSignature(file) {
  const bytes = file.buffer;
  if (file.mimetype === 'image/jpeg') return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (file.mimetype === 'image/png') return bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  return file.mimetype === 'image/webp' && bytes.length >= 12 &&
    bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP';
}

const list = asyncHandler(async (req, res) => {
  const members = await membersModel.listMembers();
  res.json({ success: true, count: members.length, data: members });
});

const get = asyncHandler(async (req, res) => {
  const member = await membersModel.getMember(parseId(req.params.id));
  if (!member) throw new ApiError(404, 'Member not found.');
  res.json({ success: true, data: member });
});

const uploadProfilePhoto = asyncHandler(async (req, res) => {
  const memberId = parseId(req.params.id);
  if (!req.file) throw new ApiError(400, 'Choose a JPG, PNG, or WebP photo to upload.');
  if (!hasValidPhotoSignature(req.file)) {
    throw new ApiError(400, 'The uploaded file is not a valid JPG, PNG, or WebP image.');
  }
  if (!await membersModel.memberExists(memberId)) throw new ApiError(404, 'Member not found.');

  const photoUrl = await cloudinary.uploadMemberProfilePhoto(req.file.buffer, memberId);
  const member = await membersModel.updateProfilePhoto(memberId, photoUrl, req.user.empId);
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

module.exports = {
  list,
  get,
  create,
  checkIn,
  walkIn,
  renew,
  resetPin,
  addWeight,
  parseProfilePhotoUpload,
  uploadProfilePhoto,
};
