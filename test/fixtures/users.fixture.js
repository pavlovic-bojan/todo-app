/**
 * User Fixtures
 * Pre-defined test user data
 */

module.exports = {
  // Valid users
  validAdminUser: {
    username: 'admin_test',
    email: 'admin@test.com',
    password: 'Admin123456',
    role: 'admin',
    age: 30
  },

  validClientUser: {
    username: 'client_test',
    email: 'client@test.com',
    password: 'Client123456',
    role: 'client',
    age: 25
  },

  validUserMinimal: {
    username: 'minimal_user',
    email: 'minimal@test.com',
    password: 'Password123'
  },

  // Invalid users for negative testing
  invalidUsers: {
    shortUsername: {
      username: 'ab',
      email: 'test@test.com',
      password: 'Test123'
    },

    invalidEmail: {
      username: 'testuser',
      email: 'invalid-email',
      password: 'Test123'
    },

    weakPassword: {
      username: 'testuser',
      email: 'test@test.com',
      password: 'weak'
    },

    noUppercase: {
      username: 'testuser',
      email: 'test@test.com',
      password: 'password123'
    },

    noLowercase: {
      username: 'testuser',
      email: 'test@test.com',
      password: 'PASSWORD123'
    },

    noNumber: {
      username: 'testuser',
      email: 'test@test.com',
      password: 'Password'
    },

    specialCharsInUsername: {
      username: 'test@user!',
      email: 'test@test.com',
      password: 'Test123'
    },

    tooYoung: {
      username: 'testuser',
      email: 'test@test.com',
      password: 'Test123',
      age: 0
    },

    tooOld: {
      username: 'testuser',
      email: 'test@test.com',
      password: 'Test123',
      age: 121
    }
  },

  // XSS payloads for security testing
  xssPayloads: {
    scriptTag: '<script>alert("XSS")</script>',
    imgTag: '<img src=x onerror=alert(1)>',
    svgTag: '<svg onload=alert(1)>',
    iframeTag: '<iframe src="javascript:alert(1)">',
    eventHandler: '<div onclick="alert(1)">Click</div>'
  },

  // SQL injection payloads
  sqlPayloads: {
    orCondition: "admin' OR '1'='1",
    comment: "admin'--",
    union: "' UNION SELECT * FROM users--"
  }
}

