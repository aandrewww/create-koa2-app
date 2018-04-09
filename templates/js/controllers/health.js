const Router = require('koa-router');

const { HEALTH_STATUSES } = require('../constants');

const logger = require('../helpers/get-logger')(__filename);

const router = new Router();

async function get(ctx) {
  const { privateUUID } = ctx.state;

  if (privateUUID !== process.env.HEALTH_UUID) {
    return;
  }

  logger.info('get');

  const status = HEALTH_STATUSES.OK;

  ctx.body = {
    status,
    time: Date.now()
  };
}

router.get('/', get);

module.exports = router;
