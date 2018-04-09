const Router = require('koa-router');

const health = require('./controllers/health');
const version = require('./controllers/version');

const validatePrivateUUID = require('./middlewares/validate-private-uuid');

const router = new Router();

router
  .use('/:privateUUID/health', validatePrivateUUID(), health.routes(), health.allowedMethods())
  .use('/:privateUUID/version', validatePrivateUUID(), version.routes(), version.allowedMethods());

module.exports = router;
