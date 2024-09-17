const express = require('express');
const router = express.Router();
const { validateLogin } = require('../middleware');
const { getAtivos } = require('../database/database');

router.get('/', validateLogin, (req, res) => {
    getAtivos((err, ativos) => {
        if (err) {
            return res.status(500).send('Erro ao buscar os tipos de ativos');
        }

        res.render('home', { title: 'Home', userId: req.session.userId, ativos, showNav: true });
    });
});

module.exports = router;