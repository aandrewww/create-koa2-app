const logger = require('../helpers/get-logger')(__filename);

const { ERROR_CODES, ERROR_MESSAGES } = require('../constants');

const errors = () => async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    let { code, message } = err;
    const { status, payload } = err;

    ctx.status = status || 400;

    if (ctx.errors && ctx.errors.length) {
      logger.debug('errors - path=%s, state=%j, errors=%j', ctx.path, ctx.state, ctx.errors);

      code = ERROR_CODES.REQUEST_VALIDATION_ERROR;
      message = ctx.errors.reduce((errs, error) => Object.assign(errs, error), {});
    } else if (status && status < 500) {
      logger.info('errors - path=%s, state=%j, message=%s, payload=%j', ctx.path, ctx.state, message, payload);
    } else {
      logger.error('errors - path=%s, state=%j, message=%s, stack=%s', ctx.path, ctx.state, message, err.stack);

      code = ERROR_CODES.SERVER_ERROR;
      message = process.env.NODE_ENV === 'production' ? ERROR_MESSAGES.SERVER_ERROR : message;

      ctx.status = 500;
    }

    ctx.body = { code, message };
  }
};

module.exports = errors;
