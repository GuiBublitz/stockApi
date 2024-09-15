require('dotenv').config();
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const path = require('path');
const logger = require('./logger');
const http = require('http');
const socketIo = require('socket.io');

const socketHandler = require('./socketHandler');

const { addUser, getUserByUsername, closeDatabase, getAllUsers } = require('./database/database');
const { validateUserKey, validateLogin, checkAdmin } = require('./middleware');
const { getFiiData } = require('./fiiScraper/fiiController');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

logger.setIo(io);

const sessionMiddleware = session({
  secret: process.env.SECRETE_KEY,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: process.env.HTTPS_ONLY === 'true' }
});

app.use(sessionMiddleware);

io.use((socket, next) => {
  sessionMiddleware(socket.request, {}, next);
});

socketHandler(io);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts); 
app.set('layout', 'layout'); 

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const username = req.session.userId ? `${req.session.username}` : 'Guest';
  const log = logger.withUser(username);
  log.info(`${req.method} ${req.url}`);
  next();
});

app.get('/login', (req, res) => {
  res.render('login', { title: 'Login', showNav: false });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  getUserByUsername(username, (err, user) => {
    if (err || !user) {
      logger.withUser('Guest').error(`Invalid login attempt for username: ${username}`);
      return res.status(400).send('Invalid username or password');
    }

    bcrypt.compare(password, user.password, (err, result) => {
      if (result) {
        req.session.userId   = user.id;
        req.session.isAdmin  = user.isAdmin;
        req.session.email    = user.email;
        req.session.username = user.username;

        logger.withUser(username).info(`User ${username} logged in successfully`);
        return res.redirect('/');
      } else {
        logger.withUser(username).error('Invalid password for username: ' + username);
        return res.status(400).send('Invalid username or password');
      }
    });
  });
});

app.get('/register', (req, res) => {
  res.render('register', { title: 'Register', showNav: false });
});

app.post('/register', (req, res) => {
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

app.get('/', validateLogin, (req, res) => {
  res.render('home', { title: 'Home', userId: req.session.userId, showNav: true });
});

app.get('/admin/users', validateLogin, checkAdmin, (req, res) => {
  getAllUsers((err, users) => {
    if (err) {
      logger.withUser(req.session.username).error('Error fetching users: ' + err.message);
      return res.status(500).send('Error fetching users');
    }
    
    res.render('admin', { title: 'Admin - User List', users, showNav: true });
  });
});

app.get('/logout', (req, res) => {
  logger.withUser(req.session.username).info('User logged out successfully');
  req.session.destroy(err => {
    if (err) {
      logger.withUser(req.session.username).error('Error logging out: ' + err.message);
      return res.status(500).send('Error logging out');
    }
    res.redirect('/login');
  });
});

app.get('/api/getFiiData/:id', validateUserKey, getFiiData);

server.listen(5050, () => {
  logger.info(`Server running at http://localhost:5050`);
});

process.on('SIGINT', () => {
  closeDatabase();
  logger.info('Database connection closed and server terminated');
  process.exit(0);
});
