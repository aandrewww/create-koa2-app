// const Promise = require('bluebird');
const { Pool } = require('pg');

const logger = require('../helpers/get-logger')(__filename);

class PostgreSQL {
  constructor(config) {
    logger.info('constructor');

    this.pool = new Pool(config);
    this.config = config;

    // Promise.promisifyAll(this.pool);
  }

  async query(text, params) {
    return this.pool.query(text, params);
  }

  async getConnection() {
    logger.debug('getConnection');

    try {
      const connection = await this.pool.connect();
      // Promise.promisifyAll(connection);

      logger.debug('getConnection - done');

      return connection;
    } catch (error) {
      logger.warn('getConnection - message=%s, stack=%s', error.message, error.stack);
      throw error;
    }
  }

  async end() {
    logger.debug('end');

    this.pool.removeAllListeners('error');

    await this.pool.end();
  }
}

module.exports = new PostgreSQL({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  port: process.env.DB_PORT,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  max: +process.env.DB_CONNECTION_LIMIT
});
