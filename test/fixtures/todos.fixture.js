/**
 * Todo Fixtures
 * Pre-defined test todo data
 */

module.exports = {
  // Valid todos
  validTodos: [
    {
      title: 'Buy groceries',
      description: 'Milk, eggs, bread, butter'
    },
    {
      title: 'Complete project',
      description: 'Finish the Todo app implementation'
    },
    {
      title: 'Go to gym',
      description: 'Workout session at 6 PM'
    },
    {
      title: 'Read book',
      description: 'Continue reading "Clean Code"'
    },
    {
      title: 'Call dentist',
      description: 'Schedule appointment for next week'
    }
  ],

  // Minimal todo
  minimalTodo: {
    title: 'Minimal todo'
  },

  // Todo with long description
  longDescriptionTodo: {
    title: 'Todo with long description',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(20)
  },

  // Invalid todos for negative testing
  invalidTodos: {
    emptyTitle: {
      title: '',
      description: 'This should fail'
    },

    whitespaceTitle: {
      title: '   ',
      description: 'Only whitespace title'
    },

    tooLongTitle: {
      title: 'a'.repeat(256),
      description: 'Title exceeds 255 characters'
    },

    tooLongDescription: {
      title: 'Valid title',
      description: 'a'.repeat(1001)
    }
  },

  // XSS payloads for security testing
  xssPayloads: {
    scriptInTitle: {
      title: '<script>alert("XSS")</script>',
      description: 'XSS in title'
    },

    scriptInDescription: {
      title: 'Normal title',
      description: '<script>alert("XSS")</script>'
    },

    imgTag: {
      title: '<img src=x onerror=alert(1)>',
      description: 'Image XSS'
    },

    eventHandler: {
      title: 'Click me',
      description: '<div onclick="alert(1)">XSS</div>'
    }
  },

  // Batch todos for performance testing
  batchTodos: function(count) {
    const todos = []
    for (let i = 1; i <= count; i++) {
      todos.push({
        title: `Batch Todo ${i}`,
        description: `Generated todo number ${i} for performance testing`
      })
    }
    return todos
  }
}

