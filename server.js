require('dotenv').config();
const express           = require('express');
const expressLayouts    = require('express-ejs-layouts');
const session           = require('express-session');
const bodyParser        = require('body-parser');
const path              = require('path');
const logger            = require('./logger');
const http              = require('http');
const socketIo          = require('socket.io');
const routes            = require('./routes/index');
const socketHandler     = require('./socketHandler');
const { closeDatabase } = require('./database/database');

const app    = express();
const server = http.createServer(app);
const io     = socketIo(server);

logger.setIo(io);

const sessionMiddleware = session({
  secret: process.env.SECRETE_KEY,
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: process.env.HTTPS_ONLY === 'true',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
  }
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

app.use('/', routes);

server.listen(5050, () => {
  logger.info(`Server running at http://localhost:5050`);
});

process.on('SIGINT', () => {
  closeDatabase();
  logger.info('Database connection closed and server terminated');
  process.exit(0);
});
