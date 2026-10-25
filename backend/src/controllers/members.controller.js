
const membersModel = require('../models/members.model');

const getAllMembers = async (req, res) => {
  try {
    const members = await membersModel.getAllMembers();

    res.json({
      success: true,
      count: members.length,
      data: members,
    });
  } catch (error) {
    console.error('Error fetching members:', error.message);

    res.status(500).json({
      success: false,
      message: 'Failed to retrieve members',
    });
  }
};

const getMemberById = async (req, res) => {
  try {
    const memberId = Number(req.params.id);

    if (!Number.isInteger(memberId) || memberId < 1) {
      return res.status(400).json({
        success: false,
        message: 'Member ID must be a positive integer',
      });
    }

    const member = await membersModel.getMemberById(memberId);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found',
      });
    }

    res.json({
      success: true,
      data: member,
    });
  } catch (error) {
    console.error('Error fetching member:', error.message);

    res.status(500).json({
      success: false,
      message: 'Failed to retrieve member',
    });
  }
};

module.exports = {
  getAllMembers,
  getMemberById,
};
