[![Koa2 logo](https://image.ibb.co/dgxkMc/logo.png)](http://koajs.com/)

[Koa 2'](https://github.com/koajs/koa) application generator. Currently only the web service mode is available.

## Installation

```sh
$ npm install -g create-koa2-app
```

## Quick Start

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

Start your Koa2 app at `http://localhost:3000/`:

```bash
$ npm start
```

## Command Line Options

This generator can also be further configured with the following command line flags.

        --version        output the version number
    -d, --db <database>  add database support (mysql, mariadb, mongodb)
        --redis          add redis support
        --git            add .gitignore
    -f, --force          force on non-empty directory
    -h, --help           output usage information

## TODO:

There're some features (updates) which will be included in this generator in the near future:

* [ ] Add dynamic .env file.
* [ ] Add tests for generator.
* [ ] Add tests for koa2 app.
* [ ] Add coverage for tests.
* [ ] Add support PostgreSQL.
* [ ] Add support MariaDB.
* [ ] Add health check for redis.
* [ ] Add support clasterization.
* [ ] Add support to start app via pm2.
* [ ] Add tunnel to localhost (for development).

## License

[MIT](LICENSE)
