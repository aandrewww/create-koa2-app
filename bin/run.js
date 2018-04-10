#!/usr/bin/env node

const path = require('path');
const program = require('commander');
const sortedObject = require('sorted-object');

const VERSION = require('../package').version;
const utils = require('./utils');
const prompts = require('./prompts');

utils.around(program, 'optionMissingArgument', (fn, args) => {
  console.log('optionMissingArgument');
  program.outputHelp();
  fn.apply(this, args);
  return { args: [], unknown: [] };
});

utils.before(program, 'outputHelp', () => {
  console.log('outputHelp');
  // track if help was shown for unknown option
  this._helpShown = true;
});

utils.before(program, 'unknownOption', () => {
  console.log('unknownOption');
  // allow unknown options if help was shown, to prevent trailing error
  this._allowUnknownOption = this._helpShown;

  // show help if not yet shown
  if (!this._helpShown) {
    program.outputHelp();
  }
});

async function readParams() {
  program
    .name('create-koa2-app')
    .version(VERSION, '    --version')
    .usage('[options] [dir]')
    .option('-d, --db <database>', 'add database support (mysql, postgresql, mongodb)')
    .option('    --redis', 'add redis support')
    .option('    --git', 'add .gitignore')
    .option('-f, --force', 'force on non-empty directory')
    .parse(process.argv);

  if (!utils.exit.exited) {
    if (program.db === undefined) {
      program.db = await prompts.pickDatabase();
    }
    if (program.redis === undefined) {
      program.redis = await prompts.chooseRedis();
    }
  }
}

/**
 * Create application at the given directory.
 *
 * @param {string} name
 * @param {string} dir
 */

