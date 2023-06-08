const isLoggedIn = require("../middleware/isLoggedIn");
const models = require("../models");
const express = require("express");
const axios = require("axios");

const router = express.Router();
router.get('/suggestions', function (req, res) {
  if (!req.query || !req.query.q) {
    return res.json({ results: [] });
  }
  const params = {
    q: req.query.q,
    location: 'Austin, Texas, United States',
    hl: 'en',
    gl: 'us',
    api_key: process.env.API_KEY
  };
  const url = 'https://serpapi.com/search.json'
  axios.get(url, { params: params })
    .then(function (response) {
      // handle success
      return res.json(response.data.organic_results);
    })
    .catch(function (error) {
      console.log(error.response.data);
      res.json({ message: 'Data not found. Please try again later.' });
    });
});

router.post('/new', isLoggedIn, async (req, res) => {
  const poll = await models.poll.create({ topic: req.body.topic, creatorId: req.user.id });
  const promises = [];
  for (let i = 1; i < 10; i++) {
    const title = req.body[`option${i}`];
    if (!title)
      break;
    promises.push(models.pollOption.create({ pollId: poll.id, title, voteCount: 0 }));
  }
  await Promise.all(promises);
  res.redirect('/');
});

router.post('/vote', isLoggedIn, async (req, res) => {
  const userId = req.user.id;
  const pollId = req.body.pollId;
  const pollOptionId = req.body.optionId;

  await models.votes.destroy({
    where: {
      pollId: pollId,
      userId: userId
    }
  });

  const vote = await models.votes.create({
    pollId: pollId,
    optionId: pollOptionId,
    userId: userId,
  });
  res.status(200).json(vote.get({ plain: true }));
});

// router.put('/:id', isLoggedIn, async (req, res) => {
//   try {
//     const pollId = req.params.id;
//     const poll = await models.poll.findByPk(pollId);

//     if (!poll) {
//       return res.status(404).json({ message: 'Poll not found' });
//     }

//     if (poll.creatorId !== req.user.id) {
//       return res.status(403).json({ message: 'Unauthorized' });
//     }

//     const { topic } = req.body;

//     if (!topic) {
//       return res.status(400).json({ message: 'Invalid request' });
//     }

//     await poll.update({ topic });

//     res.status(200).json({ message: 'Poll updated successfully' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });



router.delete('/:id', isLoggedIn, async (req, res) => {
  await models.poll.destroy({
    where: {
      id: req.params.id
    }
  });
  res.status(204);
});

module.exports = router;