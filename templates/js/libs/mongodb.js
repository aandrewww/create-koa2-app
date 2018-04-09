const mongoose = require('mongoose');

mongoose.Promise = require('bluebird');

const logger = require('../helpers/get-logger')(__filename);

const MAX_RECONECTIONS = 5;

class MongoDB {
  constructor(config) {
    this.config = config;
    this.reconections = 0;

    this.connection = mongoose.connection;

    this.connection.on('connecting', () => logger.info('connecting to MongoDB...'));
    this.connection.on('reconnected', () => logger.info('MongoDB reconnected!'));

    this.connection.on('connected', () => {
      logger.info('MongoDB connected!');

      this.reconections = 0;
    });

    this.connection.on('error', async (error) => {
      logger.error(`Error in MongoDb connection: ${error}`);

      this.reconections += 1;

      if (!this.config.autoReconnect) {
        throw error;
      } else if (this.reconections === MAX_RECONECTIONS) {
        throw new Error('max reconnections reached');
      } else {
        await this.disconnect();
        await this.connect();
      }
    });
  }

  connect() {
    return mongoose.connect(`mongodb://${this.config.host}:${this.config.port}/${this.config.name}`);
  }

  // eslint-disable-next-line class-methods-use-this
  disconnect() {
    return mongoose.disconnect();
  }
}

module.exports = new MongoDB({
  port: process.env.DB_PORT,
  host: process.env.DB_HOST,
  name: process.env.DB_NAME,
  autoReconnect: true
});