function createApplication(name, dir) {
  console.log();

  // Package
  const pkg = {
    name,
    version: '0.0.0',
    private: true,
    scripts: {
      start: 'node app.js',
      lint: 'eslint -c ./.eslintrc .',
      test: 'echo "All ok!"'
    },
    husky: {
      hooks: {
        'pre-commit': 'npm run lint',
        'pre-push': 'npm run lint'
      }
    },
    dependencies: {
      axios: '~0.17.1',
      bluebird: '~3.5.0',
      colors: '~1.1.2',
      dotenv: '~4.0.0',
      koa: '~2.3.0',
      'koa-router': '~7.2.1',
      lodash: '~4.17.4',
      ms: '~2.1.1',
      winston: '~3.0.0-rc1',
      yargs: '~9.0.1'
    },
    devDependencies: {
      'babel-eslint': '~7.2.3',
      eslint: '~4.5.0',
      'eslint-config-airbnb-base': '~11.3.1',
      'eslint-plugin-import': '~2.7.0',
      'eslint-plugin-prettier': '~2.2.0',
      husky: '~0.15.0-rc.6',
      prettier: '~1.5.3'
    }
  };

  // JavaScript
  const app = utils.loadTemplate('js/app.js');
  const dotenv = utils.loadTemplate('.env.default');

  app.locals.db = program.db;
  app.locals.redis = program.redis;

  dotenv.locals.db = program.db;
  dotenv.locals.redis = program.redis;

  // App modules
  app.locals.modules = Object.create(null);
  app.locals.uses = [];

  // Koa2 cors
  app.locals.modules.cors = 'koa2-cors';
  app.locals.uses.push('cors({ origin: process.env.ALLOW_ORIGIN })');
  pkg.dependencies['koa2-cors'] = '~2.0.3';

  // Koa bodyparser
  app.locals.modules.bodyParser = 'koa-bodyparser';
  app.locals.uses.push('bodyParser()');
  pkg.dependencies['koa-bodyparser'] = '~4.2.0';

  // Koa helmet
  app.locals.modules.helmet = 'koa-helmet';
  app.locals.uses.push('helmet()');
  pkg.dependencies['koa-helmet'] = '~3.3.0';

  // Koa validate
  app.locals.modules.validate = 'koa-validate';
  pkg.dependencies['koa-validate'] = '~1.0.7';

  if (dir !== '.') {
    utils.mkdir(dir, '.');
  }

  utils.mkdir(dir, 'controllers');
  utils.mkdir(dir, 'helpers');
  utils.mkdir(dir, 'libs');
  utils.mkdir(dir, 'middlewares');

  // Database support
  switch (program.db) {
    case 'mysql':
      app.locals.uses.push('addDBToState()');
      pkg.dependencies.mysql = '~2.15.0';
      utils.copyTemplate('js/libs/mysql.js', path.join(`${dir}/libs`, 'mysql.js'));
      utils.copyTemplate('js/middlewares/add-mysql-to-state.js', path.join(`${dir}/middlewares`, 'add-db-to-state.js'));
      utils.copyTemplate('js/controllers/health-mysql.js', path.join(`${dir}/controllers`, 'health.js'));
      utils.mkdir(dir, 'migrations');
      utils.copyTemplateMulti('js/migrations', `${dir}/migrations`, '*.js');
      break;
    case 'mongodb':
      app.locals.uses.push('addDBToState()');
      pkg.dependencies.mongoose = '~5.0.11';
      utils.copyTemplate('js/libs/mongodb.js', path.join(`${dir}/libs`, 'mongodb.js'));
      utils.copyTemplate('js/middlewares/add-mongo-to-state.js', path.join(`${dir}/middlewares`, 'add-db-to-state.js'));
      utils.copyTemplate('js/controllers/health-mongo.js', path.join(`${dir}/controllers`, 'health.js'));
      utils.mkdir(dir, 'models');
      utils.copyTemplateMulti('js/models', `${dir}/models`, '*.js');
      break;
    case 'postgresql':
      app.locals.uses.push('addDBToState()');
      pkg.dependencies.pg = '~v7.4.1';
      utils.copyTemplate('js/libs/postgresql.js', path.join(`${dir}/libs`, 'postgresql.js'));
      utils.copyTemplate('js/middlewares/add-postgresql-to-state.js', path.join(`${dir}/middlewares`, 'add-db-to-state.js'));
      utils.copyTemplate('js/controllers/health-postgresql.js', path.join(`${dir}/controllers`, 'health.js'));
      utils.mkdir(dir, 'migrations');
      utils.copyTemplateMulti('js/migrations', `${dir}/migrations`, '*.js');
      break;
    default:
      app.locals.db = false;
      utils.copyTemplate('js/controllers/health.js', path.join(`${dir}/controllers`, 'health.js'));
      break;
  }

  // Redis support
  if (program.redis) {
    pkg.dependencies.redis = '~2.8.0';
    utils.copyTemplate('js/libs/redis.js', path.join(`${dir}/libs`, 'redis.js'));
  }

  utils.copyTemplate('js/router.js', path.join(dir, 'router.js'));
  utils.copyTemplate('js/controllers/version.js', path.join(`${dir}/controllers`, 'version.js'));
  utils.copyTemplateMulti('js/helpers', `${dir}/helpers`, '*.js');
  utils.copyTemplate('js/constants.js', path.join(dir, 'constants.js'));
  if (program.git) {
    utils.copyTemplate('.gitignore', path.join(dir, '.gitignore'));
  }
  utils.copyTemplate('.editorconfig', path.join(dir, '.editorconfig'));
  utils.copyTemplate('.eslintignore', path.join(dir, '.eslintignore'));
  utils.copyTemplate('.eslintrc', path.join(dir, '.eslintrc'));

  utils.copyTemplate('js/middlewares/errors.js', path.join(`${dir}/middlewares`, 'errors.js'));
  utils.copyTemplate('js/middlewares/requests.js', path.join(`${dir}/middlewares`, 'requests.js'));
  utils.copyTemplate('js/middlewares/validate-private-uuid.js', path.join(`${dir}/middlewares`, 'validate-private-uuid.js'));

  // sort dependencies like npm(1)
  pkg.dependencies = sortedObject(pkg.dependencies);

  // write files
  utils.write(path.join(dir, 'app.js'), app.render());
  utils.write(path.join(dir, '.env.default'), dotenv.render());
  utils.write(path.join(dir, 'package.json'), `${JSON.stringify(pkg, null, 2)}\n`);

  const prompt = utils.launchedFromCmd() ? '>' : '$';

  if (dir !== '.') {
    console.log();
    console.log('   change directory:');
    console.log('     %s cd %s', prompt, dir);
  }

  console.log();
  console.log('   install dependencies:');
  console.log('     %s npm install', prompt);
  console.log();
  console.log('   run the app:');

  if (utils.launchedFromCmd()) {
    console.log('     %s SET DEBUG=%s:* & npm start', prompt, name);
  } else {
    console.log('     %s DEBUG=%s:* npm start', prompt, name);
  }

  console.log();
}

async function init() {
  await readParams();

  // Path
  const destinationPath = program.args.shift() || '.';

  // App name
  const appName = utils.createAppName(path.resolve(destinationPath)) || 'hello-world';

  // Database support
  if (program.db === true) {
    if (program.mysql) program.db = 'mysql';
    if (program.postgresql) program.db = 'postgresql';
    if (program.mongo) program.db = 'mongo';
  }

  // Generate application
  utils.emptyDirectory(destinationPath, (empty) => {
    if (empty || program.force) {
      createApplication(appName, destinationPath);
    } else {
      utils.confirm('destination is not empty, continue? [y/N] ', (ok) => {
        if (ok) {
          process.stdin.destroy();
          createApplication(appName, destinationPath);
        } else {
          console.error('aborting');
          utils.exit(1);
        }
      });
    }
  });
}

init();
