const postgresql = require('../libs/postgresql');

const logger = require('../helpers/get-logger')(__filename);

const addPostgreSQLToState = () => async (ctx, next) => {
  logger.debug('addMySQLToState');

  const connection = await postgresql.getConnection();

  ctx.state.db = connection;

  try {
    await next();
  } finally {
    logger.debug('addPostgreSQLToState - release connection');
    connection.release();
  }
};

module.exports = addPostgreSQLToState;
