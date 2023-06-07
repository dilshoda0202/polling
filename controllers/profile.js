const isLoggedIn = require("../middleware/isLoggedIn");
const models = require("../models");
const express = require("express");

const router = express.Router();

router.post('/edit', isLoggedIn, async (req, res) => {
  await models.user.update(
    {name: req.body.name, email: req.body.email},
    {where: {id: req.user.id}}
  );
  res.redirect('/profile');
});

module.exports = router;