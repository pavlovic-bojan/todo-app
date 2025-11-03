# 🔄 CI/CD Integration Guide

How to integrate the QA framework into your CI/CD pipeline.

---

## 🎯 Overview

This QA framework is **CI/CD ready** and can be integrated into:
- GitHub Actions
- GitLab CI
- Jenkins
- Azure DevOps
- CircleCI
- Travis CI

---

## 🚀 GitHub Actions

### Basic Workflow

Create `.github/workflows/qa-tests.yml`:

```yaml
name: QA Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      # If using external DB, define here
      
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          npm install
          cd backend && npm install
          cd ../frontend && npm install
          cd ../test && npm install
      
      - name: Install Playwright browsers
        run: |
          cd test
          npx playwright install --with-deps
      
      - name: Setup database
        run: |
          cd backend
          npm run prisma:migrate
      
      - name: Start backend
        run: |
          cd backend
          npm run dev &
          sleep 10
      
      - name: Start frontend
        run: |
          cd frontend
          npm run dev &
          sleep 10
      
      - name: Create test user
        run: |
          curl -X POST http://localhost:3000/api/users/register \
            -H "Content-Type: application/json" \
            -d '{
              "username": "testuser",
              "email": "test@example.com",
              "password": "Test123456",
              "role": "client"
            }'
      
      - name: Run smoke tests
        run: |
          cd test
          npm run test:smoke
      
      - name: Run all tests
        run: |
          cd test
          npm test
      
      - name: Generate Allure report
        if: always()
        run: |
          cd test
          npm run report:generate
      
      - name: Upload Allure results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: allure-results
          path: test/allure-results
      
      - name: Upload Allure report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: allure-report
          path: test/allure-report
      
      - name: Upload screenshots
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: screenshots
          path: test/screenshots
      
      - name: Upload videos
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: videos
          path: test/test-results/**/video.webm
```

### Allure Report Publishing

```yaml
      - name: Deploy Allure report to GitHub Pages
        if: always()
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: test/allure-report
          destination_dir: allure-report-${{ github.run_number }}
```

---

## 🦊 GitLab CI

Create `.gitlab-ci.yml`:

```yaml
stages:
  - install
  - test
  - report

variables:
  NODE_VERSION: "18"

install:
  stage: install
  image: node:18
  script:
    - npm install
    - cd backend && npm install
    - cd ../frontend && npm install
    - cd ../test && npm install
  cache:
    paths:
      - node_modules/
      - backend/node_modules/
      - frontend/node_modules/
      - test/node_modules/

test:
  stage: test
  image: mcr.microsoft.com/playwright:latest
  services:
    - name: postgres:14
      alias: postgres
  script:
    - cd backend
    - npm run prisma:migrate
    - npm run dev &
    - sleep 10
    - cd ../frontend
    - npm run dev &
    - sleep 10
    - cd ../test
    - npx playwright install
    - npm run test:smoke
    - npm test
  artifacts:
    when: always
    paths:
      - test/allure-results/
      - test/screenshots/
      - test/videos/
    expire_in: 1 week

report:
  stage: report
  image: node:18
  dependencies:
    - test
  script:
    - cd test
    - npm run report:generate
  artifacts:
    paths:
      - test/allure-report/
    expire_in: 1 month
  only:
    - main
    - develop
```

---

## 🔨 Jenkins

Create `Jenkinsfile`:

```groovy
pipeline {
    agent any
    
    tools {
        nodejs 'NodeJS 18'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh 'npm install'
                sh 'cd backend && npm install'
                sh 'cd frontend && npm install'
                sh 'cd test && npm install'
                sh 'cd test && npx playwright install --with-deps'
            }
        }
        
        stage('Setup Database') {
            steps {
                sh 'cd backend && npm run prisma:migrate'
            }
        }
        
        stage('Start Services') {
            steps {
                sh 'cd backend && npm run dev &'
                sleep 10
                sh 'cd frontend && npm run dev &'
                sleep 10
            }
        }
        
        stage('Create Test User') {
            steps {
                sh '''
                    curl -X POST http://localhost:3000/api/users/register \
                      -H "Content-Type: application/json" \
                      -d '{"username":"testuser","email":"test@example.com","password":"Test123456","role":"client"}'
                '''
            }
        }
        
        stage('Run Tests') {
            parallel {
                stage('Smoke Tests') {
                    steps {
                        sh 'cd test && npm run test:smoke'
                    }
                }
                stage('UI Tests') {
                    steps {
                        sh 'cd test && npm run test:ui'
                    }
                }
                stage('API Tests') {
                    steps {
                        sh 'cd test && npm run test:api'
                    }
                }
                stage('DB Tests') {
                    steps {
                        sh 'cd test && npm run test:db'
                    }
                }
            }
        }
        
        stage('Generate Allure Report') {
            steps {
                sh 'cd test && npm run report:generate'
            }
        }
    }
    
    post {
        always {
            allure includeProperties: false,
                   jdk: '',
                   results: [[path: 'test/allure-results']]
            
            archiveArtifacts artifacts: 'test/screenshots/**,test/videos/**',
                           allowEmptyArchive: true
        }
        
        failure {
            emailext subject: "QA Tests Failed - Build #${BUILD_NUMBER}",
                     body: "Tests failed. Check console output and Allure report.",
                     to: 'team@example.com'
        }
    }
}
```

