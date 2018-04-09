const Promise = require('bluebird');

exports.up = async function up(db) {
  return Promise.all([
    db.createTable('settings', {
      id: { type: 'int', primaryKey: true, autoIncrement: true }
    }),
    db.createTable('users', {
      id: { type: 'int', primaryKey: true, autoIncrement: true }
    })
  ]);
};

exports.down = function down(db) {
  return Promise.all([db.dropTable('settings'), db.dropTable('users')]);
};

exports._meta = {
  version: 1
};
