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
      return res.status(403).send('Access denied: Admins only');
    }
  }

module.exports = { validateUserKey, validateLogin, checkAdmin };