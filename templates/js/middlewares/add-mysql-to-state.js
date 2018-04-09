const mysql = require('../libs/mysql');

const logger = require('../helpers/get-logger')(__filename);

const addMySQLToState = () => async (ctx, next) => {
  logger.debug('addMySQLToState');

  const connection = await mysql.getConnection();

  ctx.state.db = connection;

  try {
    await next();
  } finally {
    logger.debug('addMySQLToState - release connection');
    connection.release();
  }
};

module.exports = addMySQLToState;
