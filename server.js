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
const sequelize = require("sequelize");
const SequelizeStore = require("connect-session-sequelize")(session.Store);



app.set('view engine', 'ejs');

app.use(require('morgan')('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));
app.use(express.json());
app.use(layouts);

app.use(flash());            // flash middleware

const store = new SequelizeStore({ db: models.sequelize });
store.sync();

app.use(session({
  secret: process.env.SECRET_SESSION,    // What we actually will be giving the user on our site as a session cookie
  resave: false,             // Save the session even if it's modified, make this false
  saveUninitialized: true,    // If we have a new session, we save it, therefore making that true
  store: store
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
    include: [
      {
        model: models.pollOption,
        as: 'options',
        include: [{ model: models.votes, as: 'votes' }]
      },
      { model: models.votes, as: 'votes' }
    ]
  });

  // home route
  app.get('/movies', function (req, res) {
    const url = 'https://serpapi.com/search.json?q=eternals+theater&location=Austin,+Texas,+United+States&hl=en&gl=us'
    axios.get(url, { params: { api_key: process.env.API_KEY } })
      .then(function (response) {
        // handle success
        return res.render('movies', { movies: response.data });
      })
      .catch(function (error) {
        res.json({ message: 'Data not found. Please try again later.' });
      });
  });

  const polls = query.map(el => el.get({ plain: true }));
  polls.forEach(p => {
    p.votesCount = p.votes.length;
    p.hasVoted = !!p.votes.find(v => v.userId === req.user.id);
    p.options.forEach(opt => {
      opt.percent = opt.votes.length / p.votesCount * 100;
      if (opt.percent > 0) {
        opt.width = `${opt.percent}%`;
      } else {
        opt.width = `10px`;
      }
    });
  });
  res.render('index', { polls });
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
