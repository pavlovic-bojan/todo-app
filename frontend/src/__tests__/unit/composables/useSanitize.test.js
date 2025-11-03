import { describe, it, expect } from 'vitest'
import { useSanitize } from '@/composables/useSanitize'

describe('useSanitize', () => {
  const { sanitizeHtml, sanitizeText, sanitizeUrl, sanitizeInput, sanitizeObject } = useSanitize()

  describe('sanitizeHtml', () => {
    it('should allow safe HTML tags', () => {
      const result = sanitizeHtml('<b>Bold</b> and <i>italic</i>')
      expect(result).toContain('<b>Bold</b>')
      expect(result).toContain('<i>italic</i>')
    })

    it('should remove script tags', () => {
      const result = sanitizeHtml('<script>alert("XSS")</script>Safe content')
      expect(result).not.toContain('<script>')
      expect(result).not.toContain('alert')
      expect(result).toContain('Safe content')
    })

    it('should remove onclick handlers', () => {
      const result = sanitizeHtml('<div onclick="alert(1)">Click</div>')
      expect(result).not.toContain('onclick')
    })

    it('should handle empty input', () => {
      expect(sanitizeHtml('')).toBe('')
      expect(sanitizeHtml(null)).toBe('')
    })
  })

  describe('sanitizeText', () => {
    it('should strip all HTML tags', () => {
      const result = sanitizeText('<b>Bold</b> text with <script>alert(1)</script>')
      expect(result).toBe('Bold text with ')
      expect(result).not.toContain('<')
    })

    it('should handle plain text', () => {
      expect(sanitizeText('Plain text')).toBe('Plain text')
    })

    it('should handle empty input', () => {
      expect(sanitizeText('')).toBe('')
      expect(sanitizeText(null)).toBe('')
    })
  })

  describe('sanitizeUrl', () => {
    it('should allow safe URLs', () => {
      expect(sanitizeUrl('https://example.com')).toBe('https://example.com')
      expect(sanitizeUrl('http://localhost:3000')).toBe('http://localhost:3000')
      expect(sanitizeUrl('/relative/path')).toBe('/relative/path')
    })

    it('should block javascript: URLs', () => {
      expect(sanitizeUrl('javascript:alert(1)')).toBe('')
      expect(sanitizeUrl('JavaScript:alert(1)')).toBe('')
    })

    it('should block data: URLs', () => {
      expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBe('')
    })

    it('should block vbscript: URLs', () => {
      expect(sanitizeUrl('vbscript:msgbox')).toBe('')
    })

    it('should handle empty input', () => {
      expect(sanitizeUrl('')).toBe('')
      expect(sanitizeUrl(null)).toBe('')
    })
  })

  describe('sanitizeInput', () => {
    it('should remove all HTML and trim whitespace', () => {
      expect(sanitizeInput('  <b>Test</b>  ')).toBe('Test')
    })

    it('should preserve plain text', () => {
      expect(sanitizeInput('Plain text')).toBe('Plain text')
    })

    it('should remove XSS attempts', () => {
      const result = sanitizeInput('<script>alert("XSS")</script>Safe')
      expect(result).not.toContain('<script>')
      expect(result).toContain('Safe')
    })

    it('should handle empty input', () => {
      expect(sanitizeInput('')).toBe('')
      expect(sanitizeInput(null)).toBe('')
    })
  })

  describe('sanitizeObject', () => {
    it('should sanitize all string properties', () => {
      const obj = {
        title: '<script>alert(1)</script>Title',
        description: '<b>Description</b>',
        number: 123
      }

      const result = sanitizeObject(obj)

      expect(result.title).not.toContain('<script>')
      expect(result.description).not.toContain('<b>')
      expect(result.number).toBe(123)
    })

    it('should handle nested objects', () => {
      const obj = {
        user: {
          name: '<script>XSS</script>John',
          email: 'john@example.com'
        }
      }

      const result = sanitizeObject(obj)

      expect(result.user.name).not.toContain('<script>')
      expect(result.user.email).toBe('john@example.com')
    })

    it('should handle non-object input', () => {
      expect(sanitizeObject(null)).toBeNull()
      expect(sanitizeObject('string')).toBe('string')
    })
  })
})

