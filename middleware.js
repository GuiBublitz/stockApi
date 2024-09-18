const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  keyGenerator: (req) => {
    return req.body.username || req.ip;
  },
  handler: (req, res) => {
    res.status(429).render('login', { 
      title: 'Login', 
      showNav: false, 
      error: 'Muitas tentativas de login. Tente novamente mais tarde.' 
    });
  }
});

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  handler: (req, res) => {
    return res.status(429).render('register', {
      errors: [{ msg: 'Muitas tentativas de registro. Tente novamente mais tarde.' }],
      title: 'Register',
      showNav: true
  });
  }
});

function validateUserKey(req, res, next) {
    const userKey = req.query.key;
    const validUserKey = "Bruno.Baehr";

    if (userKey !== validUserKey) {
        return res.status(403).json({ error: "Invalid user key" });
    }
    next();
}

function validateLogin(req, res, next) {
    if (req.session.userId) {
        return next();
    } else {
        return res.redirect('/login');
    }
}

function checkAdmin(req, res, next) {
    if (req.session.userId && req.session.isAdmin) {
      return next();
    } else {
      return res.status(403).render('403', { title: 'Acesso Negado!', showNav: true });
    }
  }

module.exports = { validateUserKey, validateLogin, checkAdmin, loginLimiter, registerLimiter };