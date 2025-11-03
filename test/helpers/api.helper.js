/**
 * API Helper
 * Utilities for API testing with schema validation
 */
const axios = require('axios')
const Ajv = require('ajv')
const addFormats = require('ajv-formats')
const { allure } = require('allure-playwright')
const fs = require('fs')
const path = require('path')

const ajv = new Ajv({ allErrors: true, strict: false })
addFormats(ajv)

class APIHelper {
  constructor(baseURL = 'http://localhost:3000/api') {
    this.baseURL = baseURL
    this.token = null
    
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json'
      },
      validateStatus: () => true // Don't throw on any status
    })
  }

  /**
   * Set authentication token
   */
  setToken(token) {
    this.token = token
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`
  }

  /**
   * Clear authentication token
   */
  clearToken() {
    this.token = null
    delete this.client.defaults.headers.common['Authorization']
  }

  /**
   * Make HTTP request
   */
  async request(method, endpoint, data = null) {
    const config = {
      method,
      url: endpoint
    }

    if (data) {
      config.data = data
    }

    const response = await this.client.request(config)
    
    // Attach to Allure
    await allure.attachment(`Request: ${method} ${endpoint}`, JSON.stringify({
      method,
      endpoint,
      data,
      headers: config.headers
    }, null, 2), 'application/json')

    await allure.attachment(`Response: ${response.status}`, JSON.stringify({
      status: response.status,
      data: response.data,
      headers: response.headers
    }, null, 2), 'application/json')

    return response
  }

  /**
   * GET request
   */
  async get(endpoint) {
    return await this.request('GET', endpoint)
  }

  /**
   * POST request
   */
  async post(endpoint, data) {
    return await this.request('POST', endpoint, data)
  }

  /**
   * PATCH request
   */
  async patch(endpoint, data) {
    return await this.request('PATCH', endpoint, data)
  }

  /**
   * DELETE request
   */
  async delete(endpoint) {
    return await this.request('DELETE', endpoint)
  }

  /**
   * Validate response against JSON schema
   */
  async validateSchema(response, schemaName) {
    try {
      const schemaPath = path.join(__dirname, '../api/schemas', `${schemaName}.schema.json`)
      
      if (!fs.existsSync(schemaPath)) {
        throw new Error(`Schema file not found: ${schemaName}.schema.json`)
      }
      
      const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'))
      
      const validate = ajv.compile(schema)
      const valid = validate(response.data)

      if (!valid) {
        const errors = JSON.stringify(validate.errors, null, 2)
        await allure.attachment('Schema Validation Errors', errors, 'application/json')
        throw new Error(`Schema validation failed: ${errors}`)
      }

      await allure.attachment('Schema Validation', 'PASSED ✅', 'text/plain')
      return true
    } catch (error) {
      await allure.attachment('Schema Validation Error', error.message, 'text/plain')
      throw error
    }
  }

  /**
   * Assert status code
   */
  assertStatusCode(response, expected) {
    if (response.status !== expected) {
      throw new Error(`Expected status ${expected}, got ${response.status}`)
    }
  }

  /**
   * Assert response contains
   */
  assertResponseContains(response, key, value) {
    if (response.data[key] !== value) {
      throw new Error(`Expected ${key} to be ${value}, got ${response.data[key]}`)
    }
  }

  /**
   * Extract value from response
   */
  extractValue(response, path) {
    const keys = path.split('.')
    let value = response.data
    
    for (const key of keys) {
      value = value[key]
      if (value === undefined) break
    }
    
    return value
  }
}

module.exports = new APIHelper()

