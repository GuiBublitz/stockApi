const express = require('express');
const bcrypt = require('bcrypt');
const { getUserByUsername, addUser } = require('../database/database');
const logger = require('../logger');
const { loginLimiter, registerLimiter } = require('../middleware');
const { body, validationResult } = require('express-validator');

const router = express.Router();

router.get('/login', (req, res) => {
    res.render('login', { title: 'Login', showNav: false });
});

router.post('/login', loginLimiter, (req, res) => {
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
    res.render('register', { title: 'Register', showNav: true });
});

router.post('/register', [
    registerLimiter,
    body('username').isLength({ min: 3 }).trim().escape().withMessage('O nome de usuário deve ter pelo menos 3 caracteres'),
    body('password').isLength({ min: 8 }).trim().withMessage('A senha deve ter no mínimo 8 caracteres'),
    body('email').isEmail().normalizeEmail().withMessage('Por favor, insira um e-mail válido'),
    body('name').isLength({ min: 2 }).trim().escape().withMessage('O nome deve ter pelo menos 2 caracteres')
], (req, res) => {
    const errors = validationResult(req);
    const { username, password, name, email } = req.body;

    if (!errors.isEmpty()) {
        return res.status(400).render('register', { 
            errors: errors.array(), 
            username, 
            email, 
            name,
            title: 'Register', 
            showNav: true
        });
    }

    const saltRounds = 12;

    bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
        if (err) {
            logger.withUser('Guest').error('Error hashing password: ' + err.message);
            return res.status(500).render('register', {
                errors: [{ msg: 'Erro ao processar o registro. Por favor, tente novamente.' }],
                username, 
                email, 
                name,
                title: 'Register', 
                showNav: true
            });
        }

        addUser(username, name, email, hashedPassword, (err, userId) => {
            if (err) {
                if (err.code === 'SQLITE_CONSTRAINT') {
                    logger.withUser('Guest').warn(`Tentativa de registro com nome de usuário já existente: ${username}`);
                    return res.status(400).render('register', {
                        errors: [{ msg: 'Nome de usuário já existe' }],
                        username, 
                        email, 
                        name,
                        title: 'Register', 
                        showNav: true
                    });
                }
                logger.withUser('Guest').error('Erro ao adicionar usuário: ' + err.message);
                return res.status(500).render('register', {
                    errors: [{ msg: 'Erro no servidor. Tente novamente mais tarde.' }],
                    username, 
                    email, 
                    name,
                    title: 'Register', 
                    showNav: true
                });
            }

            logger.withUser(username).info(`Novo usuário registrado: ${username}`);
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