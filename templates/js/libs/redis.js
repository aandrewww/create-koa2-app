const redis = require('redis');
const Promise = require('bluebird');

const logger = require('../helpers/get-logger')(__filename);

Promise.promisifyAll(redis.RedisClient.prototype);
Promise.promisifyAll(redis.Multi.prototype);

const DEFAULT_CONFIG = {
  db: 0,
  retry_strategy: options => Math.min(options.attempt * 100, 15000)
};

class Redis {
  constructor(config) {
    logger.info('constructor - config=%j', config);

    this.client = redis.createClient(Object.assign(DEFAULT_CONFIG, config));

    this._addEventListeners();
  }

  ping() {
    return this.client.pingAsync();
  }

  disconnect() {
    logger.info('disconnect');

    this.client.removeAllListeners('end');
    this.client.removeAllListeners('error');
    this.client.removeAllListeners('ready');
    this.client.removeAllListeners('connect');
    this.client.removeAllListeners('reconnecting');

    this.client.quit();
  }

  _remooveEventListeners() {
    this.client.removeAllListeners('end');
    this.client.removeAllListeners('error');
    this.client.removeAllListeners('ready');
    this.client.removeAllListeners('connect');
    this.client.removeAllListeners('reconnecting');
  }

  _addEventListeners() {
    this.client.on('end', () => logger.info('event - disconnected'));
    this.client.on('error', err => logger.error('event - error=%j', err));
    this.client.on('ready', () => logger.info('event - ready'));
    this.client.on('connect', () => logger.info('event - connected'));
    this.client.on('reconnecting', () => logger.info('event - reconnecting'));
  }
}

module.exports = new Redis({
  db: process.env.REDIS_DB,
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT
});
