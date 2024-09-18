const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Muitas tentativas de login. Tente novamente após 15 minutos.'
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

module.exports = { validateUserKey, validateLogin, checkAdmin, loginLimiter };