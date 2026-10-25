
const express = require('express');
const router = express.Router();

const membersController = require('../controllers/members.controller');

router.get('/', membersController.getAllMembers);
router.get('/:id', membersController.getMemberById);

module.exports = router;
