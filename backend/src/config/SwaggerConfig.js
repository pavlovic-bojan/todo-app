const swaggerJsDoc = require('swagger-jsdoc')
const swaggerUi = require('swagger-ui-express')

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - password
 *       properties:
 *         username:
 *           type: string
 *         email:
 *           type: string
 *         password:
 *           type: string
 *         role:
 *           type: string
 *           enum: [client, admin]
 *         age:
 *           type: integer
 *     Todo:
 *       type: object
 *       required:
 *         - title
 *       properties:
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         completed:
 *           type: boolean
 */

/**
 * Swagger documentation setup.
 * @param {Express.Application} app - The Express app instance
 */
const setupSwagger = (app) => {
    const swaggerOptions = {
        swaggerDefinition: {
            openapi: '3.0.0',
            info: {
                title: 'Todo App API',
                version: '1.0.0',
                description: 'API documentation for Todo App with User Authentication using Express, Prisma & PostgreSQL (Neon)',
            },
            servers: [
                {
                    url: '/api',
                },
            ],
            tags: [
                {
                    name: 'Users',
                    description: 'User authentication and management API operations'
                },
                {
                    name: 'Todos',
                    description: 'Todo CRUD operations'
                }
            ],
            components: {
                securitySchemes: {
                    bearerAuth: {
                        type: 'http',
                        scheme: 'bearer',
                        bearerFormat: 'JWT'
                    }
                }
            }
        },
        apis: ['./src/api/routes/*.js'],
    }

    const swaggerDocs = swaggerJsDoc(swaggerOptions);

    // Swagger UI endpoint
    app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs))
}

module.exports = { setupSwagger }

