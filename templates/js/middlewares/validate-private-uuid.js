const { ERROR_CODES, ERROR_MESSAGES } = require('../constants');

const logger = require('../helpers/get-logger')(__filename);

const validatePrivateUUID = () => async (ctx, next) => {
  const privateUUID = ctx.checkParams('privateUUID').isUUID().value;

  logger.debug('validatePrivateUUID - privateUUID=%s', privateUUID);

  ctx.assert(!ctx.errors);
  ctx.assert(
    process.env.HEALTH_UUID === privateUUID,
    400,
    ERROR_MESSAGES.REQUEST_INVALID_PRIVATE_UUID,
    { code: ERROR_CODES.REQUEST_INVALID_PRIVATE_UUID }
  );

  ctx.state.privateUUID = privateUUID;

  await next();
};

module.exports = validatePrivateUUID;
