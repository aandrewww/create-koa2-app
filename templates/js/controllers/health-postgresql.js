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
  let postgreSQLTime;
  let redisPing;

  try {
    const res = await db.query('SELECT NOW() as postgresqltime');
    postgreSQLTime = res.rows[0].postgresqltime;
  } catch (error) {
    logger.warn('get - error=%j', error);
  }

  try {
    redisPing = await ctx.redis.ping();
  } catch (error) {
    logger.warn('get - error=%j', error);
  }

  if (!postgreSQLTime || !redisPing) {
    status = HEALTH_STATUSES.FAIL;
  }

  ctx.body = {
    status,
    postgresql_time: postgreSQLTime
  };
}

router.get('/', get);

module.exports = router;
