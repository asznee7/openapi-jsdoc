'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const auth = require('./routes/auth')
const users = require('./routes/users')
const openapiJSDoc = require('../')

// Initialize openapi-jsdoc -> returns validated OpenAPI spec in json format
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

// Initialize app
const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

auth.setup(app)
users.setup(app)

// Serve OpenAPI docs
app.get('/api-docs.json', function (req, res) {
  res.setHeader('Content-Type', 'application/json')
  res.send(api)
})

const port = 3000
app.listen(port, () => {
  console.log('Example app listening at http://localhost:%s', port)
})