---

## ☁️ Azure DevOps

Create `azure-pipelines.yml`:

```yaml
trigger:
  - main
  - develop

pool:
  vmImage: 'ubuntu-latest'

variables:
  NODE_VERSION: '18.x'

stages:
- stage: Test
  jobs:
  - job: QA_Tests
    steps:
    - task: NodeTool@0
      inputs:
        versionSpec: $(NODE_VERSION)
      displayName: 'Install Node.js'
    
    - script: |
        npm install
        cd backend && npm install
        cd ../frontend && npm install
        cd ../test && npm install
      displayName: 'Install dependencies'
    
    - script: |
        cd test
        npx playwright install --with-deps
      displayName: 'Install Playwright browsers'
    
    - script: |
        cd backend
        npm run prisma:migrate
      displayName: 'Setup database'
    
    - script: |
        cd backend && npm run dev &
        sleep 10
        cd frontend && npm run dev &
        sleep 10
      displayName: 'Start services'
    
    - script: |
        cd test
        npm run test:smoke
        npm test
      displayName: 'Run tests'
    
    - script: |
        cd test
        npm run report:generate
      displayName: 'Generate Allure report'
      condition: always()
    
    - task: PublishTestResults@2
      inputs:
        testResultsFormat: 'JUnit'
        testResultsFiles: 'test/allure-results/*.xml'
      condition: always()
    
    - task: PublishBuildArtifacts@1
      inputs:
        PathtoPublish: 'test/allure-report'
        ArtifactName: 'allure-report'
      condition: always()
```

---

## 🎯 Best Practices

### 1. Parallel Execution

Run different test types in parallel:
- Smoke tests
- UI tests
- API tests
- DB tests
- Performance tests

### 2. Test Stages

```
1. Smoke tests (fast, critical)
2. Regression tests (comprehensive)
3. Performance tests (optional, nightly)
```

### 3. Failure Handling

- **Always** generate Allure report
- **Always** upload artifacts (screenshots, videos)
- **On failure:** Send notifications
- **On success:** Deploy to staging

### 4. Environment Variables

Set in CI/CD:
```bash
BACKEND_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173
TEST_ENV=ci
HEADLESS=true
```

### 5. Caching

Cache `node_modules/` to speed up builds:
- GitHub Actions: `actions/cache@v3`
- GitLab CI: `cache` directive
- Jenkins: Cache plugin

### 6. Test Reports

Publish Allure reports:
- GitHub: GitHub Pages
- GitLab: GitLab Pages
- Jenkins: Allure plugin
- Azure: Build artifacts

---

## 📊 Performance Optimization

### Speed up CI builds:

1. **Use Docker containers** with pre-installed dependencies
2. **Cache node_modules** and Playwright browsers
3. **Run tests in parallel** using Playwright workers
4. **Use test sharding** for large test suites
5. **Run smoke tests first**, fail fast

### Docker Example

```dockerfile
FROM mcr.microsoft.com/playwright:latest

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

CMD ["npm", "test"]
```

---

## 🔐 Security

### Secrets Management

Store in CI/CD secrets:
- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- API keys

**Never** commit secrets to repository!

---

## 📈 Monitoring

### Metrics to Track

1. **Test success rate**
2. **Test execution time**
3. **Flaky test count**
4. **Code coverage**
5. **Performance trends**

### Allure Trends

Allure automatically tracks:
- Pass/Fail over time
- Duration trends
- Flaky tests

---

## 🎉 Summary

✅ **GitHub Actions** - Ready to use  
✅ **GitLab CI** - Ready to use  
✅ **Jenkins** - Ready to use  
✅ **Azure DevOps** - Ready to use  
✅ **Docker** - Container support  
✅ **Allure** - Auto-published reports  
✅ **Parallel** - Fast execution  
✅ **Artifacts** - Screenshots & videos  

**Your QA framework is CI/CD ready!** 🚀

