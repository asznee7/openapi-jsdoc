'use strict'

module.exports.setup = function (app) {
  /**
   * @openapi
   * tags:
   *   - name: '/auth'
   *     description: Authorization routes
   */

  /**
   * @openapi
   * /:
   *   get:
   *     operationId: getHomepage
   *     description: Returns the homepage
   *     responses:
   *       '200':
   *         description: Success
   */
  app.get('/', function (req, res) {
    res.send('Homepage, yay')
  })

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

  /**
   * @openapi
   * /sign_up:
   *   post:
   *     operationId: sign_up
   *     description: Sign up to the application
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
   *         description: New user info
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               $ref: '#/components/schemas/User'
   */
  app.post('/sign_up', function (req, res) {
    res.json(req.body)
  })
}

/**
 * @openapi
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: int
 *           format: uuid
 *         name:
 *           type: string
 */
