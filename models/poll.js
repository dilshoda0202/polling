'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class poll extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.poll.hasMany(models.pollOption, {foreignKey: 'pollId', sourceKey: 'id', as: 'options'});
      models.poll.hasMany(models.votes, {foreignKey: 'pollId', sourceKey: 'id', as: 'votes'});
    }
  }

  poll.init({
    topic: DataTypes.STRING,
    creatorId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'poll',
  });
  return poll;
};

