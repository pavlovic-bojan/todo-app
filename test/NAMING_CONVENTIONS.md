# 📝 Naming Conventions - Test Framework

This document explains the naming conventions used in this test framework.

---

## 📁 File Naming

### **Rule: PascalCase for Classes, kebab-case for Everything Else**

#### ✅ **Classes (PascalCase)**
Classes should use **PascalCase** because they represent constructors/classes:

```
page-objects/
├── BasePage.js          ✅ (class BasePage)
├── LoginPage.js         ✅ (class LoginPage)
├── RegisterPage.js      ✅ (class RegisterPage)
└── DashboardPage.js     ✅ (class DashboardPage)
```

**Rationale:** JavaScript convention - classes use PascalCase

---

#### ✅ **Test Files (kebab-case)**
Test files use **kebab-case**:

```
e2e/
├── auth.spec.js         ✅
├── todo.spec.js         ✅
├── validation.spec.js   ✅
└── security.spec.js     ✅
```

**Rationale:** Readable, URL-friendly, Playwright convention

---

#### ✅ **Helpers & Utilities (kebab-case)**
Helper files use **kebab-case**:

```
helpers/
├── api.helper.js        ✅
├── auth.helper.js       ✅
├── db.helper.js         ✅
└── data-generator.js    ✅
```

**Rationale:** Descriptive, URL-friendly, consistent with test files

---

#### ✅ **Fixtures (kebab-case)**
```
fixtures/
├── users.fixture.js     ✅
└── todos.fixture.js     ✅
```

---

#### ✅ **Config Files (kebab-case)**
```
config/
├── allure.config.js     ✅
└── test.config.js       ✅
```

---

## 🏷️ Variable & Function Naming

### **JavaScript Code**

```javascript
// ✅ Classes: PascalCase
class BasePage { }
class LoginPage extends BasePage { }

// ✅ Variables: camelCase
const loginPage = new LoginPage(page)
const userData = { ... }

// ✅ Functions: camelCase
async function loginUser() { }
async function createTodo() { }

// ✅ Constants: UPPER_SNAKE_CASE
const API_BASE_URL = 'http://localhost:3000'
const MAX_RETRIES = 3

// ✅ Private methods: _camelCase (convention)
class BasePage {
  async _internalMethod() { }
}
```

---

## 🧪 Test Naming

### **Test Descriptions**

```javascript
// ✅ Clear, descriptive, present tense
test('should login with valid credentials @smoke @auth', async ({ page }) => {
  // test code
})

// ✅ Start with "should"
test('should show error for invalid credentials', async ({ page }) => {
  // test code
})

// ❌ Avoid vague names
test('login test', async ({ page }) => {  // BAD
  // test code
})
```

---

## 🏷️ Tags

```javascript
// ✅ Lowercase, kebab-case
@smoke
@auth
@todo
@regression
@negative
@validation

// ❌ Avoid CamelCase in tags
@smokTest     // BAD
@Auth         // BAD
```

---

## 📂 Folder Naming

```
test/
├── e2e/              ✅ kebab-case
├── page-objects/     ✅ kebab-case
├── api/              ✅ kebab-case
└── helpers/          ✅ kebab-case
```

---

## 📊 Summary Table

| Type | Convention | Example |
|------|-----------|---------|
| **Classes** | PascalCase | `BasePage.js`, `LoginPage.js` |
| **Test files** | kebab-case | `auth.spec.js`, `todo.spec.js` |
| **Helpers** | kebab-case | `api.helper.js`, `db.helper.js` |
| **Fixtures** | kebab-case | `users.fixture.js` |
| **Config** | kebab-case | `test.config.js` |
| **Variables** | camelCase | `loginPage`, `userData` |
| **Functions** | camelCase | `loginUser()`, `createTodo()` |
| **Constants** | UPPER_SNAKE_CASE | `API_BASE_URL` |
| **Tags** | lowercase | `@smoke`, `@auth` |

---

## ✅ Why This Convention?

1. **Industry Standard:** Matches JavaScript/TypeScript conventions
2. **Readable:** kebab-case is easy to read in file names
3. **Consistent:** Classes are PascalCase everywhere in JS
4. **Tool-Friendly:** Works well with Git, CI/CD, case-sensitive filesystems
5. **Playwright Convention:** Follows Playwright best practices

---

## 🔄 Migration Guide

If you need to change naming:

### To kebab-case for all files:
```bash
# Rename class files
mv BasePage.js base-page.js
mv LoginPage.js login-page.js
```

### To PascalCase for all files:
```bash
# Rename test files
mv auth.spec.js Auth.spec.js
mv todo.spec.js Todo.spec.js
```

**Note:** Current convention (PascalCase for classes, kebab-case for others) is RECOMMENDED and follows industry standards.

---

**Conventions are consistent and follow JavaScript/Playwright best practices!** ✅

