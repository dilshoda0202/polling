const models = require("./models");
const Store = require("express-session/session/store");

module.exports = class DbStore extends Store {
  clear(cb) {
    models.sessions.destroy({}).then(cb);
  }

  destroy(sessionId, cb) {
    models.sessions.destroy({where: {sessionId}}).then(cb);
    cb()
  }

  async get(sessionId, cb) {
    const sessions = await models.sessions.findAll({where: {sessionId}, raw: true});
    if (!sessions.length)
      return cb();
    cb(JSON.parse(sessions[0].session));
  }

  set(sessionId, session, cb) {

  }

  length(cb) {
    models.sessions.count({}).then(cb);
  }

  touch(sessionId, session, cb) {
    models.sessions.create({sessionId, session: JSON.stringify(session)}).then(cb);
  }
}