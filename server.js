require('dotenv').config();

const express    = require('express');
const session    = require('express-session');
const bodyParser = require('body-parser');
const bcrypt     = require('bcrypt');

const { addUser, getUserByUsername, closeDatabase } = require('./database/database');
const { validateUserKey, validateLogin } = require('./middleware');
const { getFiiData } = require('./fiiScraper/fiiController');

const app = express();
const port = 5050;

app.set('view engine', 'ejs');
app.set('views', './views');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  secret: process.env.SECRETE_KEY,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: process.env.HTTPS_ONLY === 'true' }

}));

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  getUserByUsername(username, (err, user) => {
    if (err || !user) {
      return res.status(400).send('Invalid username or password');
    }

    bcrypt.compare(password, user.password, (err, result) => {
      if (result) {
        req.session.userId = user.id;
        return res.redirect('/');
      } else {
        return res.status(400).send('Invalid username or password');
      }
    });
  });
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', (req, res) => {
  const { username, password } = req.body;

  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      return res.status(500).send('Internal server error');
    }

    addUser(username, hashedPassword, (err, userId) => {
      if (err) {
        if (err.code === 'SQLITE_CONSTRAINT') {
          return res.status(400).send('Username already exists');
        }
        return res.status(500).send('Internal server error');
      }

      return res.redirect('/login');
    });
  });
});

app.get('/', validateLogin, (req, res) => {
  res.render('home', { userId: req.session.userId });
});

app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).send('Error logging out');
    }
    res.redirect('/login');
  });
});

app.get('/api/getFiiData/:id', validateUserKey, getFiiData);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

process.on('SIGINT', () => {
  closeDatabase();
  process.exit(0);
});