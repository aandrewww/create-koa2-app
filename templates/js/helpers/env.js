const dotenv = require('dotenv');
const { resolve } = require('path');

dotenv.config({ path: resolve(__dirname, '../.env') });

process.env.NODE_ENV = process.env.NODE_ENV || 'production';
