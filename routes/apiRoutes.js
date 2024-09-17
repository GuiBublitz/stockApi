const express = require('express');
const { validateUserKey } = require('../middleware');
const { getFiiData } = require('../fiiScraper/fiiController');

const router = express.Router();

router.get('/api/getFiiData/:id', validateUserKey, getFiiData);

module.exports = router;
