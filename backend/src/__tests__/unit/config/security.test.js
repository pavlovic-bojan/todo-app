const {
  helmetConfig,
  generalLimiter,
  authLimiter,
  passwordResetLimiter,
  compressionConfig
} = require('../../../config/security')

describe('Security Configuration', () => {
  describe('helmetConfig', () => {
    it('should be a function (helmet middleware)', () => {
      expect(typeof helmetConfig).toBe('function')
    })

    it('should have name "helmet"', () => {
      expect(helmetConfig.name).toBe('helmet')
    })
  })

  describe('Rate Limiters', () => {
    it('should export generalLimiter', () => {
      expect(generalLimiter).toBeDefined()
      expect(typeof generalLimiter).toBe('function')
    })

    it('should export authLimiter', () => {
      expect(authLimiter).toBeDefined()
      expect(typeof authLimiter).toBe('function')
    })

    it('should export passwordResetLimiter', () => {
      expect(passwordResetLimiter).toBeDefined()
      expect(typeof passwordResetLimiter).toBe('function')
    })

    it('should have different configurations', () => {
      // All should be different functions
      expect(generalLimiter).not.toBe(authLimiter)
      expect(authLimiter).not.toBe(passwordResetLimiter)
      expect(generalLimiter).not.toBe(passwordResetLimiter)
    })
  })

  describe('compressionConfig', () => {
    it('should be a function (compression middleware)', () => {
      expect(typeof compressionConfig).toBe('function')
    })

    it('should have name "compression"', () => {
      expect(compressionConfig.name).toBe('compression')
    })
  })

  describe('Module Exports', () => {
    it('should export all required middleware', () => {
      const security = require('../../../config/security')

      expect(security).toHaveProperty('helmetConfig')
      expect(security).toHaveProperty('generalLimiter')
      expect(security).toHaveProperty('authLimiter')
      expect(security).toHaveProperty('passwordResetLimiter')
      expect(security).toHaveProperty('compressionConfig')
    })
  })
})

