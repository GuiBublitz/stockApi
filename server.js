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
    maxAge: 120 * 60 * 1000 
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

  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  const userAgent = req.headers['user-agent'];

  const host = req.headers.host;

  const log = logger.withUser(username);
  log.info(`${req.method} ${req.url} - IP: ${ip} - User Agent: ${userAgent} - Host: ${host}`);

  next();
});

app.use('/', routes);

app.use((req, res, next) => {
  res.status(404).render('404', { title: 'Página Não Encontrada', showNav: true });
});

server.listen(5050, () => {
  logger.info(`Server running at http://localhost:5050`);
});

process.on('SIGINT', () => {
  closeDatabase();
  logger.info('Database connection closed and server terminated');
  process.exit(0);
});
