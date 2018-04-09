const mongodb = require('../libs/mongodb');

const logger = require('../helpers/get-logger')(__filename);

const addMongoDBToState = () => async (ctx, next) => {
  logger.debug('addMongoDBToState');

  await mongodb.connect();

  ctx.state.db = mongodb;

  await next();
};

module.exports = addMongoDBToState;
