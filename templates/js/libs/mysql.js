const mysql = require('mysql');
const Promise = require('bluebird');

const logger = require('../helpers/get-logger')(__filename);

class MySQL {
  constructor(config) {
    logger.info('constructor');

    this.pool = mysql.createPool(config);
    this.config = config;

    Promise.promisifyAll(this.pool);
  }

  async getConnection() {
    logger.debug('getConnection');

    try {
      const connection = await this.pool.getConnectionAsync();

      Promise.promisifyAll(connection);

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

    await this.pool.endAsync();
  }
}

module.exports = new MySQL({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  connectionLimit: +process.env.DB_CONNECTION_LIMIT
});
