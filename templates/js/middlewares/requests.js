const logger = require('../helpers/get-logger')(__filename);

const format = require('util').format;
const ms = require('ms');

const options = {
  reqFormat: 'request - method=:method, path=:path',
  resFormat: 'response - status=:status, time=:time, body=:body',
  filter: ['password', 'password_confirmation']
};

function serialize(obj) {
  if (Object.prototype.toString.call(obj) !== '[object Object]') return obj;

  // request params keys
  let keys = Object.keys(obj);

  // filter out keys
  keys = keys.filter(key => options.filter.indexOf(key) === -1);

  // convert to stirng
  const newObj = keys.map(key => format('%s: %s', key, obj[key]));

  return format('{ %s }', newObj.join(', '));
}

const requests = () => async (ctx, next) => {
  const start = Date.now();
  let reqOutput = options.reqFormat;
  let resOutput = options.resFormat;

  const requestParams = {
    method: ctx.request.method.toUpperCase(),
    path: ctx.request.url
  };

  Object.keys(requestParams).forEach(param => {
    reqOutput = reqOutput.replace(`:${param}`, requestParams[param]);
  });

  logger.info(reqOutput);

  await next();

  const end = Date.now();

  const responseParams = {
    time: ms(end - start),
    status: ctx.response.status,
    body: serialize(ctx.request.body || {})
  };

  Object.keys(responseParams).forEach(param => {
    resOutput = resOutput.replace(`:${param}`, responseParams[param]);
  });

  logger.info(resOutput);
};

module.exports = requests;
