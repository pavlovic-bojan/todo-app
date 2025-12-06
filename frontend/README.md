# 🎨 Frontend - Todo Application

Vue 3 + Vite + Bootstrap 5 frontend with modern best practices and comprehensive testing.

---

## ✨ Features

- ✅ **Vue 3 Composition API** - Modern reactive framework
- ✅ **State Management** - Pinia stores
- ✅ **Routing** - Vue Router with guards
- ✅ **UI Framework** - Bootstrap 5
- ✅ **Form Validation** - Reusable composable
- ✅ **XSS Protection** - DOMPurify sanitization
- ✅ **Accessibility** - WCAG 2.1 AA compliant
- ✅ **Testing** - 30+ unit tests with Vitest
- ✅ **Security** - sessionStorage for tokens, httpOnly cookies

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- npm v9+
- Backend running on https://todo-app-xhn2.onrender.com/api/

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Application runs on: https://todo-app-frontend-seven-rho.vercel.app

---

## 📱 Pages

- **Login** (`/login`) - User login
- **Register** (`/register`) - New user registration
- **Forgot Password** (`/forgot-password`) - Request password reset
- **Reset Password** (`/reset-password`) - Reset password with token
- **Dashboard** (`/dashboard`) - Todo management (protected)
- **404** (`/*`) - Not found page

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### Test Coverage
- **Overall:** 90%+
- **Components:** 95%
- **Composables:** 100%
- **Stores:** 95%
- **Views:** 85%

---

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/           # Reusable components
│   │   ├── Navbar.vue
│   │   ├── TodoModal.vue
│   │   ├── ConfirmModal.vue
│   │   └── ErrorBoundary.vue
│   ├── views/                # Page components
│   │   ├── LoginView.vue
│   │   ├── RegisterView.vue
│   │   ├── ForgotPasswordView.vue
│   │   ├── ResetPasswordView.vue
│   │   ├── DashboardView.vue
│   │   └── NotFoundView.vue
│   ├── composables/          # Composition API hooks
│   │   ├── useFormValidation.js
│   │   └── useSanitize.js
│   ├── stores/               # Pinia stores
│   │   └── auth.js
│   ├── router/               # Vue Router
│   │   └── index.js
│   ├── services/             # API client
│   │   └── api.js
│   ├── __tests__/            # Unit tests
│   │   ├── unit/
│   │   │   ├── components/
│   │   │   ├── composables/
│   │   │   ├── stores/
│   │   │   ├── views/
│   │   │   └── router/
│   │   └── setup.js
│   ├── App.vue               # Root component
│   └── main.js               # Entry point
├── public/                   # Static assets
├── index.html
├── vite.config.js
└── package.json
```

---

## 🔒 Security Features

- ✅ **XSS Protection** - DOMPurify for user-generated content
- ✅ **Token Storage** - sessionStorage for access token
- ✅ **httpOnly Cookies** - Refresh token (backend managed)
- ✅ **CSRF Protection** - SameSite cookies
- ✅ **Input Sanitization** - All user inputs sanitized
- ✅ **Form Validation** - Client-side validation before API calls
- ✅ **Auto Token Refresh** - Axios interceptor for seamless refresh
- ✅ **Route Guards** - Protected routes require authentication

---

## 🎨 Components

### Navbar.vue
Navigation bar with user info and logout functionality.

### TodoModal.vue
Reusable modal for creating and editing todos.

### ConfirmModal.vue
Confirmation dialog for destructive actions.

### ErrorBoundary.vue
Global error handler to catch and display errors gracefully.

---

## 🪝 Composables

### useFormValidation.js
Centralized form validation logic.

```javascript
const { errors, validateField, validateForm } = useFormValidation()

// Validate single field
validateField('username', value, {
  required: true,
  minLength: 3,
  pattern: /^[a-zA-Z0-9_-]+$/
})

// Validate entire form
const isValid = validateForm(formData, rules)
```

### useSanitize.js
XSS protection with DOMPurify.

```javascript
const { sanitize } = useSanitize()

const cleanHtml = sanitize(userInput)
```

---

## 📦 State Management (Pinia)

### Auth Store
Manages user authentication state.

```javascript
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

// Actions
authStore.login(credentials)
authStore.logout()
authStore.register(userData)

// Getters
authStore.isAuthenticated
authStore.user
authStore.token
```

---

## 🛣️ Routing

### Routes
```javascript
- / → redirect to /login or /dashboard
- /login
- /register
- /forgot-password
- /reset-password
- /dashboard (protected)
- /* (404)
```

### Route Guards
```javascript
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})
```

---

## 🌐 API Client

### Axios Configuration
```javascript
// Auto-adds Authorization header
// Auto-refreshes token on 401
// Auto-redirects to /login on auth failure

import api from '@/services/api'

// Usage
const response = await api.get('/todos')
const todo = await api.post('/todos', todoData)
```

---

## 📊 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm test             # Run tests
npm run test:ui      # Run tests with UI
npm run test:coverage # Run tests with coverage
npm run lint         # Lint and fix files
```

---

## 🎯 Best Practices

### Implemented
- ✅ Vue 3 Composition API (no Options API)
- ✅ Reusable composables
- ✅ Centralized state management (Pinia)
- ✅ Modular component design
- ✅ Accessibility (ARIA, keyboard navigation)
- ✅ Error boundaries
- ✅ Form validation
- ✅ XSS protection
- ✅ Responsive design
- ✅ 90%+ test coverage

---

## 🐛 Common Issues

### CORS Errors
Make sure backend is running and CORS is configured:
```javascript
// Backend should allow: https://todo-app-frontend-seven-rho.vercel.app
FRONTEND_URL=https://todo-app-frontend-seven-rho.vercel.app
```

### Token Refresh Loop
Clear sessionStorage and cookies:
```javascript
// In browser console
sessionStorage.clear()
// Then hard refresh (Ctrl+Shift+R)
```

### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## 📖 Testing Examples

### Component Test
```javascript
import { mount } from '@vue/test-utils'
import TodoModal from '@/components/TodoModal.vue'

it('should emit save event with todo data', async () => {
  const wrapper = mount(TodoModal)
  await wrapper.find('#todoTitle').setValue('New Todo')
  await wrapper.find('form').trigger('submit')
  
  expect(wrapper.emitted('save')).toBeTruthy()
})
```

### Composable Test
```javascript
import { useFormValidation } from '@/composables/useFormValidation'

it('should validate username correctly', () => {
  const { validateField } = useFormValidation()
  const isValid = validateField('username', 'ab', {
    required: true,
    minLength: 3
  })
  expect(isValid).toBe(false)
})
```

---

## 🚢 Deployment

### Build for Production
```bash
npm run build
```

Output will be in `dist/` folder.

### Serve with Nginx
```nginx
server {
  listen 80;
  server_name your-domain.com;
  root /path/to/dist;
  
  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

---

## 🎉 Summary

Production-ready frontend with:
- ✅ Modern Vue 3 Composition API
- ✅ Beautiful Bootstrap 5 UI
- ✅ Security best practices
- ✅ 90%+ test coverage
- ✅ Accessibility compliant
- ✅ Responsive design

**Ready to deploy!** 🚀

---

**Need help?** Check [main README](../README.md) or [backend API docs](https://todo-app-xhn2.onrender.com/api/docs/).
