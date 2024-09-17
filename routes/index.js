const express = require('express');
const authRoutes = require('./authRoutes');
const adminRoutes = require('./adminRoutes');
const apiRoutes = require('./apiRoutes');
const homeRoutes = require('./homeRoutes');

const router = express.Router();

router.use(homeRoutes);
router.use(authRoutes);
router.use(adminRoutes);
router.use(apiRoutes);

module.exports = router;