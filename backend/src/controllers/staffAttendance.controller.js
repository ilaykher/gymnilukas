const staffAttendanceModel = require('../models/staffAttendance.model');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');

const list = asyncHandler(async (req, res) => {
  const limit = req.query.limit === undefined ? 100 : Number(req.query.limit);
  if (!Number.isInteger(limit) || limit < 1 || limit > 500) {
    throw new ApiError(400, 'Limit must be an integer from 1 to 500.');
  }
  const records = await staffAttendanceModel.listRecent(limit);
  res.json({ success: true, count: records.length, data: records });
});

module.exports = { list };
