const MODE_0666 = 0o0666;
const MODE_0755 = 0o0755;

const ejs = require('ejs');
const fs = require('fs');
const minimatch = require('minimatch');
const mkdirp = require('mkdirp');
const readline = require('readline');
const util = require('util');
const path = require('path');

const TEMPLATE_DIR = path.join(__dirname, '..', 'templates');

/* eslint-disable */

/**
 * Install an around function; AOP.
 */

function around(obj, method, fn) {
  var old = obj[method];

  obj[method] = function() {
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) args[i] = arguments[i];
    return fn.call(this, old, args);
  };
}

/**
 * Install a before function; AOP.
 */

function before(obj, method, fn) {
  var old = obj[method];

  obj[method] = function() {
    fn.call(this);
    old.apply(this, arguments);
  };
}

/* eslint-enable */

/**
 * Prompt for confirmation on STDOUT/STDIN
 */

const confirm = (msg, callback) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question(msg, (input) => {
    rl.close();
    callback(/^y|yes|ok|true$/i.test(input));
  });
};

/**
 * echo str > file.
 *
 * @param {String} file
 * @param {String} str
 */

function write(file, str, mode) {
  fs.writeFileSync(file, str, { mode: mode || MODE_0666 });
  console.log(`   \x1b[36mcreate\x1b[0m : ${file}`);
}

/**
 * Copy file from template directory.
 */

const copyTemplate = (from, to) => {
  write(to, fs.readFileSync(path.join(TEMPLATE_DIR, from), 'utf-8'));
};

/**
 * Copy multiple files from template directory.
 */

const copyTemplateMulti = (fromDir, toDir, nameGlob) => {
  fs
    .readdirSync(path.join(TEMPLATE_DIR, fromDir))
    .filter(minimatch.filter(nameGlob, { matchBase: true }))
    .forEach((name) => {
      copyTemplate(path.join(fromDir, name), path.join(toDir, name));
    });
};

/**
 * Create an app name from a directory path, fitting npm naming requirements.
 *
 * @param {String} pathName
 */

const createAppName = pathName =>
  path
    .basename(pathName)
    .replace(/[^A-Za-z0-9.-]+/g, '-')
    .replace(/^[-_.]+|-+$/g, '')
    .toLowerCase();

/**
 * Check if the given directory `dir` is empty.
 *
 * @param {String} dir
 * @param {Function} fn
 */

const emptyDirectory = (dir, fn) => {
  fs.readdir(dir, (err, files) => {
    if (err && err.code !== 'ENOENT') throw err;
    fn(!files || !files.length);
  });
};

/**
 * Graceful exit for async STDIO
 */

const exit = (code) => {
  // flush output for Node.js Windows pipe bug
  // https://github.com/joyent/node/issues/6247 is just one bug example
  // https://github.com/visionmedia/mocha/issues/333 has a good discussion

  /* eslint-disable */
  const done = () => {
    if (!draining--) process.exit(code);
  };
  /* eslint-enable */

  let draining = 0;
  const streams = [process.stdout, process.stderr];

  exit.exited = true;

  streams.forEach((stream) => {
    // submit empty write request and wait for completion
    draining += 1;
    stream.write('', done);
  });

  done();
};

/**
 * Determine if launched from cmd.exe
 */

function launchedFromCmd() {
  return process.platform === 'win32' && process.env._ === undefined;
}

/**
 * Load template file.
 */

function loadTemplate(name) {
  const contents = fs.readFileSync(path.join(__dirname, '..', 'templates', `${name}.ejs`), 'utf-8');
  const locals = Object.create(null);

  function render() {
    return ejs.render(contents, locals, {
      escape: util.inspect
    });
  }

  return {
    locals,
    render
  };
}

/**
 * Make the given dir relative to base.
 *
 * @param {string} base
 * @param {string} dir
 */

function mkdir(base, dir) {
  const loc = path.join(base, dir);

  console.log(`   \x1b[36mcreate\x1b[0m : ${loc}${path.sep}`);
  mkdirp.sync(loc, MODE_0755);
}

/**
 * Display a warning similar to how errors are displayed by commander.
 *
 * @param {String} message
 */

function warning(message) {
  console.error();
  message.split('\n').forEach((line) => {
    console.error('  warning: %s', line);
  });
  console.error();
}

/**
 * Generate a callback function for commander to warn about renamed option.
 *
 * @param {String} originalName
 * @param {String} newName
 */

function renamedOption(originalName, newName) {
  return function (val) {
    warning(util.format("option `%s' has been renamed to `%s'", originalName, newName));
    return val;
  };
}

module.exports = {
  around,
  before,
  confirm,
  copyTemplate,
  copyTemplateMulti,
  createAppName,
  emptyDirectory,
  exit,
  launchedFromCmd,
  loadTemplate,
  mkdir,
  renamedOption,
  warning,
  write
};
