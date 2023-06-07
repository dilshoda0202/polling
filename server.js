require('dotenv').config();
const express = require('express');
const layouts = require('express-ejs-layouts');
const app = express();
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('./config/ppConfig');
const isLoggedIn = require('./middleware/isLoggedIn');
const axios = require('axios');
const models = require('./models')
const DbStore = require('./dbstore');

SECRET_SESSION = process.env.SECRET_SESSION;
// console.log('>>>>', SECRET_SESSION);

app.set('view engine', 'ejs');

app.use(require('morgan')('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));
app.use(express.json());
app.use(layouts);

app.use(flash());            // flash middleware
app.use(session({
  secret: SECRET_SESSION,    // What we actually will be giving the user on our site as a session cookie
  resave: false,             // Save the session even if it's modified, make this false
  saveUninitialized: true,    // If we have a new session, we save it, therefore making that true
  // store: new DbStore()
}));

app.use(passport.initialize());      // Initialize passport
app.use(passport.session());         // Add a session

app.use((req, res, next) => {
  res.locals.alerts = req.flash();
  res.locals.currentUser = req.user;
  next();
});

app.get('/', isLoggedIn, async (req, res) => {
  const query = await models.poll.findAll({
    include: [{ model: models.pollOption, as: 'options' }, { model: models.votes, as: 'votes' }],
  });
  const polls = query.map(el => el.get({ plain: true }));
  polls.forEach(p => {
    p.hasVoted = !!p.votes.find(v => v.userId === req.user.id);
  });
  console.log(polls[0]);
  res.render('index', { polls });
});

// home route
app.get('/movies', function (req, res) {
  const url = 'https://serpapi.com/search.json?q=eternals+theater&location=Austin,+Texas,+United+States&hl=en&gl=us'
  axios.get(url, { params: { api_key: process.env.API_KEY } })
    .then(function (response) {
      console.log('test data', response.data)
      // handle success
      return res.render('movies', { movies: response.data });
    })
    .catch(function (error) {
      res.json({ message: 'Data not found. Please try again later.' });
    });
});

app.get('/newpoll', isLoggedIn, (req, res) => {
  res.render('newpoll');
});

app.use('/auth', require('./controllers/auth'));
app.use('/polls', require('./controllers/polls'));

// Add this above /auth controllers
app.get('/profile', isLoggedIn, (req, res) => {
  const { id, name, email } = req.user.get();
  res.render('profile', { id, name, email });
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`🎧 You're listening to the smooth sounds of port ${PORT} 🎧`);
});

module.exports = server;
