'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.addColumn(
        'polls', // table name
        'creatorId', // new field name
        {
          type: Sequelize.INTEGER,
          references: {
            model: 'users',
            key: 'id'
          },
        },
      )
    ]);
  },

  async down(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.removeColumn('polls', 'creatorId'),
    ]);
  }
};
