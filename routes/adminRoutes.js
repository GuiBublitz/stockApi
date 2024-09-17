const express = require('express');
const { getAllUsers } = require('../database/database');
const { validateLogin, checkAdmin } = require('../middleware');
const logger = require('../logger');

const router = express.Router();

router.get('/admin/users', validateLogin, checkAdmin, (req, res) => {
  getAllUsers((err, users) => {
    if (err) {
      logger.withUser(req.session.username).error('Error fetching users: ' + err.message);
      return res.status(500).send('Error fetching users');
    }
    
    res.render('admin', { title: 'Admin - User List', users, showNav: true });
  });
});

module.exports = router;
