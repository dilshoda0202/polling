const isLoggedIn = require("../middleware/isLoggedIn");
const models = require("../models");
const express = require("express");

const router = express.Router();

router.post('/new', isLoggedIn, async (req, res) => {
  const poll = await models.poll.create({topic: req.body.topic});
  const promises = [];
  for (let i = 1; i < 10; i++) {
    const title = req.body[`option${i}`];
    if (!title)
      break;
    promises.push(models.pollOption.create({pollId: poll.id, title, voteCount: 0}));
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
  res.status(200).json(vote.get({plain: true}));
});

module.exports = router;