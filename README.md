# openapi-jsdoc

[![Dependencies](https://david-dm.org/dotaxe/openapi-jsdoc.svg)](https://david-dm.org/dotaxe/openapi-jsdoc)
[![GitHub license](https://img.shields.io/github/license/dotaxe/openapi-jsdoc.svg)](https://github.com/dotaxe/openapi-jsdoc/blob/master/LICENSE)

**openapi-jsdoc** parses your OpenAPI (formerly known as Swagger) documentation from your JSDoc code comments.

Heavily inspired by [swagger-jsdoc](https://github.com/Surnet/swagger-jsdoc).

### Supported versions
* [OpenAPI 3.0](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md)

## Getting started

`openapi-jsdoc` returns OpenAPI specification in json format.

You can define initial OpenAPI root object in `definition` property. For more detail see [here](https://swagger.io/specification/#oasObject).
```javascript
const api = openapiJSDoc({
  definition: {
    // info object, see https://swagger.io/specification/#infoObject
    info: {
      title: 'Example app', // required
      version: '1.0.0', // required
      description: 'A sample API for example app'
    }
  },
  // Paths to the API docs
  apis: ['./example/routes/*.js', './example/parameters.yaml']
})
```
Note that `openapi-jsdoc` uses [node glob](https://github.com/isaacs/node-glob) module in the background when taking your files. This means that you can use patterns such as `*.js` to select all javascript files or `**/*.js` to select all javascript files in sub-folders recursively.


### How to document the API

The API can now be documented in JSDoc-style with swagger spec in YAML.
Root property can be *tags* or *components*, everything else is considered to be API path names. See the example app in the example subdirectory to get sense of it.

```javascript
  /**
   * @openapi
   * /login:
   *   post:
   *     operationId: login
   *     description: Login to the application
   *     tags: '/auth'
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - password
   *             properties:
   *               name:
   *                 type: string
   *               password:
   *                 type: string
   *     responses:
   *       '200':
   *         description: Logged in user info
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               $ref: '#/components/schemas/User'
   */
  app.post('/login', function (req, res) {
    res.json({ id: 1, name: req.body.name })
  })
```
To define a list of [tags](https://swagger.io/specification/#tagObject) used by the specification: 
```javascript
  /**
   * @openapi
   * tags:
   *   - name: '/users'
   *     description: Users routes
   */
```
[Components object](https://swagger.io/specification/#componentsObject) holds various schemas and other reusable things for the specification: 
```javascript
/**
 * @openapi
 * components:
 *   schemas:
 *     UserExpanded:
 *       allOf:
 *         - $ref: '#/components/schemas/User'
 *         - type: object
 *           properties:
 *             address:
 *               type: string
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: int
 *           format: uuid
 *         name:
 *           type: string
 *   parameters:
 *     - name: id
 *       in: path
 *       description: User ID
 *       required: true
 */
```

### Example app

There is an example app in the example subdirectory.
To use it you can use the following commands:

```bash
$ git clone https://github.com/dotaxe/openapi-jsdoc.git
$ cd swagger-jsdoc
$ npm install
$ npm start
```

The swagger spec will be served at [http://localhost:3000/api-docs.json](http://localhost:3000/api-docs.json)
