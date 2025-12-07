# Performance Testing with Artillery

This folder contains performance test scenarios using Artillery.

> 📚 **Main Documentation:** See [Main README](../../README.md) for project overview and [Test README](../README.md) for complete testing guide.

## 📊 Test Types

### 1. Load Test (`load-test.yml`)
**Purpose:** Test system behavior under expected normal load
- **Duration:** ~9 minutes
- **Users:** 5-50 concurrent users
- **Phases:**
  - Warm-up (60s, 5 users/sec)
  - Ramp-up (120s, 10→50 users/sec)
  - Sustained load (300s, 50 users/sec)
  - Ramp-down (60s, 50→5 users/sec)

**Run:**
```bash
npm run test:performance
```

### 2. Stress Test (`stress-test.yml`)
**Purpose:** Test system limits and breaking points
- **Duration:** ~9 minutes
- **Users:** 10-300 concurrent users
- **Phases:**
  - Normal baseline (60s, 10 users/sec)
  - Ramp to stress (120s, 10→100 users/sec)
  - Maximum stress (180s, 100→200 users/sec)
  - Extreme stress (120s, 200→300 users/sec)
  - Recovery (60s, 300→10 users/sec)

**Run:**
```bash
npm run test:performance:stress
```

### 3. Spike Test (`spike-test.yml`)
**Purpose:** Test system resilience to sudden traffic spikes
- **Duration:** ~5 minutes
- **Users:** 10-1000 concurrent users
- **Phases:**
  - Normal baseline (60s, 10 users/sec)
  - **SPIKE** (30s, 500 users/sec)
  - Back to normal (60s, 10 users/sec)
  - **LARGER SPIKE** (30s, 1000 users/sec)
  - Recovery (120s, 10 users/sec)

**Run:**
```bash
npm run test:performance:spike
```

### 4. Endurance Test (`endurance-test.yml`)
**Purpose:** Test system stability over extended period
- **Duration:** 1 hour
- **Users:** 20 concurrent users (sustained)

**Run:**
```bash
artillery run performance/scenarios/endurance-test.yml
```

## 🎯 What We're Testing

Each scenario tests multiple endpoints:

1. **User Registration** (10% of load)
   - `POST /api/users/register`

2. **User Login** (30% of load)
   - `POST /api/users/login`

3. **Todo CRUD** (60% of load)
   - `POST /api/todos` (Create)
   - `GET /api/todos` (Read)
   - `PATCH /api/todos/:id` (Update)
   - `DELETE /api/todos/:id` (Delete)

## 📈 Key Metrics

Artillery will report:
- **Response time** (p50, p95, p99)
- **Request rate** (requests/second)
- **Success rate** (%)
- **Error rate** (%)
- **Throughput** (requests completed)

## 🎨 Report Output

After each test, Artillery generates:
1. **Console report** (real-time)
2. **JSON report** (for analysis)
3. **Metrics by endpoint** (breakdown per API route)

## 🚀 Before Running

1. **Start backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Create test user:**
   Register a user with credentials:
   - Username: `testuser`
   - Password: `Test123456`

3. **Run tests:**
   ```bash
   npm run test:performance
   npm run test:performance:stress
   npm run test:performance:spike
   ```

## 📊 Expected Results

### Good Performance Indicators:
- ✅ p95 response time < 500ms
- ✅ p99 response time < 1000ms
- ✅ Error rate < 1%
- ✅ No timeouts
- ✅ Stable memory usage

### Warning Signs:
- ⚠️ p95 > 1000ms
- ⚠️ Error rate > 5%
- ⚠️ Increasing response times over time
- ⚠️ Memory leaks (endurance test)

### Critical Issues:
- ❌ p95 > 3000ms
- ❌ Error rate > 10%
- ❌ System crashes
- ❌ Database connection failures

## 🔧 Tuning Performance

If tests reveal issues:

1. **Database:**
   - Add indexes
   - Optimize queries
   - Connection pooling

2. **Backend:**
   - Enable compression
   - Implement caching
   - Optimize middleware
   - Add rate limiting

3. **Infrastructure:**
   - Scale horizontally
   - Load balancer
   - CDN for static assets

## 📝 Custom Scenarios

To create custom scenarios, see `processors/auth-processor.js` for helper functions.

Example custom scenario:
```yaml
config:
  target: "http://localhost:3000"
  phases:
    - duration: 60
      arrivalRate: 10

scenarios:
  - name: "My Custom Test"
    flow:
      - post:
          url: "/api/users/login"
          json:
            username: "testuser"
            password: "Test123456"
```

