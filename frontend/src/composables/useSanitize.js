import DOMPurify from 'isomorphic-dompurify'

export function useSanitize() {
  /**
   * Sanitize HTML to prevent XSS attacks
   * @param {string} dirty - Potentially unsafe HTML
   * @param {object} config - DOMPurify configuration
   * @returns {string} - Safe HTML
   */
  const sanitizeHtml = (dirty, config = {}) => {
    if (!dirty) return ''
    
    const defaultConfig = {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
      ALLOWED_ATTR: ['href', 'target', 'rel'],
      ...config
    }
    
    return DOMPurify.sanitize(dirty, defaultConfig)
  }

  /**
   * Sanitize text by stripping all HTML
   * @param {string} dirty - Potentially unsafe text
   * @returns {string} - Plain text
   */
  const sanitizeText = (dirty) => {
    if (!dirty) return ''
    return DOMPurify.sanitize(dirty, { ALLOWED_TAGS: [] })
  }

  /**
   * Sanitize URL to prevent javascript: and data: URIs
   * @param {string} url - Potentially unsafe URL
   * @returns {string} - Safe URL or empty string
   */
  const sanitizeUrl = (url) => {
    if (!url) return ''
    
    // Remove dangerous protocols
    const cleaned = url.trim()
    const dangerous = /^(javascript|data|vbscript):/i
    
    if (dangerous.test(cleaned)) {
      return ''
    }
    
    return cleaned
  }

  /**
   * Sanitize user input for safe storage
   * @param {string} input - User input
   * @returns {string} - Sanitized input
   */
  const sanitizeInput = (input) => {
    if (!input) return ''
    
    // Remove all HTML tags and trim whitespace
    return DOMPurify.sanitize(input, { 
      ALLOWED_TAGS: [],
      KEEP_CONTENT: true
    }).trim()
  }

  /**
   * Sanitize object properties recursively
   * @param {object} obj - Object to sanitize
   * @returns {object} - Sanitized object
   */
  const sanitizeObject = (obj) => {
    if (!obj || typeof obj !== 'object') return obj
    
    const sanitized = {}
    
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        sanitized[key] = sanitizeInput(obj[key])
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitized[key] = sanitizeObject(obj[key])
      } else {
        sanitized[key] = obj[key]
      }
    }
    
    return sanitized
  }

  return {
    sanitizeHtml,
    sanitizeText,
    sanitizeUrl,
    sanitizeInput,
    sanitizeObject
  }
}

