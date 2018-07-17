'use strict'

module.exports.setup = function (app) {
  /**
   * @openapi
   * tags:
   *   - name: '/users'
   *     description: Users routes
   */

  /**
   * @openapi
   * /users:
   *   get:
   *     operationId: getUserList
   *     description: Get user list
   *     tags: '/users'
   *     responses:
   *       '200':
   *         description: Success
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/User'
   */
  app.get('/users', function (req, res) {
    res.json([
      { id: 1, name: 'Travis' },
      { id: 2, name: 'Kanye' },
      { id: 4, name: 'Marshall' }
    ])
  })

  /**
   * @openapi
   * /users/:id:
   *   get:
   *     operationId: getUserById
   *     description: Returns user
   *     tags: '/users'
   *     parameters:
   *       - $ref: '#/components/parameters/id'
   *     responses:
   *       '200':
   *         description: Success
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/UserExpanded'
   *             examples:
   *               UserExpandedExample:
   *                 $ref: '#/components/examples/UserExpandedExample'
   *       '404':
   *         description: Not found
   */
  app.get('/users/:id', function (req, res) {
    res.json({
      id: Number(req.params.id),
      name: 'Travis',
      address: '8572 Second Road, Fairmont, WV 26554'
    })
  })

  /**
   * @openapi
   * /users/:id:
   *   put:
   *     operationId: updateUserById
   *     description: Returns updated user
   *     tags: '/users'
   *     parameters:
   *       - $ref: '#/components/parameters/id'
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *               address:
   *                 type: string
   *     responses:
   *       '200':
   *         description: Success
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/UserExpanded'
   *       '404':
   *         description: Not found
   */
  app.put('/users/:id', function (req, res) {
    res.json({ id: Number(req.params.id), ...req.body })
  })
}

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
 *   examples:
 *     UserExpandedExample:
 *        value:
 *          id: 1
 *          name: Henry
 *          address: 8678 East St., Dorchester, MA 02125
 *        summary: A sample user
 */
