const express = require('express');
const bcrypt = require('bcrypt');
const { getUserByUsername, addUser } = require('../database/database');
const logger = require('../logger');

const router = express.Router();

router.get('/login', (req, res) => {
    res.render('login', { title: 'Login', showNav: false });
});

router.post('/login', (req, res) => {
    const { username, password } = req.body;

    getUserByUsername(username, (err, user) => {
        if (err || !user) {
            logger.withUser('Guest').error(`Tentativa de login inválida para o nome de usuário: ${username}`);
            return res.render('login', { title: 'Login', showNav: false,  username: username, error: 'Senha ou usuário incorretos. Tente novamente.' });
        }

        bcrypt.compare(password, user.password, (err, result) => {
            if (result) {
                req.session.userId = user.id;
                req.session.isAdmin = user.isAdmin;
                req.session.email = user.email;
                req.session.username = user.username;

                logger.withUser(username).info(`Usuário ${username} logado com sucesso.`);
                return res.redirect('/');
            } else {
                logger.withUser(username).error('Senha inválida para o nome de usuário: ' + username);
                return res.render('login', { title: 'Login', showNav: false,  username: username, error: 'Senha ou usuário incorretos. Tente novamente.' });
            }
        });
    });
});

router.get('/register', (req, res) => {
    res.render('register', { title: 'Register', showNav: false });
});

router.post('/register', (req, res) => {
    const { username, password, name, email } = req.body;

    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            logger.withUser('Guest').error('Error hashing password: ' + err.message);
            return res.status(500).send('Internal server error');
        }

        addUser(username, name, email, hashedPassword, (err, userId) => {
            if (err) {
                if (err.code === 'SQLITE_CONSTRAINT') {
                    logger.withUser('Guest').warn(`Attempt to register with existing username: ${username}`);
                    return res.status(400).send('Username already exists');
                }
                logger.withUser('Guest').error('Error adding user: ' + err.message);
                return res.status(500).send('Internal server error');
            }

            logger.withUser(username).info(`New user registered: ${username}`);
            return res.redirect('/login');
        });
    });
});

router.get('/logout', (req, res) => {
    logger.withUser(req.session.username).info('User logged out successfully');
    req.session.destroy(err => {
        if (err) {
            logger.withUser(req.session.username).error('Error logging out: ' + err.message);
            return res.status(500).send('Error logging out');
        }
        res.redirect('/login');
    });
});

module.exports = router;