'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class pollOption extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.pollOption.belongsTo(models.poll, {foreignKey: 'pollId', targetKey: 'id', as: 'poll'});
      models.pollOption.hasMany(models.votes, {sourceKey: 'id', foreignKey: 'optionId', as: 'votes'});
    }
  }

  pollOption.init({
    title: DataTypes.STRING,
    voteCount: DataTypes.INTEGER,
    pollId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'pollOption',
  });
  return pollOption;
};