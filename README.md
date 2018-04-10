<p align="center">
  <img width="200" src="https://cdn.rawgit.com/aandrewww/create-koa2-app/master/media/logo.png">
</p>

[Koa 2'](https://github.com/koajs/koa) application generator. Currently only the web service mode is available.

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![Build status][appveyor-image]][appveyor-url]

## Installation

```sh
$ npm install -g create-koa2-app
```

## Quick Start

<p align="center">
  <img width="600" src="https://cdn.rawgit.com/aandrewww/create-koa2-app/f50a2dcc4fb0f52f741625baba888d21a59a6636/media/screencast.svg">
</p>

Create the app:

```bash
$ create-koa2-app my-app
```

Go to directory:

```bash
$ cd my-app
```

Install dependencies:

```bash
$ npm install
```

Copy and change environment variables from default file:

```bash
$ cp .env.default .env
```

Start your Koa2 app at `http://localhost:3011/`:

```bash
$ npm start
```

## Command Line Options

This generator can also be further configured with the following command line flags.

        --version        output the version number
    -d, --db <database>  add database support (mysql, postgresql, mongodb)
        --redis          add redis support
        --git            add .gitignore
    -f, --force          force on non-empty directory
    -h, --help           output usage information

## TODO:

There're some features (updates) which will be included in this generator in the near future:

* [x] Add dynamic .env file.
* [x] Add appveyor.
* [ ] Add dockerfile.
* [ ] Add static render.
* [ ] Add tests for generator.
* [ ] Add tests for koa2 app.
* [ ] Add coverage for tests.
* [ ] Add support PostgreSQL.
* [ ] Add support MariaDB.
* [ ] Add health check for redis.
* [ ] Add support clasterization.
* [ ] Add support to start app via pm2.
* [ ] Add TravisCI.
* [ ] Improve logger.
* [ ] Add tunnel to localhost (for development).

## Author

* [Andrew Avdeev](https://andrewavdeev.com/)

## License

[MIT](LICENSE)

[npm-image]: https://img.shields.io/npm/v/create-koa2-app.svg
[npm-url]: https://npmjs.org/package/create-koa2-app
[downloads-image]: https://img.shields.io/npm/dm/create-koa2-app.svg
[downloads-url]: https://npmjs.org/package/create-koa2-app
[appveyor-image]: https://ci.appveyor.com/api/projects/status/7ka4hp27t43kkpo4?svg=true
[appveyor-url]: https://ci.appveyor.com/project/aandrewww/create-koa2-app-v09sd
