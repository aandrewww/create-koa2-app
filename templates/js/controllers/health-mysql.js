const Router = require('koa-router');

const { HEALTH_STATUSES } = require('../constants');

const logger = require('../helpers/get-logger')(__filename);

const router = new Router();

async function get(ctx) {
  const { db, privateUUID } = ctx.state;

  if (privateUUID !== process.env.HEALTH_UUID) {
    return;
  }

  logger.info('get');

  let status = HEALTH_STATUSES.OK;
  let mysqlTime;
  let redisPing;

  try {
    [{ mysqlTime }] = await db.queryAsync('SELECT NOW() as mysqlTime');
  } catch (error) {
    logger.warn('get - error=%j', error);
  }

  try {
    redisPing = await ctx.redis.ping();
  } catch (error) {
    logger.warn('get - error=%j', error);
  }

  if (!mysqlTime || !redisPing) {
    status = HEALTH_STATUSES.FAIL;
  }

  ctx.body = {
    status,
    mysql_time: mysqlTime
  };
}

router.get('/', get);

module.exports = router;
